/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The Green Gardens palette (AGR-XA8661).
 *
 * The brief asked for two things that pull against each other: luxury and
 * dark, and bold and vibrant. They are reconciled by keeping the surfaces
 * almost black and spending all the saturation on one colour — a light green
 * that only ever appears on the things a visitor is meant to act on or read
 * first. A dark page with one vivid accent reads as expensive; the same page
 * with four accents reads as a template.
 *
 * The base is not neutral black. It carries a trace of green, so the accent
 * looks like it grew out of the page rather than being dropped onto it.
 *
 * Colours live here as constants rather than Tailwind classes because the
 * demos are styled inline — Tailwind cannot see a class name assembled at
 * runtime, so `bg-[${LEAF}]` would silently produce no CSS at all.
 */

export const GG = {
  /** Page base — near-black, faintly green. */
  ink: "#060a07",
  /** Raised surfaces: cards, the chat panel, form fields. */
  panel: "#0c130f",
  /** One step brighter again, for a card sitting on a panel. */
  raised: "#111a14",
  /** Hairlines and dividers. */
  line: "#1e2b23",
  /** The same, brighter, for a focused input or a hovered card. */
  lineBright: "#2f4438",

  /** The accent. Nice light green — the one saturated colour on the page. */
  leaf: "#8ee9a1",
  /** Lifted, for hover states and small highlights. */
  leafBright: "#b7f5c2",
  /** The deep end of the green, used only in gradients. */
  leafDeep: "#1f7a45",

  /** Off-white. Body copy and headings — never pure white, which glares. */
  cream: "#f2efe6",
  /** Secondary copy. */
  muted: "#93a89a",
  /** Tertiary: captions, field hints, the footer. */
  faint: "#6d8175",

  /** Text on a light-green surface. Dark, so a filled button stays readable. */
  onLeaf: "#05130a",

  /** Validation. Warm enough to read as a correction, not an alarm. */
  warn: "#ffb4a2",
} as const;

/** The hero and gallery gradients, as [from, to] pairs for PhotoTile. */
export const GG_TILES: Array<[string, string]> = [
  ["#1f7a45", "#060a07"],
  ["#8ee9a1", "#12301f"],
  ["#2c5f45", "#080f0a"],
  ["#b7f5c2", "#1f3a2a"],
  ["#173a28", "#070d09"],
  ["#3f7d5a", "#0a1410"],
];
