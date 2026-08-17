/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Every environment variable this project reads, read in one place.
 *
 * There is only one group left: OPENROUTER_API_KEY and OPENROUTER_MODEL, for
 * Green AI. Site-visit requests go to Netlify Forms straight from the browser,
 * so this project holds no mail credentials at all — nothing to configure and
 * nothing to leak.
 *
 * Both are optional, and unset is a supported state rather than an error:
 * Green AI says it is not switched on rather than pretending.
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

/* ================================================================ crawl === */

export interface CrawlSettings {
  /** Pages to read. Empty means the crawler is switched off. */
  urls: string[];
  /** Ceiling on pages fetched per crawl, start pages plus what they link to. */
  maxPages: number;
  /** How long a crawl result stands before it is fetched again. */
  ttlMinutes: number;
}

/**
 * What Green AI should read, beyond the page's own copy.
 *
 * Off unless CRAWL_URLS names something. The concierge is already grounded in
 * the site's content without it (see server/knowledge.ts), so an unconfigured
 * crawler costs a deployment nothing.
 */
export function crawlSettings(env: EnvLike): CrawlSettings {
  const maxPages = Number(first(env.CRAWL_MAX_PAGES) || 8);
  const ttlMinutes = Number(first(env.CRAWL_TTL_MINUTES) || 60);

  return {
    urls: list(first(env.CRAWL_URLS)),
    // Guard the numbers: a typo in a dashboard field should not mean an
    // unbounded crawl or one that refetches on every single message.
    maxPages: Number.isFinite(maxPages) ? Math.min(Math.max(1, maxPages), 25) : 8,
    ttlMinutes: Number.isFinite(ttlMinutes) ? Math.min(Math.max(5, ttlMinutes), 1440) : 60,
  };
}
