/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A small SMTP client, for the Node runtimes only.
 *
 * Why hand-written rather than a library: this repository has a standing habit
 * of not adding an SDK for a protocol it uses in one place — OpenRouter is
 * called with bare fetch for the same reason. SMTP submission is a dozen
 * commands, and a dependency here would be a dependency in every deployment
 * target including the ones that can never run it.
 *
 * Because it needs raw sockets it CANNOT run on Cloudflare Workers, which is
 * the whole reason server/mail.ts takes the SMTP sender as an injected
 * argument instead of importing this file. Only server/mail-node.ts
 * imports it, and only Node entry points import that. A Worker bundle that
 * pulled node:net in would fail to build, which is the failure mode this
 * separation exists to prevent.
 *
 * Supports what a submission server actually asks for: implicit TLS on 465,
 * STARTTLS on 587, AUTH PLAIN or LOGIN, and UTF-8 bodies — the last of which
 * matters here, because a guest's name and notes arrive in Arabic or Kurdish.
 */

import net from "node:net";
import tls from "node:tls";
import os from "node:os";
import type { SmtpConfig } from "./settings";
import type { OutgoingMail } from "./mail";

/** Whole-conversation ceiling. A submission server that stops answering must
 *  not hold a serverless invocation open until the platform kills it. */
const SOCKET_TIMEOUT_MS = 20_000;

class SmtpError extends Error {
  constructor(message: string, readonly code?: number) {
    super(message);
    this.name = "SmtpError";
  }
}

/**
 * One connection's worth of protocol state.
 *
 * SMTP is strictly lock-step — one command, one reply — so a queue of pending
 * readers is enough, and the buffer only has to know where a reply ends: a
 * line whose fourth character is a space rather than a hyphen.
 */
class Session {
  private buffer = "";
  private pending: Array<{
    resolve: (reply: { code: number; text: string }) => void;
    reject: (err: Error) => void;
  }> = [];
  private failure: Error | null = null;

  constructor(private socket: net.Socket | tls.TLSSocket) {
    this.attach(socket);
  }

  /** Point the parser at a socket. Called again after a STARTTLS upgrade. */
  attach(socket: net.Socket | tls.TLSSocket) {
    this.socket = socket;
    socket.setEncoding("utf8");
    socket.setTimeout(SOCKET_TIMEOUT_MS);
    socket.on("data", (chunk: string) => this.consume(chunk));
    socket.on("error", (err) => this.fail(err));
    socket.on("timeout", () => this.fail(new SmtpError("The mail server stopped responding.")));
    socket.on("close", () => this.fail(new SmtpError("The mail server closed the connection.")));
  }

  /** Detach handlers before handing the socket to tls.connect for an upgrade. */
  detach() {
    this.socket.removeAllListeners("data");
    this.socket.removeAllListeners("error");
    this.socket.removeAllListeners("timeout");
    this.socket.removeAllListeners("close");
  }

  private fail(err: Error) {
    /* Only the first failure is interesting: a socket error is normally
       followed by a close, and reporting "connection closed" would bury the
       error that actually explains it. */
    if (!this.failure) this.failure = err;
    while (this.pending.length) this.pending.shift()!.reject(this.failure);
  }

  private consume(chunk: string) {
    this.buffer += chunk;

    for (;;) {
      const end = this.completeReplyEnd();
      if (end < 0) return;

      const raw = this.buffer.slice(0, end);
      this.buffer = this.buffer.slice(end + 2);

      const code = Number(raw.slice(0, 3));
      const waiter = this.pending.shift();
      if (waiter) waiter.resolve({ code, text: raw });
    }
  }

  /** Index of the CRLF ending a complete reply, or -1 while more is coming. */
  private completeReplyEnd(): number {
    let start = 0;
    for (;;) {
      const eol = this.buffer.indexOf("\r\n", start);
      if (eol < 0) return -1;
      // "250-EXTENSION" continues; "250 OK" is the last line of the reply.
      if (this.buffer[start + 3] !== "-") return eol;
      start = eol + 2;
    }
  }

  /** Wait for the next reply, insisting on one of the expected codes. */
  private read(expected: number[]): Promise<{ code: number; text: string }> {
    if (this.failure) return Promise.reject(this.failure);
    return new Promise((resolve, reject) => {
      this.pending.push({
        resolve: (reply) => {
          if (expected.includes(reply.code)) resolve(reply);
          else reject(new SmtpError(reply.text.trim(), reply.code));
        },
        reject,
      });
    });
  }

  /** Send a command and wait for its reply. */
  send(line: string, expected: number[]): Promise<{ code: number; text: string }> {
    const reply = this.read(expected);
    this.socket.write(`${line}\r\n`);
    return reply;
  }

  /** Wait for a reply nothing was sent to prompt — the opening greeting. */
  greeting(): Promise<{ code: number; text: string }> {
    return this.read([220]);
  }

  /** Write the message body, already dot-stuffed and CRLF-terminated. */
  writeBody(body: string): Promise<{ code: number; text: string }> {
    const reply = this.read([250]);
    this.socket.write(body);
    return reply;
  }

  end() {
    /* Best effort: the mail is accepted at the 250 after DATA, so whatever
       happens from here the message is delivered.

       QUIT then a half-close, rather than destroying the socket outright —
       tearing it down mid-flight makes the server see a connection reset and
       log a failed session for a delivery that in fact succeeded. The timer
       is the backstop for a server that never answers QUIT, and is unref'd so
       it cannot hold a Node process open on its own. */
    try {
      this.socket.write("QUIT\r\n");
      this.socket.end();
    } catch {
      /* Already gone. Nothing left to close politely. */
    }
    const timer = setTimeout(() => this.socket.destroy(), 2_000);
    timer.unref?.();
  }
}

const connectPlain = (config: SmtpConfig): Promise<net.Socket> =>
  new Promise((resolve, reject) => {
    const socket = net.connect({ host: config.host, port: config.port });
    socket.once("connect", () => resolve(socket));
    socket.once("error", reject);
  });

const connectTls = (config: SmtpConfig, socket?: net.Socket): Promise<tls.TLSSocket> =>
  new Promise((resolve, reject) => {
    const upgraded = tls.connect({ host: config.host, port: config.port, servername: config.host, socket });
    upgraded.once("secureConnect", () => resolve(upgraded));
    upgraded.once("error", reject);
  });

/** RFC 2047, so a subject with Arabic in it survives the header. */
const encodeHeader = (value: string): string =>
  /^[\x20-\x7e]*$/.test(value)
    ? value
    : `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;

/** Base64 wrapped at 76 characters, as the transfer encoding requires. */
const encodeBody = (value: string): string =>
  (Buffer.from(value, "utf8").toString("base64").match(/.{1,76}/g) ?? []).join("\r\n");

/**
 * The message itself.
 *
 * Base64 throughout rather than quoted-printable: the bodies carry Arabic and
 * Kurdish, and base64 sidesteps line-length limits and the leading-dot rule in
 * one move — a body line starting with "." would otherwise end the DATA
 * section early.
 */
function buildMessage(mail: OutgoingMail): string {
  const boundary = `gg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const headers = [
    `From: ${mail.from}`,
    `To: ${mail.to.join(", ")}`,
    mail.replyTo ? `Reply-To: ${mail.replyTo}` : null,
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${boundary}@green-gardens>`,
    "MIME-Version: 1.0",
  ].filter(Boolean) as string[];

  if (!mail.html) {
    return [
      ...headers,
      'Content-Type: text/plain; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
      "",
      encodeBody(mail.text),
      ".",
      "",
    ].join("\r\n");
  }

  return [
    ...headers,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeBody(mail.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="utf-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodeBody(mail.html),
    `--${boundary}--`,
    ".",
    "",
  ].join("\r\n");
}

/** Extracts the bare address from "Name <a@b.c>" for the envelope. */
const envelope = (address: string): string => {
  const match = address.match(/<([^>]+)>/);
  return match ? match[1].trim() : address.trim();
};

async function authenticate(session: Session, capabilities: string, config: SmtpConfig) {
  if (!config.user || !config.pass) return;

  const supports = (mechanism: string) =>
    new RegExp(`AUTH[^\\r\\n]*\\b${mechanism}\\b`, "i").test(capabilities);

  /* PLAIN first: one round trip rather than three. LOGIN is the fallback
     because some older servers advertise only that. If neither is advertised
     we still try PLAIN — a server that wants no auth will say so, and that is
     a clearer error than refusing to try. */
  if (supports("LOGIN") && !supports("PLAIN")) {
    await session.send("AUTH LOGIN", [334]);
    await session.send(Buffer.from(config.user, "utf8").toString("base64"), [334]);
    await session.send(Buffer.from(config.pass, "utf8").toString("base64"), [235]);
    return;
  }

  const token = Buffer.from(`\0${config.user}\0${config.pass}`, "utf8").toString("base64");
  await session.send(`AUTH PLAIN ${token}`, [235]);
}

/**
 * Deliver one message. Resolves when the server has accepted it, throws
 * SmtpError with the server's own reply otherwise.
 */
export async function sendViaSmtp(config: SmtpConfig, mail: OutgoingMail): Promise<void> {
  const recipients = [...mail.to, ...(mail.bcc ?? [])].map(envelope).filter(Boolean);
  if (!recipients.length) throw new SmtpError("No recipients.");

  let socket: net.Socket | tls.TLSSocket = config.secure
    ? await connectTls(config)
    : await connectPlain(config);

  const session = new Session(socket);
  const hostname = os.hostname() || "localhost";

  try {
    await session.greeting();
    let { text: capabilities } = await session.send(`EHLO ${hostname}`, [250]);

    /* STARTTLS on a plain connection. Credentials must never cross a socket
       that was never upgraded, so a server that cannot offer it is refused
       rather than downgraded to plaintext auth. */
    if (!config.secure) {
      if (!/STARTTLS/i.test(capabilities)) {
        if (config.user || config.pass) {
          throw new SmtpError(
            `${config.host} does not offer STARTTLS, so credentials cannot be sent safely. Use port 465 with SMTP_SECURE=true.`,
          );
        }
      } else {
        await session.send("STARTTLS", [220]);
        session.detach();
        socket = await connectTls(config, socket as net.Socket);
        session.attach(socket);
        // Capabilities are re-advertised after the upgrade, and only the
        // second set is trustworthy.
        ({ text: capabilities } = await session.send(`EHLO ${hostname}`, [250]));
      }
    }

    await authenticate(session, capabilities, config);

    await session.send(`MAIL FROM:<${envelope(mail.from)}>`, [250]);
    for (const recipient of recipients) {
      await session.send(`RCPT TO:<${recipient}>`, [250, 251]);
    }
    await session.send("DATA", [354]);
    await session.writeBody(buildMessage(mail));
  } finally {
    session.end();
  }
}
