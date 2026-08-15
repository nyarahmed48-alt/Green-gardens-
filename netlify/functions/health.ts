/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Netlify function backing GET /api/health. States only. */

import { health } from "../../server/chat";
import { mailReadiness, mailSettings, providerSettings, type EnvLike } from "../../server/settings";

export default async function handler(): Promise<Response> {
  const env = process.env as EnvLike;
  const mail = mailSettings(env);
  return new Response(
    JSON.stringify(health(providerSettings(env), mailReadiness(mail), mail.transport, mail.to.length)),
    { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } },
  );
}
