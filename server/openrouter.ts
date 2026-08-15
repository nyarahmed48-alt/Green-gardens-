/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The OpenRouter client.
 *
 * One key across many providers, one bill, and models that are free to call.
 * Which model answers is a deployment setting rather than a code change:
 *
 *   OPENROUTER_API_KEY   https://openrouter.ai/keys
 *   OPENROUTER_MODEL     https://openrouter.ai/models
 *
 * Called with plain fetch. Node 20+ has it built in and so do Cloudflare
 * Workers, so there is no SDK in the dependency list and no second code path
 * for the two runtimes.
 *
 * Settings arrive as an argument rather than being read here, because a Worker
 * has no process.env — the values come per request on the `env` binding. That
 * one decision is what lets this file run unchanged on Express, on a Worker,
 * and on both serverless hosts.
 *
 * Nothing in this file is bundled into the browser build. The API key must
 * never reach a visitor.
 */

/** Replies are short by design; most models allow far more. */
const MAX_TOKENS = 1024;

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

/* Serverless platforms kill a function at their own ceiling without warning,
   and what reaches the browser is an HTML error page rather than JSON. So we
   own the deadline: give up first, and answer with real JSON explaining why. */
const ATTEMPT_TIMEOUT_MS = 15_000;
const TOTAL_BUDGET_MS = 24_000;

export interface ProviderSettings {
  apiKey?: string;
  /** One model id, or several comma-separated and tried in order. */
  model?: string;
  /** Override to point at a proxy or a stand-in endpoint. */
  baseUrl?: string;
  /** Optional attribution header OpenRouter uses for its rankings. */
  siteUrl?: string;
}

/** Anything shaped like an env bag: process.env, or a Worker binding. */
export type EnvLike = Record<string, string | undefined>;

const url = (settings: ProviderSettings) =>
  `${(settings.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "")}/chat/completions`;

/**
 * OPENROUTER_MODEL is required and has no default on purpose. Model ids on
 * aggregators are renamed and retired constantly, and a stale hardcoded one
 * fails as "model not found" — an error that points nowhere near the cause.
 * Being unconfigured and saying so is better than guessing.
 *
 * Several ids may be listed, comma-separated, and are tried in order. Free
 * models carry a daily cap; with one id, hitting it takes the concierge silent
 * until somebody notices, and with two the site rides through it.
 */
function config(settings: ProviderSettings) {
  const apiKey = settings.apiKey;
  const models = (settings.model || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  if (!apiKey) return null;
  if (!models.length) {
    console.warn(
      "OPENROUTER_API_KEY is set but OPENROUTER_MODEL is not — pick an id from https://openrouter.ai/models",
    );
    return null;
  }
  return { apiKey, models };
}

/** True once a key and at least one model are configured. */
export const isConfigured = (settings: ProviderSettings): boolean => config(settings) !== null;

/** How many ids are listed — not which. Used by the health endpoint. */
export const modelCount = (settings: ProviderSettings): number =>
  (settings.model || "").split(",").filter((model) => model.trim()).length;

/** Why a call failed, in terms the caller can act on. Never the provider's own
 *  error text: that can quote the prompt back and must not reach a browser. */
export type FailureKind =
  | "quota" // 402/429: out of credit, or over the free daily cap
  | "auth" // 401/403: key missing, revoked, or not permitted
  | "model" // 404/400: the model id is unknown or retired
  | "timeout" // we gave up before the platform could kill us
  | "network"
  | "other";

export class ProviderError extends Error {
  constructor(
    readonly kind: FailureKind,
    readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

function classify(status: number, body: string): FailureKind {
  if (status === 429 || status === 402) return "quota";
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "model";
  // OpenRouter answers 400 for an unknown or malformed model id.
  if (status === 400 && /model/i.test(body)) return "model";
  return "other";
}

/** Worth trying the next model for. An exhausted or retired model is exactly
 *  that; a bad key or our own timeout would fail identically again. */
const worthFallingBackFrom = (kind: FailureKind) =>
  kind === "quota" || kind === "model" || kind === "other";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ReplyRequest {
  system: string;
  messages: ChatTurn[];
  temperature: number;
  maxTokens?: number;
}

export interface ReplyResult {
  text: string;
  /** True when the provider declined on safety grounds rather than failing. */
  refused: boolean;
}

/** One attempt against one model id. Throws ProviderError on any failure. */
async function callModel(
  model: string,
  { system, messages, temperature, maxTokens }: ReplyRequest,
  apiKey: string,
  timeoutMs: number,
  settings: ProviderSettings,
): Promise<ReplyResult> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url(settings), {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        ...(settings.siteUrl ? { "http-referer": settings.siteUrl } : {}),
        "x-title": "Green Gardens",
      },
      /* OpenRouter speaks the OpenAI chat-completions shape: the system prompt
         is the first message rather than a field of its own. */
      body: JSON.stringify({
        model,
        max_tokens: maxTokens ?? MAX_TOKENS,
        temperature,
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal: abort.signal,
    });
  } catch (err: any) {
    if (abort.signal.aborted) {
      throw new ProviderError("timeout", null, `${model} did not answer within ${timeoutMs}ms`);
    }
    throw new ProviderError("network", null, `${model}: ${err?.message || "fetch failed"}`);
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text();
  let payload: any = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    /* A gateway in front of the provider can answer HTML. Fall through and let
       the status decide rather than crashing on the parse. */
  }

  if (!response.ok) {
    throw new ProviderError(
      classify(response.status, raw),
      response.status,
      `${model} → ${response.status}: ${payload?.error?.message || response.statusText}`,
    );
  }

  // OpenRouter can report a provider-side failure inside a 200.
  if (payload?.error) {
    const status = Number(payload.error.code) || 0;
    throw new ProviderError(
      classify(status, raw),
      status || null,
      `${model}: ${payload.error.message || "unknown error"}`,
    );
  }

  const choice = payload?.choices?.[0];
  if (choice?.finish_reason === "content_filter") return { text: "", refused: true };

  return { text: String(choice?.message?.content ?? "").trim(), refused: false };
}

/**
 * One reply from the configured model, falling through the rest of the list if
 * the first cannot answer.
 *
 * Throws ProviderError so the caller can log the detail and show its own
 * message. Provider error strings must never reach the browser, and neither
 * must the model ids.
 */
export async function generateReply(
  request: ReplyRequest,
  settings: ProviderSettings,
): Promise<ReplyResult> {
  const resolved = config(settings);
  if (!resolved) throw new ProviderError("auth", null, "No AI provider configured");

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let last: ProviderError | null = null;

  for (const model of resolved.models) {
    const remaining = deadline - Date.now();
    if (remaining <= 1_000) break; // No room for a real attempt; stop honestly.

    try {
      return await callModel(
        model,
        request,
        resolved.apiKey,
        Math.min(ATTEMPT_TIMEOUT_MS, remaining),
        settings,
      );
    } catch (err) {
      const error = err instanceof ProviderError ? err : new ProviderError("other", null, String(err));
      last = error;
      if (!worthFallingBackFrom(error.kind)) throw error;
      // Log every skipped model: this is the breadcrumb that explains an outage.
      console.warn(`Falling back past ${model} (${error.kind}): ${error.message}`);
    }
  }

  throw last ?? new ProviderError("timeout", null, "Ran out of time before any model answered");
}
