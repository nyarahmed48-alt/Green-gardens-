/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Every environment variable this project reads, read in one place.
 *
 * Two independent groups:
 *
 *   the concierge      OPENROUTER_API_KEY, OPENROUTER_MODEL
 *   the mail it sends  MAIL_TO / MAIL_FROM, plus SMTP_* or RESEND_API_KEY
 *
 * Both are optional and both treat being unset as a supported state rather
 * than an error: the concierge says it is not switched on, and the reservation
 * endpoint says the desk is not connected. Neither pretends.
 *
 * Settings are read from an env bag passed in by the caller rather than from
 * process.env here, because Cloudflare Workers have no process — the values
 * arrive per request on the `env` binding. Taking a bag as an argument is what
 * lets one copy of this run on all four hosts.
 */

import type { EnvLike, ProviderSettings } from "./openrouter";

export type { EnvLike };

/** First non-empty value, trimmed. A blank counts as unset, because a hosting
 *  dashboard writes an empty string where you meant to write nothing. */
const first = (...values: Array<string | undefined>): string | undefined => {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
};

/** Anything but an explicit false/0/no/off counts as on. */
const flag = (raw: string | undefined, fallback: boolean): boolean => {
  const value = raw?.trim().toLowerCase();
  if (!value) return fallback;
  return !["false", "0", "no", "off"].includes(value);
};

const list = (raw?: string): string[] =>
  (raw || "")
    .split(/[,;]/)
    .map((address) => address.trim())
    .filter(Boolean);

/** What the concierge talks to. */
export function providerSettings(env: EnvLike): ProviderSettings {
  return {
    apiKey: first(env.OPENROUTER_API_KEY),
    model: first(env.OPENROUTER_MODEL),
    baseUrl: first(env.OPENROUTER_BASE_URL),
    siteUrl: first(env.SITE_URL, env.OPENROUTER_SITE_URL),
  };
}

/* ================================================================= mail === */

/** How outgoing mail leaves the building. */
export type MailTransport = "smtp" | "resend" | "brevo" | "none";

export interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  /** True for implicit TLS (port 465). False starts plain and upgrades. */
  secure: boolean;
}

export interface MailSettings {
  transport: MailTransport;
  /** Envelope sender. Must be an address the transport may send as. */
  from: string;
  /** The venue's own desk — every reservation lands here. */
  to: string[];
  /** Copied on every reservation. Usually nobody. */
  bcc: string[];
  /** Send the guest their own copy when they gave an address. */
  confirmGuest: boolean;
  smtp?: SmtpConfig;
  apiKey?: string;
}

/**
 * Read the mail configuration.
 *
 * The transport picks itself unless MAIL_TRANSPORT names one: an HTTP provider
 * key if there is one, SMTP if there is a host, and "none" otherwise.
 */
export function mailSettings(env: EnvLike): MailSettings {
  const resendKey = first(env.RESEND_API_KEY);
  const brevoKey = first(env.BREVO_API_KEY);
  const smtpHost = first(env.SMTP_HOST);
  const smtpUser = first(env.SMTP_USER);
  const smtpPass = first(env.SMTP_PASS);
  const smtpPort = Number(first(env.SMTP_PORT) || 587);

  const named = first(env.MAIL_TRANSPORT)?.toLowerCase();
  const transport: MailTransport =
    named === "smtp" || named === "resend" || named === "brevo" || named === "none"
      ? named
      : resendKey
        ? "resend"
        : brevoKey
          ? "brevo"
          : smtpHost
            ? "smtp"
            : "none";

  /* Port 465 is implicit TLS; everything else starts plain and upgrades with
     STARTTLS. Overridable, because a few providers wire it differently. */
  const secure = flag(first(env.SMTP_SECURE), smtpPort === 465);

  return {
    transport,
    from: first(env.MAIL_FROM, smtpUser) || "reservations@greengardens.example",
    to: list(first(env.MAIL_TO)),
    bcc: list(first(env.MAIL_BCC)),
    confirmGuest: flag(first(env.MAIL_CONFIRM_GUEST), true),
    apiKey: transport === "resend" ? resendKey : transport === "brevo" ? brevoKey : undefined,
    smtp: smtpHost
      ? { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass, secure }
      : undefined,
  };
}

/**
 * Whether mail can actually be sent, and if not, what is missing.
 *
 * Checked before a reservation is accepted and reported by the health
 * endpoint, so a misconfigured deployment is a sentence somebody can read
 * rather than a booking that silently goes nowhere.
 */
export function mailReadiness(settings: MailSettings): { ready: boolean; reason?: string } {
  if (!settings.to.length) {
    return { ready: false, reason: "MAIL_TO is not set — there is no address to send reservations to." };
  }
  switch (settings.transport) {
    case "none":
      return {
        ready: false,
        reason:
          "No mail transport configured. Set SMTP_HOST (with user and password) for SMTP, or RESEND_API_KEY to send over HTTP.",
      };
    case "smtp":
      if (!settings.smtp?.host) return { ready: false, reason: "SMTP_HOST is not set." };
      return { ready: true };
    case "resend":
    case "brevo":
      if (!settings.apiKey) {
        return { ready: false, reason: `The ${settings.transport} transport is selected but its API key is not set.` };
      }
      return { ready: true };
  }
}
