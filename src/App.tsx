/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Green Gardens — the page.
 *
 * One long page rather than several. Everything a guest needs in order to
 * decide — what the spaces are, what they cost, what it looks like, what
 * others said — fits in one scroll, and a booking that takes one scroll and no
 * navigation is a booking that gets finished.
 *
 * The design brief was two things that pull against each other: luxury and
 * dark, and bold and vibrant. They are reconciled by keeping every surface
 * near-black and spending all the saturation on one light green, which only
 * ever appears on what a guest is meant to read first or act on. See the note
 * at the top of theme.ts.
 *
 * Composition only. Copy lives in content.ts, colour in theme.ts, and the two
 * interactive pieces are their own files.
 */

import { CalendarCheck, Clock, Leaf, MapPin, Quote, Timer } from "lucide-react";
import { ConciergeChat } from "./ConciergeChat";
import { ReservationForm } from "./ReservationForm";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { PhotoTile, PriceRow, Section } from "./components/primitives";
import { FORM, GARDEN } from "./content";
import { useLang } from "./i18n";
import { GG, GG_TILES } from "./theme";

const HAIRLINE = "border-b border-[#1e2b23]";

export default function App() {
  const { t } = useLang();

  return (
    <div id="top" style={{ background: GG.ink, color: GG.cream }} className="min-h-[100dvh]">
      <Header />

      {/* --------------------------------------------------------------- Hero

          Padded from the top rather than sitting under a solid bar: the header
          is transparent until the page scrolls, so the hero owns the fold. */}
      <header className={`gg-grain ${HAIRLINE}`}>
        <div className="mx-auto grid max-w-5xl gap-10 px-5 pb-16 pt-28 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pb-24 md:pt-36">
          <div>
            <div className="flex items-center gap-2" style={{ color: GG.leaf }}>
              <Leaf className="h-4 w-4" />
              <span className="text-[12px] font-bold uppercase tracking-[0.22em]">{t(GARDEN.kicker)}</span>
            </div>

            {/* The name is the venue's own and stays in Latin script in all
                three languages, so it is pinned left-to-right and aligned to
                the reading edge by hand. */}
            <h1
              dir="ltr"
              className="mt-4 font-brand text-[clamp(2.6rem,7vw,4.2rem)] font-extrabold leading-[1.02] tracking-[-0.03em] rtl:text-end"
              style={{ color: GG.cream }}
            >
              Green{" "}
              <span
                style={{
                  background: `linear-gradient(120deg, ${GG.leaf}, ${GG.leafBright})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Gardens
              </span>
            </h1>

            <p className="mt-5 text-[19px] font-medium leading-relaxed" style={{ color: GG.leaf }}>
              {t(GARDEN.tagline)}
            </p>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed" style={{ color: GG.muted }}>
              {t(GARDEN.intro)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#reserve"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-opacity hover:opacity-90"
                style={{ background: GG.leaf, color: GG.onLeaf }}
              >
                <CalendarCheck className="h-4 w-4" />
                {t(GARDEN.ctaReserve)}
              </a>
              <a
                href="#spaces"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-colors"
                style={{ border: `1px solid ${GG.lineBright}`, color: GG.cream }}
              >
                {t(GARDEN.ctaSpaces)}
              </a>
            </div>
          </div>

          <PhotoTile from={GG.leafDeep} to={GG.ink} ratio="aspect-[4/5]" photo={GARDEN.heroPhoto} />
        </div>

        {/* Three figures. A fourth would turn a statement into a dashboard. */}
        <div className="mx-auto max-w-5xl px-5 pb-14">
          <dl className="grid grid-cols-3 gap-4 border-t pt-8" style={{ borderColor: GG.line }}>
            {GARDEN.stats.map((stat) => (
              <div key={stat.value}>
                <dt
                  dir="ltr"
                  className="font-display text-[clamp(1.6rem,4vw,2.3rem)] font-bold rtl:text-end"
                  style={{ color: GG.leaf }}
                >
                  {stat.value}
                </dt>
                <dd className="mt-1 text-[13px] leading-snug" style={{ color: GG.faint }}>
                  {t(stat.label)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* -------------------------------------------------------------- Story */}
      <Section className={HAIRLINE}>
        <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <PhotoTile from="#173a28" to="#070d09" ratio="aspect-[5/4]" photo={GARDEN.storyPhoto} />
          <div>
            <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
              {t(GARDEN.storyTitle)}
            </h2>
            <div className="mt-5 space-y-4">
              {GARDEN.story.map((paragraph) => (
                <p key={paragraph.en} className="text-[15.5px] leading-relaxed" style={{ color: GG.muted }}>
                  {t(paragraph)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------- Spaces */}
      <Section id="spaces" className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.spacesTitle)}
        </h2>
        <p className="mt-2 text-[14.5px]" style={{ color: GG.faint }}>
          {t(GARDEN.spacesNote)}
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {GARDEN.spaces.map((space) => (
            <article
              key={space.id}
              className="rounded-2xl p-6"
              style={{ background: GG.panel, border: `1px solid ${GG.line}` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[19px] font-bold" style={{ color: GG.cream }}>
                  {t(space.name)}
                </h3>
                <span className="shrink-0 text-[12.5px] font-semibold" style={{ color: GG.leaf }}>
                  {t(space.seats)}
                </span>
              </div>
              <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: GG.muted }}>
                {t(space.body)}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- Packages */}
      <Section id="packages" className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.packagesTitle)}
        </h2>
        <div className="mt-6 grid gap-x-12 md:grid-cols-2">
          {GARDEN.packages.map((item) => (
            <PriceRow key={item.name.en} name={t(item.name)} detail={t(item.detail)} price={t(item.price)} />
          ))}
        </div>
        <p className="mt-5 text-[13.5px]" style={{ color: GG.faint }}>
          {t(GARDEN.packagesNote)}
        </p>
      </Section>

      {/* ------------------------------------------------------------ Gallery */}
      <Section id="gallery" className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.galleryTitle)}
        </h2>
        <p className="mt-2 text-[14.5px]" style={{ color: GG.faint }}>
          {t(GARDEN.galleryNote)}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GG_TILES.map(([from, to], i) => (
            <PhotoTile key={from + to} from={from} to={to} ratio="aspect-square" photo={GARDEN.gallery[i]} />
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ Reviews */}
      <Section className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.reviewsTitle)}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {GARDEN.reviews.map((review) => (
            <figure
              key={review.author.en}
              className="rounded-2xl p-5"
              style={{ background: GG.panel, border: `1px solid ${GG.line}` }}
            >
              <Quote className="h-5 w-5" style={{ color: GG.leaf }} />
              <blockquote className="mt-3 text-[14.5px] leading-relaxed" style={{ color: GG.cream }}>
                {t(review.quote)}
              </blockquote>
              <figcaption className="mt-3 text-[13px] font-semibold" style={{ color: GG.faint }}>
                {t(review.author)}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- Reservation */}
      <Section id="reserve" className={HAIRLINE}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: GG.leaf }}>
              {t(FORM.eyebrow)}
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-bold" style={{ color: GG.cream }}>
              {t(FORM.title)}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: GG.muted }}>
              {t(FORM.lede)}
            </p>
          </div>
          <div className="mt-8">
            <ReservationForm />
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------------- Visit */}
      <Section id="visit">
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.visitTitle)}
        </h2>
        <div className="mt-7 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2" style={{ color: GG.leaf }}>
              <Clock className="h-4 w-4" />
              <h3 className="font-display text-[16px] font-bold">{t(GARDEN.hoursTitle)}</h3>
            </div>
            <dl className="mt-4 space-y-2 text-[14.5px]">
              {GARDEN.hours.map((entry) => (
                <div key={entry.day.en} className="flex justify-between gap-4">
                  <dt style={{ color: GG.faint }}>{t(entry.day)}</dt>
                  <dd className="font-medium" style={{ color: GG.cream }}>
                    {t(entry.time)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="flex items-center gap-2" style={{ color: GG.leaf }}>
              <MapPin className="h-4 w-4" />
              <h3 className="font-display text-[16px] font-bold">{t(GARDEN.addressTitle)}</h3>
            </div>
            <p className="mt-4 whitespace-pre-line text-[14.5px] leading-relaxed" style={{ color: GG.muted }}>
              {t(GARDEN.address)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2" style={{ color: GG.leaf }}>
              <Timer className="h-4 w-4" />
              <h3 className="font-display text-[16px] font-bold">{t(GARDEN.leadTimeTitle)}</h3>
            </div>
            <p className="mt-4 whitespace-pre-line text-[14.5px] leading-relaxed" style={{ color: GG.muted }}>
              {t(GARDEN.leadTime)}
            </p>
          </div>
        </div>
      </Section>

      <Footer />
      <ConciergeChat />
    </div>
  );
}
