/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cloudflare Worker entry point — the whole site.
 *
 * Static assets come from the ASSETS binding; everything under /api is handled
 * here. The concierge and the reservation flow are unchanged and still live in
 * server/, shared with the Express server used for local development.
 *
 * Note which mailer this passes: sendMail, not sendMailNode. A Worker has no
 * TCP sockets, so SMTP cannot run here — configure RESEND_API_KEY for
 * Cloudflare deployments. The reservation endpoint says exactly that if you
 * configure SMTP anyway, rather than failing obscurely.
 *
 * Note also run_worker_first in wrangler.toml. Without it, typing an API URL
 * into the address bar counts as a navigation and Cloudflare would answer with
 * the page shell before this Worker ever ran.
 */

import { handleChat, health } from "../server/chat";
import { handleReservation } from "../server/reservations";
import { sendMail } from "../server/mail";
import { mailReadiness, mailSettings, providerSettings, type EnvLike } from "../server/settings";

export interface Env {
  /** Static assets binding — the built site. */
  ASSETS: { fetch: (request: Request) => Promise<Response> };

  /* All optional. Unset means the matching half reports itself switched off
     rather than failing. Documented in README.md and .env.example. */
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_BASE_URL?: string;
  SITE_URL?: string;
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
  MAIL_FROM?: string;
  MAIL_TO?: string;
  MAIL_BCC?: string;
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const bag = env as unknown as EnvLike;

  if (url.pathname === "/api/health") {
    const mail = mailSettings(bag);
    return json(health(providerSettings(bag), mailReadiness(mail), mail.transport, mail.to.length), 200, {
      "cache-control": "no-store",
    });
  }

  const isChat = url.pathname === "/api/chat";
  const isReservation = url.pathname === "/api/reservations";
  if (!isChat && !isReservation) return json({ error: "NOT_FOUND" }, 404);

  if (request.method !== "POST") {
    return json({ error: "METHOD_NOT_ALLOWED" }, 405, { allow: "POST" });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "BAD_JSON", message: "Could not read that request." }, 400);
  }

  if (isChat) {
    const { message, history, lang } = payload ?? {};
    const { status, body } = await handleChat({ message, history, lang, settings: providerSettings(bag) });
    return json(body, status);
  }

  const { status, body } = await handleReservation({
    payload: payload ?? {},
    settings: mailSettings(bag),
    send: sendMail,
  });
  return json(body, status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, url);
    return env.ASSETS.fetch(request);
  },
};
