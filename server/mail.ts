/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sending mail, on every runtime this site deploys to.
 *
 * Three transports, chosen by configuration rather than by code (see
 * server/settings.ts):
 *
 *   resend   HTTP. Works everywhere, including Cloudflare Workers.
 *   brevo    HTTP. The same, for anyone who already has a Brevo account.
 *   smtp     Raw sockets. Node only — Express, Vercel, Netlify, Cloud Run.
 *
 * SMTP is the one most clients ask for, because it is the box their existing
 * mailbox already gives them, and it is also the one that cannot run on a
 * Worker: Workers have no TCP sockets. Rather than pretend otherwise, the SMTP
 * sender is *injected* — server/mail-node.ts supplies it on Node, the
 * Worker does not, and asking for SMTP on a Worker fails with a sentence that
 * tells you to use an HTTP transport instead.
 *
 * That is why this file imports nothing from node: it is the copy the Worker
 * bundles.
 */

import type { MailSettings, MailTransport, SmtpConfig } from "./settings";
import { mailReadiness } from "./settings";

export interface OutgoingMail {
  from: string;
  to: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
}

/** The shape server/smtp.ts implements, kept as a type so this file
 *  never reaches for it on a runtime that cannot load it. */
export type SmtpSender = (config: SmtpConfig, mail: OutgoingMail) => Promise<void>;

export class MailError extends Error {
  constructor(readonly transport: MailTransport, message: string) {
    super(message);
    this.name = "MailError";
  }
}

/** Splits "Green Gardens <hello@example.com>" for APIs that want the halves. */
export function parseAddress(raw: string): { email: string; name?: string } {
  const match = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (!match) return { email: raw.trim() };
  return { email: match[2].trim(), name: match[1].replace(/^"|"$/g, "").trim() || undefined };
}

const HTTP_TIMEOUT_MS = 12_000;

/** POST with a deadline. A mail API that hangs must not hold the request open
 *  until the platform kills the function and the guest sees an HTML error. */
async function postJson(url: string, headers: Record<string, string>, body: unknown, transport: MailTransport) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), HTTP_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: abort.signal,
    });
  } catch (err: any) {
    throw new MailError(
      transport,
      abort.signal.aborted ? "The mail provider did not respond in time." : `Could not reach the mail provider: ${err?.message || err}`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 400);
    throw new MailError(transport, `${transport} refused the message (${response.status}): ${detail}`);
  }
}

async function sendViaResend(mail: OutgoingMail, apiKey: string) {
  await postJson(
    "https://api.resend.com/emails",
    { authorization: `Bearer ${apiKey}` },
    {
      from: mail.from,
      to: mail.to,
      ...(mail.bcc?.length ? { bcc: mail.bcc } : {}),
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      subject: mail.subject,
      text: mail.text,
      ...(mail.html ? { html: mail.html } : {}),
    },
    "resend",
  );
}

async function sendViaBrevo(mail: OutgoingMail, apiKey: string) {
  const sender = parseAddress(mail.from);
  await postJson(
    "https://api.brevo.com/v3/smtp/email",
    { "api-key": apiKey },
    {
      sender: { email: sender.email, ...(sender.name ? { name: sender.name } : {}) },
      to: mail.to.map((address) => parseAddress(address)),
      ...(mail.bcc?.length ? { bcc: mail.bcc.map((address) => parseAddress(address)) } : {}),
      ...(mail.replyTo ? { replyTo: parseAddress(mail.replyTo) } : {}),
      subject: mail.subject,
      textContent: mail.text,
      ...(mail.html ? { htmlContent: mail.html } : {}),
    },
    "brevo",
  );
}

/**
 * Send one message with whichever transport is configured.
 *
 * Throws MailError with something a person can act on. Callers decide what the
 * visitor sees — provider error text is for the log, never for the browser.
 */
export async function sendMail(
  mail: OutgoingMail,
  settings: MailSettings,
  deps: { smtp?: SmtpSender } = {},
): Promise<void> {
  const readiness = mailReadiness(settings);
  if (!readiness.ready) throw new MailError(settings.transport, readiness.reason!);

  switch (settings.transport) {
    case "resend":
      return sendViaResend(mail, settings.apiKey!);
    case "brevo":
      return sendViaBrevo(mail, settings.apiKey!);
    case "smtp": {
      if (!deps.smtp) {
        throw new MailError(
          "smtp",
          "SMTP needs raw sockets, which this runtime does not have — Cloudflare Workers is the usual case. Set RESEND_API_KEY to send over HTTP instead.",
        );
      }
      return deps.smtp(settings.smtp!, mail);
    }
    case "none":
      throw new MailError("none", readiness.reason ?? "No mail transport configured.");
  }
}
