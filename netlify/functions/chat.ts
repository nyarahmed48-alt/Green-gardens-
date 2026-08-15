/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Netlify function backing POST /api/chat — see the redirects in netlify.toml
 * and public/_redirects. The concierge is shared with every other deployment
 * target; only the transport differs.
 */

import { handleChat } from "../../server/chat";
import { crawlSettings, providerSettings, type EnvLike } from "../../server/settings";

const JSON_HEADERS = { "content-type": "application/json" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { ...JSON_HEADERS, allow: "POST" },
    });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "BAD_JSON", message: "Could not read that request." }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const { message, history, lang } = payload ?? {};
  const { status, body } = await handleChat({
    message,
    history,
    lang,
    settings: providerSettings(process.env as EnvLike),
    crawl: crawlSettings(process.env as EnvLike),
  });

  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
