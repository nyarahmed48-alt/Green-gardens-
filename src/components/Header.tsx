/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The company's header: mark, section links, language switch, and the one
 * action worth taking — booking the free site visit — visible at every width.
 *
 * It sits over the hero rather than above it, and only takes on a background
 * once the page scrolls: a solid bar across the top of a full-bleed hero costs
 * the photograph its best 70 pixels.
 *
 * On a phone the section links collapse into a sheet, but the language switch
 * and the visit button never do. Those are the two things a client opens this
 * site to press, and burying either behind a hamburger is how an enquiry is
 * lost.
 */

import { useEffect, useState } from "react";
import { CalendarCheck, Menu, X } from "lucide-react";
import { LANGS, LANG_NAMES, LANG_SHORT, useLang } from "../i18n";
import { NAV } from "../content";
import { GG } from "../theme";

const SECTIONS = [
  { href: "#services", label: NAV.services },
  { href: "#how", label: NAV.how },
  { href: "#rates", label: NAV.rates },
  { href: "#work", label: NAV.work },
];

/** The mark: an olive leaf and the wordmark, which stays in Latin script. */
function Wordmark() {
  return (
    <a
      href="#top"
      className="flex items-center gap-2.5"
      aria-label={NAV.home.en}
      dir="ltr"
    >
      <svg viewBox="0 0 40 40" className="h-7 w-7 shrink-0" aria-hidden="true">
        <path
          d="M32 9c1 11-5 17-13 18-3 0-5-1-7-2 6-1 10-4 12-8-3 2-7 4-11 4 5-3 8-6 10-11 4 0 7 0 9-1z"
          fill={GG.leaf}
        />
        <path
          d="M11 31c2-6 4-10 8-13"
          stroke={GG.leaf}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {/* nowrap because "Green Gardens" wrapping to two lines makes the whole
          bar two lines tall on a narrow phone. */}
      <span
        className="whitespace-nowrap font-brand text-[15px] font-extrabold tracking-[-0.01em] sm:text-[17px]"
        style={{ color: GG.cream }}
      >
        Green Gardens
      </span>
    </a>
  );
}

function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label={NAV.langAria.en}
      className="flex shrink-0 items-center rounded-full p-0.5"
      style={{ border: `1px solid ${GG.line}`, background: GG.panel }}
    >
      {LANGS.map((option) => {
        const active = option === lang;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={active}
            /* The full name is the accessible label even in compact mode, so
               a screen reader never announces a bare letter. */
            aria-label={LANG_NAMES[option]}
            className="rounded-full px-2.5 py-1 text-[12.5px] font-bold transition-colors"
            style={{
              background: active ? GG.leaf : "transparent",
              color: active ? GG.onLeaf : GG.muted,
            }}
          >
            {compact ? LANG_SHORT[option] : LANG_NAMES[option]}
          </button>
        );
      })}
    </div>
  );
}

export function Header() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on Escape, and don't leave the page scrolling behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      style={{
        background: scrolled ? "rgba(6, 10, 7, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: `1px solid ${scrolled ? GG.line : "transparent"}`,
      }}
    >
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:rounded-lg focus:px-3 focus:py-2"
        style={{ background: GG.leaf, color: GG.onLeaf }}
      >
        {t(NAV.skip)}
      </a>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <Wordmark />

        <nav className="hidden items-center gap-6 lg:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="text-[14px] font-medium transition-colors hover:opacity-80"
              style={{ color: GG.muted }}
            >
              {t(section.label)}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden sm:block">
            <LangSwitch />
          </span>
          <span className="sm:hidden">
            <LangSwitch compact />
          </span>

          {/* The label drops on a narrow phone and the icon carries it alone —
              four labelled controls do not fit across 390px, and this is the
              one whose meaning survives as a symbol. The accessible name stays
              either way. */}
          <a
            href="#visit"
            aria-label={t(NAV.visit)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13.5px] font-bold transition-opacity hover:opacity-90 sm:px-4"
            style={{ background: GG.leaf, color: GG.onLeaf }}
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t(NAV.visit)}</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t(NAV.openMenu)}
            className="rounded-lg p-2 lg:hidden"
            style={{ color: GG.muted }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ the phone sheet */}
      {open ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ background: "rgba(3, 6, 4, 0.96)" }}
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-end px-4 py-3.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t(NAV.closeMenu)}
              className="rounded-lg p-2"
              style={{ color: GG.muted }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-6 pt-6">
            {SECTIONS.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setOpen(false)}
                className="border-b py-4 font-display text-[22px] font-bold"
                style={{ borderColor: GG.line, color: GG.cream }}
              >
                {t(section.label)}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
