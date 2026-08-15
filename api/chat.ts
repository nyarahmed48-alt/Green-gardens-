/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Vercel serverless function backing POST /api/chat.
 *
 * The concierge lives in server/chat.ts and is shared with every other
 * deployment target; only the transport differs.
 *
 * Unlike the Express server there is no per-IP throttle here: serverless
 * invocations share no memory, so an in-memory counter would count nothing.
 * The message cap still applies. Put Vercel's own rate limiting in front of
 * this endpoint if it gets abused.
 */

import { handleChat } from "../server/chat";
import { crawlSettings, providerSettings, type EnvLike } from "../server/settings";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  let payload = req.body ?? {};
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return res.status(400).json({ error: "BAD_JSON", message: "Could not read that request." });
    }
  }

  const { message, history, lang } = payload;
  const { status, body } = await handleChat({
    message,
    history,
    lang,
    settings: providerSettings(process.env as EnvLike),
    crawl: crawlSettings(process.env as EnvLike),
  });
  return res.status(status).json(body);
}
