/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The footer. Address, hours and the two ways to reach a person.
 *
 * WhatsApp comes first among them because it is the channel a client in Erbil
 * will actually use, and it opens with the message half-written so nobody has
 * to think of an opening line.
 */

import { Mail, MessageCircle, Phone } from "lucide-react";
import { CONTACT, FOOTER, GARDEN, whatsapp } from "../content";
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
            <p className="mt-5 whitespace-pre-line text-[14px] leading-relaxed" style={{ color: GG.faint }}>
              {t(GARDEN.office)}
            </p>
            <p className="mt-1.5 text-[13px]" style={{ color: GG.faint }}>
              {t(GARDEN.officeNote)}
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

        <p className="mt-12 border-t pt-6 text-[12.5px]" style={{ borderColor: GG.line, color: GG.faint }}>
          <span dir="ltr">
            © {new Date().getFullYear()} {GARDEN.name}
          </span>
          {" — "}
          {t(FOOTER.rights)}
        </p>
      </div>
    </footer>
  );
}
