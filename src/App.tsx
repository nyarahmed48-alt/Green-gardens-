/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Green Gardens — the page.
 *
 * A landscaping company sells on two things: proof that the work is good, and
 * confidence that the price will not move once the digging starts. A company
 * founded this year is short on the first, so the page leans on the second —
 * what we do, how a job runs, what it costs, what we promise — and ends at the
 * one action worth taking: booking the free site visit that produces a real
 * quotation.
 *
 * Nothing here invites anyone to visit us. The crew travels to the client, and
 * every call to action books that direction.
 *
 * One long page rather than several: everything needed to decide fits in one
 * scroll, and a request that takes one scroll and no navigation is a request
 * that gets finished.
 *
 * Composition only. Copy lives in content.ts, colour in theme.ts, and the two
 * interactive pieces are their own files.
 */

import { CalendarCheck, Check, Clock, Leaf, MapPin, Sprout } from "lucide-react";
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

            {/* The name is the company's own and stays in Latin script in all
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
                href="#visit"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-opacity hover:opacity-90"
                style={{ background: GG.leaf, color: GG.onLeaf }}
              >
                <CalendarCheck className="h-4 w-4" />
                {t(GARDEN.ctaVisit)}
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-colors"
                style={{ border: `1px solid ${GG.lineBright}`, color: GG.cream }}
              >
                {t(GARDEN.ctaServices)}
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
                  className="font-display text-[clamp(1.5rem,4vw,2.3rem)] font-bold rtl:text-end"
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

      {/* ----------------------------------------------------------- Services */}
      <Section id="services" className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.servicesTitle)}
        </h2>
        <p className="mt-2 text-[14.5px]" style={{ color: GG.faint }}>
          {t(GARDEN.servicesNote)}
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {GARDEN.services.map((service) => (
            <article
              key={service.id}
              className="rounded-2xl p-6"
              style={{ background: GG.panel, border: `1px solid ${GG.line}` }}
            >
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 shrink-0" style={{ color: GG.leaf }} />
                <h3 className="font-display text-[19px] font-bold" style={{ color: GG.cream }}>
                  {t(service.name)}
                </h3>
              </div>
              <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: GG.muted }}>
                {t(service.body)}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ How it works */}
      <Section id="how" className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.howTitle)}
        </h2>
        <p className="mt-2 text-[14.5px]" style={{ color: GG.faint }}>
          {t(GARDEN.howNote)}
        </p>

        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GARDEN.steps.map((step) => (
            <li
              key={step.n}
              className="rounded-2xl p-5"
              style={{ background: GG.panel, border: `1px solid ${GG.line}` }}
            >
              <span
                dir="ltr"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full font-display text-[14px] font-bold"
                style={{ background: GG.leaf, color: GG.onLeaf }}
              >
                {step.n}
              </span>
              <h3 className="mt-3 font-display text-[16px] font-bold" style={{ color: GG.cream }}>
                {t(step.name)}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: GG.muted }}>
                {t(step.body)}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* -------------------------------------------------------------- Rates */}
      <Section id="rates" className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.ratesTitle)}
        </h2>
        <div className="mt-6 grid gap-x-12 md:grid-cols-2">
          {GARDEN.rates.map((item) => (
            <PriceRow key={item.name.en} name={t(item.name)} detail={t(item.detail)} price={t(item.price)} />
          ))}
        </div>
        <p className="mt-5 text-[13.5px] leading-relaxed" style={{ color: GG.faint }}>
          {t(GARDEN.ratesNote)}
        </p>
        <p className="mt-1.5 text-[13.5px]" style={{ color: GG.faint }}>
          {t(GARDEN.currencyNote)}
        </p>
      </Section>

      {/* ------------------------------------------------------------ Gallery */}
      <Section id="work" className={HAIRLINE}>
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

      {/* ---------------------------------------------------------- Standards

          Where testimonials would sit on an older company's site. A firm
          founded this year has no clients to quote yet, and inventing them is
          not an option, so this says how the work runs instead — which is the
          thing a cautious client is actually trying to find out. */}
      <Section className={HAIRLINE}>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.standardsTitle)}
        </h2>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed" style={{ color: GG.faint }}>
          {t(GARDEN.standardsNote)}
        </p>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GARDEN.standards.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl p-5"
              style={{ background: GG.panel, border: `1px solid ${GG.line}` }}
            >
              <Check className="h-4 w-4 shrink-0" style={{ color: GG.leaf }} />
              <h3 className="mt-3 font-display text-[16px] font-bold" style={{ color: GG.cream }}>
                {t(item.name)}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: GG.muted }}>
                {t(item.body)}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* --------------------------------------------------------- Site visit */}
      <Section id="visit" className={HAIRLINE}>
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

      {/* ------------------------------------------------------ Where we work */}
      <Section>
        <h2 className="font-display text-[28px] font-bold" style={{ color: GG.cream }}>
          {t(GARDEN.reachTitle)}
        </h2>
        <div className="mt-7 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2" style={{ color: GG.leaf }}>
              <MapPin className="h-4 w-4" />
              <h3 className="font-display text-[16px] font-bold">{t(GARDEN.coverageTitle)}</h3>
            </div>
            <p className="mt-4 whitespace-pre-line text-[14.5px] leading-relaxed" style={{ color: GG.muted }}>
              {t(GARDEN.coverage)}
            </p>
          </div>

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
              <Sprout className="h-4 w-4" />
              <h3 className="font-display text-[16px] font-bold">{t(GARDEN.officeTitle)}</h3>
            </div>
            <p className="mt-4 whitespace-pre-line text-[14.5px] leading-relaxed" style={{ color: GG.muted }}>
              {t(GARDEN.office)}
            </p>
            {/* Said plainly, because an address on a website reads as an
                invitation and this one is a working yard. */}
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: GG.faint }}>
              {t(GARDEN.officeNote)}
            </p>
          </div>
        </div>
      </Section>

      <Footer />
      <ConciergeChat />
    </div>
  );
}
