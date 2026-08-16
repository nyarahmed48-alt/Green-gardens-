/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Green AI — the floating assistant.
 *
 * A docked panel rather than a full-screen modal: someone asking what a lawn
 * costs is usually reading the rates while they ask, and covering the page
 * would make them close the chat to check.
 *
 * It does go full-height on a phone, where a 380px card floating over a page
 * is worse than either option.
 *
 * Green AI cannot quote a firm price or book a visit, and is told so in its
 * brief (server/chat.ts). The note under the composer says the same thing, so
 * a visitor never has to ask the assistant what the assistant can do — and
 * the CoreOs credit sits with it.
 */

import { useEffect, useRef, useState } from "react";
import { Leaf, RotateCcw, Send, X } from "lucide-react";
import { useLang } from "./i18n";
import { CHAT } from "./content";
import { GG } from "./theme";

interface Turn {
  role: "user" | "agent";
  text: string;
}

const MAX_CHARS = 600;

export function ConciergeChat() {
  const { t: c, lang } = useLang();

  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  async function send(raw: string) {
    const message = raw.trim();
    if (!message || busy) return;

    const history = turns.slice(-8);
    setTurns((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setBusy(true);
    setError(null);

    /* Never spin forever. A host that swallows the request would otherwise
       leave the panel on "thinking" with no way back. */
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 60_000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, lang }),
        signal: abort.signal,
      });

      // A static-only deployment answers this path with the SPA shell.
      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error(c(CHAT.errNoBackend));
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || c(CHAT.errGeneric));
      setTurns((prev) => [...prev, { role: "agent", text: data.text }]);
    } catch (err: any) {
      setError(err?.name === "AbortError" ? c(CHAT.errGeneric) : err?.message || c(CHAT.errGeneric));
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  if (!open) {
    return (
      /* Deliberately small. This floats over the page for the whole visit, and
         a large pill in the corner competes with the reservation form, which
         is the thing the page is actually for. Small enough to ignore, large
         enough to stay a comfortable tap target — the padding keeps it around
         36px tall, above the 24px minimum and close enough to 44px with the
         hit area browsers add around it. */
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 end-4 z-40 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold shadow-lg transition-transform hover:scale-[1.04]"
        style={{ background: GG.leaf, color: GG.onLeaf }}
      >
        <Leaf className="h-3.5 w-3.5" />
        {c(CHAT.open)}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={`${c(CHAT.name)} — ${c(CHAT.role)}`}
      className="gg-rise fixed inset-x-0 bottom-0 z-40 flex h-[85dvh] flex-col overflow-hidden border shadow-2xl sm:inset-x-auto sm:bottom-5 sm:end-5 sm:h-[min(560px,80dvh)] sm:w-[380px] sm:rounded-3xl"
      style={{ background: GG.panel, borderColor: GG.line }}
    >
      {/* --------------------------------------------------------- header */}
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: GG.line, background: `linear-gradient(135deg, ${GG.raised}, ${GG.panel})` }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: GG.leaf, color: GG.onLeaf }}
          >
            <Leaf className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold" style={{ color: GG.cream }}>
              {c(CHAT.name)}
            </span>
            <span className="block truncate text-[12.5px]" style={{ color: GG.faint }}>
              {c(CHAT.role)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {turns.length ? (
            <button
              type="button"
              onClick={() => {
                setTurns([]);
                setError(null);
              }}
              aria-label={c(CHAT.clear)}
              className="rounded-lg p-2 transition-colors"
              style={{ color: GG.faint }}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={c(CHAT.close)}
            className="rounded-lg p-2 transition-colors"
            style={{ color: GG.faint }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------ transcript */}
      <div ref={scrollRef} className="gg-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <Bubble role="agent" text={c(CHAT.greeting)} />

        {turns.map((turn, i) => (
          <Bubble key={i} role={turn.role} text={turn.text} />
        ))}

        {/* Openers, until the visitor has said something of their own. */}
        {!turns.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {CHAT.prompts.map((prompt) => (
              <button
                key={prompt.en}
                type="button"
                onClick={() => send(c(prompt))}
                className="rounded-full px-3 py-1.5 text-[12.5px] transition-colors"
                style={{ border: `1px solid ${GG.line}`, color: GG.muted }}
              >
                {c(prompt)}
              </button>
            ))}
          </div>
        ) : null}

        {/* Three dots rather than a spinner: a spinner reads as "loading, and
            you can do nothing", while a typing indicator reads as a reply on
            its way. The wait is the same; the impression is not. */}
        {busy ? (
          <div className="flex items-center gap-2" aria-live="polite">
            <span
              className="flex items-center gap-1 rounded-2xl px-3.5 py-3"
              style={{ background: GG.raised, border: `1px solid ${GG.line}` }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="gg-dot inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: GG.leaf, animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </span>
            <span className="sr-only">{c(CHAT.name)}…</span>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-xl p-3 text-[13px] leading-relaxed"
            style={{ background: "#1a0f0c", border: "1px solid #43241d", color: GG.warn }}
          >
            {error}
          </p>
        ) : null}
      </div>

      {/* -------------------------------------------------------- composer */}
      <div className="border-t px-3 py-3" style={{ borderColor: GG.line }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            /* Two rows, not one: the panel is 380px wide and the placeholder
               wraps in all three languages, so a single row clips it. */
            rows={2}
            value={input}
            maxLength={MAX_CHARS}
            placeholder={c(CHAT.placeholder)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, shift+enter breaks the line — what a chat box does.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            className="gg-field max-h-28 resize-none"
            dir="auto"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            aria-label={c(CHAT.send)}
            className="shrink-0 rounded-xl p-3 transition-opacity disabled:opacity-40"
            style={{ background: GG.leaf, color: GG.onLeaf }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: GG.faint }}>
          {c(CHAT.note)}
        </p>
        {/* Attribution. CoreOs built and runs the assistant, and it sits under
            the composer rather than in the header so it reads as a credit
            rather than as a second brand competing with Green Gardens. */}
        <p className="mt-1 text-[11px]" style={{ color: GG.faint }}>
          <span style={{ opacity: 0.8 }}>{c(CHAT.poweredBy)}</span>
        </p>
      </div>
    </div>
  );
}

/** One message. `dir="auto"` so a conversation can mix languages without the
 *  punctuation jumping ends. A client may well ask in Kurdish and quote an
 *  English name in the same sentence. */
function Bubble({ role, text }: { role: "user" | "agent"; text: string }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p
        dir="auto"
        className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed"
        style={
          mine
            ? { background: GG.leaf, color: GG.onLeaf, borderEndEndRadius: 6 }
            : { background: GG.raised, color: GG.cream, border: `1px solid ${GG.line}`, borderEndStartRadius: 6 }
        }
      >
        {text}
      </p>
    </div>
  );
}
