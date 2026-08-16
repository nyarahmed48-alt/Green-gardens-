/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The three pieces used in more than one section: a photograph that degrades
 * to a gradient, a section wrapper that keeps the page's vertical rhythm, and
 * the dotted price row.
 *
 * Everything else is written where it is used. A component extracted for one
 * caller is harder to read than the markup it replaced.
 */

import { useState, type ReactNode } from "react";
import { useLang } from "../i18n";
import type { Photo } from "../content";
import { GG } from "../theme";

/**
 * A photograph, or a placeholder standing in for one.
 *
 * Pass a `photo` and it renders that file. Leave it off and the tile falls
 * back to a gradient in the company's own palette, which reads as a deliberate
 * placeholder rather than pretending to be a picture of something.
 *
 * The fallback is not only for slots nobody has filled: if a file is missing
 * or fails to load in a visitor's browser, the tile quietly becomes a gradient
 * again instead of showing a broken-image icon on the page a client is
 * judging the work by.
 *
 * The gradient keeps its own dimensions, so adding a photograph later never
 * moves the rest of the page.
 */
export function PhotoTile({
  from,
  to,
  photo,
  className = "",
  ratio = "aspect-[4/3]",
}: {
  from: string;
  to: string;
  /** A real photograph. Omit for the gradient placeholder. */
  photo?: Photo;
  className?: string;
  ratio?: string;
}) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);
  const showPhoto = photo && !failed;

  return (
    <div
      className={`${ratio} overflow-hidden rounded-2xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      /* Hide the tile from a screen reader only while it is a bare gradient —
         a real photograph is content and carries its own alt text. */
      aria-hidden={showPhoto ? undefined : "true"}
    >
      {showPhoto ? (
        <img
          src={photo.src}
          alt={t(photo.alt)}
          onError={() => setFailed(true)}
          /* Lazy by default: the gallery sits well below the fold, and someone
             on phone data should not wait for six photographs before reading
             the rates. */
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(120%_90%_at_20%_10%,rgba(255,255,255,0.16),transparent_60%)]" />
      )}
    </div>
  );
}

/** Section wrapper, so every band down the page shares one rhythm. */
export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={className}>
      <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">{children}</div>
    </section>
  );
}

/** A name / optional detail / price row, with a dotted leader between. */
export function PriceRow({
  name,
  detail,
  price,
}: {
  name: string;
  detail?: string;
  price: string;
}) {
  return (
    <div className="flex items-baseline gap-3 py-3">
      <div className="min-w-0">
        <span className="font-medium" style={{ color: GG.cream }}>
          {name}
        </span>
        {detail ? (
          <span className="ms-2 text-[13px]" style={{ color: GG.faint }}>
            {detail}
          </span>
        ) : null}
      </div>
      <span
        className="mx-1 h-px min-w-6 flex-1 self-center"
        style={{
          backgroundImage: `linear-gradient(to right, ${GG.lineBright} 40%, transparent 0%)`,
          backgroundSize: "6px 1px",
          backgroundRepeat: "repeat-x",
        }}
      />
      <span dir="ltr" className="shrink-0 font-semibold tabular-nums" style={{ color: GG.leaf }}>
        {price}
      </span>
    </div>
  );
}
