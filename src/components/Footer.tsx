/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The footer. Address, hours and the two ways to reach a person.
 *
 * WhatsApp comes first among them because it is the channel a client in Iraq
 * will actually use, and it opens with the message half-written so nobody has
 * to think of an opening line.
 */

import { Mail, MessageCircle, Phone } from "lucide-react";
import { CONTACT, COREOS_URL, FOOTER, GARDEN, whatsapp } from "../content";
import { useLang } from "../i18n";
import { GG } from "../theme";

export function Footer() {
  const { t } = useLang();

  const prefill = t({
    ar: "مرحبًا، أود الاستفسار عن تصميم/تنفيذ حديقة مع Green Gardens.",
    ckb: "سڵاو، دەمەوێت دەربارەی دیزاین/دروستکردنی باخچە لەگەڵ Green Gardens بپرسم.",
    en: "Hello, I'd like to ask about a garden with Green Gardens.",
  });

  return (
    <footer className="border-t" style={{ borderColor: GG.line, background: GG.panel }}>
      <div className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p dir="ltr" className="font-brand text-[20px] font-extrabold rtl:text-end" style={{ color: GG.cream }}>
              {GARDEN.name}
            </p>
            <p className="mt-3 max-w-md text-[14.5px] leading-relaxed" style={{ color: GG.muted }}>
              {t(FOOTER.blurb)}
            </p>
            {/* Just the city. The "Based in" section immediately above already
                carries the "no showroom" line, and on a phone the two land in
                the same screenful — saying it twice reads as a stutter. */}
            <p className="mt-5 text-[14px]" style={{ color: GG.faint }}>
              {t(GARDEN.office)}
            </p>
          </div>

          <div>
            <h2 className="font-display text-[15px] font-bold" style={{ color: GG.cream }}>
              {t(FOOTER.contactTitle)}
            </h2>

            <a
              href={whatsapp(prefill)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-bold transition-opacity hover:opacity-90"
              style={{ background: GG.leaf, color: GG.onLeaf }}
            >
              <MessageCircle className="h-4 w-4" />
              {t(FOOTER.whatsapp)}
            </a>

            <ul className="mt-5 space-y-2.5 text-[14px]">
              <li>
                <a
                  href={`tel:${CONTACT.phoneDisplay.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
                  style={{ color: GG.muted }}
                >
                  <Phone className="h-4 w-4 shrink-0" style={{ color: GG.leaf }} />
                  <span dir="ltr">{CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
                  style={{ color: GG.muted }}
                >
                  <Mail className="h-4 w-4 shrink-0" style={{ color: GG.leaf }} />
                  <span dir="ltr">{CONTACT.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6" style={{ borderColor: GG.line }}>
          <p className="text-[12.5px]" style={{ color: GG.faint }}>
            <span dir="ltr">
              © {new Date().getFullYear()} {GARDEN.name}
            </span>
            {" — "}
            {t(FOOTER.established)}
            {" — "}
            {t(FOOTER.rights)}
          </p>

          {/* Who built it, and a way through to them. */}
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: GG.faint }}>
            {t(FOOTER.builtBy)}{" "}
            <a
              href={COREOS_URL}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="font-semibold underline decoration-dotted underline-offset-2 transition-opacity hover:opacity-80"
              style={{ color: GG.leaf }}
            >
              coreosai.netlify.app
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
