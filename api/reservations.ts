/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Vercel serverless function backing POST /api/reservations.
 *
 * Uses the Node mailer, so SMTP works here — Vercel functions run on Node and
 * can open a socket. That is the one difference from the Cloudflare Worker,
 * which passes the socket-free mailer instead.
 */

import { handleReservation } from "../server/reservations";
import { sendMailNode } from "../server/mail-node";
import { mailSettings, type EnvLike } from "../server/settings";

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

  const { status, body } = await handleReservation({
    payload,
    settings: mailSettings(process.env as EnvLike),
    send: sendMailNode,
  });
  return res.status(status).json(body);
}
