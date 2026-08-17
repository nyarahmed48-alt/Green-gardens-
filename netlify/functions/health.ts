/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Netlify function backing GET /api/health. States only. */

import { health } from "../../server/chat";
import { crawlSettings, providerSettings, type EnvLike } from "../../server/settings";

export default async function handler(): Promise<Response> {
  const env = process.env as EnvLike;
  return new Response(JSON.stringify(health(providerSettings(env), crawlSettings(env))), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
