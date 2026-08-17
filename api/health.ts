/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Vercel serverless function backing GET /api/health. States only. */

import { health } from "../server/chat";
import { crawlSettings, providerSettings, type EnvLike } from "../server/settings";

export default async function handler(_req: any, res: any) {
  const env = process.env as EnvLike;
  res.setHeader("cache-control", "no-store");
  return res.status(200).json(health(providerSettings(env), crawlSettings(env)));
}
