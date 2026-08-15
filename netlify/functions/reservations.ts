/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Netlify function backing POST /api/reservations.
 *
 * Netlify functions run on Node, so SMTP is available here. The default
 * function timeout is 10 seconds — plenty for a submission handshake, but if a
 * slow mail host ever pushes against it, move to the HTTP transport
 * (RESEND_API_KEY) rather than raising the timeout.
 */

import { handleReservation } from "../../server/reservations";
import { sendMailNode } from "../../server/mail-node";
import { mailSettings, type EnvLike } from "../../server/settings";

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

  const { status, body } = await handleReservation({
    payload: payload ?? {},
    settings: mailSettings(process.env as EnvLike),
    send: sendMailNode,
  });

  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
