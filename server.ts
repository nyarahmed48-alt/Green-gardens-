/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The Green Gardens server.
 *
 * Serves the site and answers its two endpoints. In development it hands
 * static serving to Vite so the page hot-reloads; in production it serves the
 * built dist/ and falls back to index.html.
 *
 * The concierge, the reservation flow and the mailer all live under server/
 * and are shared with every other deployment target. This file adds only what
 * a long-lived server has that a serverless function does not: routing, the
 * client's IP, and throttling that can actually count.
 */

import express from "express";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { handleChat, health } from "./server/chat";
import { handleReservation } from "./server/reservations";
import { sendMailNode } from "./server/mail-node";
import { mailReadiness, mailSettings, providerSettings, type EnvLike } from "./server/settings";

dotenv.config();

const app = express();

/* Most hosts inject the port to listen on and health-check the container
   against it. Falling back to 3000 keeps local development unchanged. */
const PORT = Number(process.env.PORT) || 3000;
const DEV = process.env.NODE_ENV !== "production";

app.use(express.json({ limit: "64kb" }));

/** The env bag the server modules read. On a Worker this arrives per request;
 *  here it is the process, once. */
const env = (): EnvLike => process.env as EnvLike;

const clientIp = (req: express.Request): string =>
  String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
  req.socket.remoteAddress ||
  "unknown";

/**
 * A per-IP hourly budget, one counter per named bucket.
 *
 * Both endpoints are unauthenticated by design, so both need a ceiling — but
 * different ones. A visitor may reasonably ask the concierge twenty questions;
 * nobody makes twenty reservations in an hour.
 */
const usage = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;

function rateLimit(bucket: string, ip: string, max: number): { ok: boolean; retryInMin: number } {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = usage.get(key);

  if (!entry || now > entry.resetAt) {
    usage.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryInMin: 0 };
  }
  if (entry.count >= max) return { ok: false, retryInMin: Math.ceil((entry.resetAt - now) / 60000) };
  entry.count += 1;
  return { ok: true, retryInMin: 0 };
}

// Drop expired entries hourly so the map cannot grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of usage) {
    if (now > entry.resetAt) usage.delete(key);
  }
}, WINDOW_MS).unref?.();

/** Picks the visitor's language for the throttle messages, which are written
 *  here rather than in the handlers the request never reaches. */
const say = (lang: unknown, choices: { ar: string; ckb: string; en: string }) =>
  lang === "en" || lang === "ckb" ? choices[lang] : choices.ar;

/* ============================================================== the API === */

app.post("/api/chat", async (req, res) => {
  const limit = rateLimit("chat", clientIp(req), 40);
  if (!limit.ok) {
    return res.status(429).json({
      error: "RATE_LIMITED",
      message: say(req.body?.lang, {
        ar: `وصلت إلى حد الرسائل لهذه الساعة. حاول بعد ${limit.retryInMin} دقيقة، أو أرسل طلب حجز من النموذج.`,
        ckb: `گەیشتوویتە سنووری نامەکانی ئەم کاتژمێرە. دوای ${limit.retryInMin} خولەک هەوڵ بدەرەوە، یان لە فۆرمەکەوە داواکاریی حجز بنێرە.`,
        en: `You've reached this hour's message limit. Try again in ${limit.retryInMin} minutes, or send a request through the reservation form.`,
      }),
    });
  }

  const { message, history, lang } = req.body || {};
  const { status, body } = await handleChat({ message, history, lang, settings: providerSettings(env()) });
  res.status(status).json(body);
});

app.post("/api/reservations", async (req, res) => {
  const limit = rateLimit("reservations", clientIp(req), 8);
  if (!limit.ok) {
    return res.status(429).json({
      error: "RATE_LIMITED",
      message: say(req.body?.lang, {
        ar: "وصلتنا عدة طلبات منك للتو. إن لم يصلك تأكيد، تواصل معنا مباشرة.",
        ckb: "چەند داواکارییەکمان لێت پێگەیشت. ئەگەر دڵنیاییت پێنەگەیشت، ڕاستەوخۆ پەیوەندیمان پێوە بکە.",
        en: "We've just had several requests from you. If no confirmation arrived, contact us directly.",
      }),
    });
  }

  const { status, body } = await handleReservation({
    payload: req.body || {},
    settings: mailSettings(env()),
    send: sendMailNode,
  });
  res.status(status).json(body);
});

/* Which half is configured, as a URL. States only — no key, no model id. */
app.get("/api/health", (_req, res) => {
  const mail = mailSettings(env());
  res
    .set("cache-control", "no-store")
    .json(health(providerSettings(env()), mailReadiness(mail), mail.transport, mail.to.length));
});

/* An unknown /api path must answer JSON rather than falling through to the
   page — the browser checks the content type to tell a missing endpoint from
   a broken one. */
app.use("/api", (_req, res) => res.status(404).json({ error: "NOT_FOUND" }));

/* ========================================================== the website === */

async function start() {
  if (DEV) {
    /* Imported here rather than at the top so `vite` stays a dev dependency:
       a production install without it must still boot. */
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), "dist");
    if (!fs.existsSync(dist)) {
      console.error("dist/ is missing — run `npm run build` before starting in production.");
      process.exit(1);
    }
    app.use(express.static(dist));
    app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Green Gardens running at http://localhost:${PORT}`);
  });
}

start();
