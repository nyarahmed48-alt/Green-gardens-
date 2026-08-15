/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Green Gardens — the facts, in one place.
 *
 * Agreement AGR-XA8661.
 *
 * Two things read this file and they must never disagree: the concierge bot,
 * which answers questions about the venue, and the reservation emails, which
 * quote spaces and packages back to the guest. A price that lives in two
 * files eventually becomes two prices, and the version the bot quotes is the
 * one a guest holds you to.
 *
 * This is the server-side copy. The visible site keeps its own trilingual
 * copy in src/content.ts — nothing under src/ belongs in a server bundle, and
 * the two audiences differ anyway: this file is the venue's facts in one
 * language for a model to reason over, that one is finished marketing copy in
 * three.
 *
 * When the real Green Gardens details arrive, this file and src/content.ts are
 * the two places to change.
 */

/** Spaces that can be reserved. The ids travel in the API and the emails. */
export const SPACES = [
  {
    id: "terrace",
    name: "The Terrace",
    seats: 60,
    note: "Open-air dining under the olive canopy, heated through winter.",
  },
  {
    id: "orangery",
    name: "The Orangery",
    seats: 120,
    note: "The glass house — the room used for weddings and launches.",
  },
  {
    id: "grove",
    name: "The Grove",
    seats: 24,
    note: "A private walled garden for small dinners and board meetings.",
  },
  {
    id: "whole",
    name: "The whole estate",
    seats: 220,
    note: "All three spaces, exclusive use, one event.",
  },
] as const;

export type SpaceId = (typeof SPACES)[number]["id"];

export const SPACE_IDS: readonly string[] = SPACES.map((s) => s.id);

/** Label for a space id, or the raw id if it is one we do not publish. */
export const spaceName = (id: string): string =>
  SPACES.find((s) => s.id === id)?.name ?? id;

/**
 * What a reservation can be for.
 *
 * Split by who is booking, because the two halves genuinely differ: a private
 * guest picks an occasion, a company picks a format and needs an invoice.
 */
export const OCCASIONS = {
  individual: [
    { id: "dining", name: "Dinner reservation" },
    { id: "celebration", name: "Birthday or family celebration" },
    { id: "wedding", name: "Wedding or engagement" },
    { id: "viewing", name: "Viewing — see the gardens first" },
  ],
  business: [
    { id: "corporate-dinner", name: "Corporate dinner" },
    { id: "launch", name: "Product launch or press event" },
    { id: "conference", name: "Conference or away day" },
    { id: "retainer", name: "Recurring hospitality agreement" },
  ],
} as const;

export type Audience = keyof typeof OCCASIONS;

export const occasionName = (audience: Audience, id: string): string =>
  (OCCASIONS[audience] as readonly { id: string; name: string }[]).find(
    (o) => o.id === id,
  )?.name ?? id;

/** Packages, as the bot may quote them. Per head, Iraqi dinar. */
export const PACKAGES = [
  { name: "Garden table", price: "from 35,000 IQD per head", detail: "À la carte on the Terrace, minimum two guests." },
  { name: "Celebration", price: "from 55,000 IQD per head", detail: "Set menu, flowers, cake table, four hours." },
  { name: "Wedding", price: "from 85,000 IQD per head", detail: "The Orangery, full service, 60 guests minimum." },
  { name: "Corporate", price: "from 65,000 IQD per head", detail: "Any space, AV and screens included, invoiced to the company." },
];

export const VENUE = {
  name: "Green Gardens",
  reference: "AGR-XA8661",
  city: "Erbil",
  address: "Pirmam Road, Kilometre 6, Erbil, Kurdistan Region, Iraq",
  hours: [
    { days: "Saturday – Thursday", time: "12:00 – 23:30" },
    { days: "Friday", time: "13:00 – 23:30" },
  ],
  /* Lead times the bot is allowed to promise, because they are the ones the
     reservations desk actually works to. */
  leadTime: {
    dining: "same day, subject to availability",
    private: "at least seven days for a private event",
  },
  maxGuests: 220,
} as const;

/**
 * Everything above, as one block of text for the concierge's system prompt.
 *
 * Built rather than hand-written so the prompt cannot drift from the data the
 * emails use — change a price above and the bot quotes the new one.
 */
export function brandBriefing(): string {
  const spaces = SPACES.map((s) => `- ${s.name}: seats ${s.seats}. ${s.note}`).join("\n");
  const packages = PACKAGES.map((p) => `- ${p.name}: ${p.price}. ${p.detail}`).join("\n");
  const hours = VENUE.hours.map((h) => `- ${h.days}: ${h.time}`).join("\n");

  return `Venue: ${VENUE.name}, a private garden estate and restaurant in ${VENUE.city}.
Address: ${VENUE.address}

Spaces:
${spaces}

Packages (Iraqi dinar, per head, service included):
${packages}

Opening hours:
${hours}

Booking lead times: dining ${VENUE.leadTime.dining}; private events ${VENUE.leadTime.private}.
Largest event the estate can hold: ${VENUE.maxGuests} guests.
Green Gardens takes reservations from private guests and from companies. Company bookings are invoiced and can be placed against a purchase order.`;
}
