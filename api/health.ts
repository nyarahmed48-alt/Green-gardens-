/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Vercel serverless function backing GET /api/health. States only. */

import { health } from "../server/chat";
import { crawlSettings, mailReadiness, mailSettings, providerSettings, type EnvLike } from "../server/settings";

export default async function handler(_req: any, res: any) {
  const env = process.env as EnvLike;
  const mail = mailSettings(env);
  res.setHeader("cache-control", "no-store");
  return res
    .status(200)
    .json(health(providerSettings(env), mailReadiness(mail), mail.transport, mail.to.length, crawlSettings(env)));
}
