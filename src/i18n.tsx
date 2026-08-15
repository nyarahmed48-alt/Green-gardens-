/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Arabic, Sorani Kurdish and English.
 *
 * Deliberately not a library. There are three languages and one dictionary, so
 * a context plus a lookup is the whole requirement.
 *
 * Arabic is the default because it is what most guests in Erbil read first.
 * Kurdish matters just as much here and is written in the Arabic script, so a
 * single `isRtl` flag covers the layout for either — English is the exception,
 * not Kurdish.
 *
 * A visitor's choice is remembered, so the switch only has to be pressed once.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "ckb" | "en";

/** A string that exists in all three languages. */
export interface Copy {
  ar: string;
  /** Sorani (Central) Kurdish — BCP 47 `ckb`. */
  ckb: string;
  en: string;
}

/** Every language, in the order the switch shows them. */
export const LANGS: readonly Lang[] = ["ar", "ckb", "en"] as const;

/** How each language names itself. Never translated — a switch that labels
 *  Kurdish in Arabic is useless to the person who needs it. */
export const LANG_NAMES: Record<Lang, string> = {
  ar: "العربية",
  ckb: "کوردی",
  en: "English",
};

/** Short labels for the compact switch in the header. */
export const LANG_SHORT: Record<Lang, string> = {
  ar: "ع",
  ckb: "ک",
  en: "EN",
};

const STORAGE_KEY = "greengardens.lang";
const DEFAULT_LANG: Lang = "ar";

const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && (LANGS as readonly string[]).includes(value);

interface LangContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Resolve any {ar, ckb, en} entry. */
  t: (value: Copy) => string;
  /** True for the two right-to-left languages. English is the odd one out. */
  isRtl: boolean;
}

const LangContext = createContext<LangContextValue | null>(null);

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* Storage can be unavailable in private mode or an embedded webview. Fall
       through to the default rather than breaking the render. */
  }
  return DEFAULT_LANG;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  /* Direction lives on <html> rather than a wrapper so it also reaches the
     browser's own scrollbar placement and any portalled UI. `ckb` is the
     correct tag for Central Kurdish and tells the browser to pick Kurdish
     letterforms — Sorani has letters Arabic does not. */
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "en" ? "ltr" : "rtl";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Not being able to remember the choice is survivable. */
    }
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (entry) => entry[lang] ?? entry.en,
      isRtl: lang !== "en",
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside <LangProvider>");
  return value;
}
