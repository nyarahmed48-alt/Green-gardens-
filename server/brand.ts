/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Green Gardens — the facts, in one place.
 *
 * Green Gardens designs and builds gardens and landscapes. Nobody visits us:
 * the work happens at the client's own property, so a booking here is a SITE
 * VISIT at their address, not an appointment at ours. That single fact shapes
 * the whole system — it is why every request carries a site address and an
 * area in square metres rather than a party size.
 *
 * Two things read this file and they must never disagree: Green AI, which
 * answers questions about the work, and the request emails, which quote
 * services and rates back to the client. A price that lives in two files
 * eventually becomes two prices, and the version the assistant quotes is the
 * one a client holds you to.
 *
 * This is the server-side copy. The visible site keeps its own trilingual copy
 * in src/content.ts — nothing under src/ belongs in a server bundle, and the
 * two audiences differ anyway: this file is the facts in one language for a
 * model to reason over, that one is finished marketing copy in three.
 */

/** What Green Gardens is hired to do. The ids travel in the API and the mail. */
export const SERVICES = [
  {
    id: "design",
    name: "Garden design",
    note: "Measured survey, planting plan and drawings before anything is dug.",
  },
  {
    id: "build",
    name: "Full landscape construction",
    note: "The whole job: levels, paving, walls, water, planting and lighting.",
  },
  {
    id: "planting",
    name: "Planting and lawns",
    note: "Trees, beds, turf and ground cover, chosen for the Erbil climate.",
  },
  {
    id: "irrigation",
    name: "Irrigation and lighting",
    note: "Automatic irrigation and garden lighting, installed or repaired.",
  },
  {
    id: "maintenance",
    name: "Maintenance",
    note: "Regular upkeep — pruning, mowing, feeding, seasonal replanting.",
  },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const SERVICE_IDS: readonly string[] = SERVICES.map((service) => service.id);

/** Label for a service id, or the raw id if it is one we do not publish. */
export const serviceName = (id: string): string =>
  SERVICES.find((service) => service.id === id)?.name ?? id;

/**
 * What kind of property the work is on.
 *
 * Split by who is asking, because the two genuinely differ: a homeowner has a
 * garden, a company has grounds, a budget cycle and an invoice to raise.
 */
export const PROJECTS = {
  individual: [
    { id: "villa-garden", name: "Villa or house garden" },
    { id: "roof-terrace", name: "Roof terrace or balcony" },
    { id: "small-yard", name: "Small yard or courtyard" },
    { id: "repair", name: "Repair or rescue an existing garden" },
  ],
  business: [
    { id: "commercial-grounds", name: "Office or commercial grounds" },
    { id: "hospitality", name: "Hotel, restaurant or café garden" },
    { id: "development", name: "Housing development or compound" },
    { id: "public", name: "Public or municipal landscape" },
    { id: "maintenance-contract", name: "Ongoing maintenance contract" },
  ],
} as const;

export type Audience = keyof typeof PROJECTS;

export const projectName = (audience: Audience, id: string): string =>
  (PROJECTS[audience] as readonly { id: string; name: string }[]).find((p) => p.id === id)?.name ??
  id;

/**
 * Indicative rates, as Green AI may quote them.
 *
 * Every one is a starting figure. Landscaping is priced off a site visit —
 * ground conditions, access and levels move a number more than square metres
 * do — so these exist to place the work in a range, never to close a price.
 */
export const RATES = [
  {
    name: "Garden design",
    price: "from 250,000 IQD",
    detail: "Survey, plan and planting list. Deducted from the build if you go ahead with us.",
  },
  {
    name: "Full construction",
    price: "from 90,000 IQD per m²",
    detail: "Hard and soft landscaping together. Moves most with paving, walls and water.",
  },
  {
    name: "Planting and lawns",
    price: "from 25,000 IQD per m²",
    detail: "Soil preparation, turf or beds, and the first season's care.",
  },
  {
    name: "Irrigation",
    price: "from 18,000 IQD per m²",
    detail: "An automatic system, zoned and timed, with a controller you can actually use.",
  },
  {
    name: "Maintenance",
    price: "from 150,000 IQD per visit",
    detail: "Monthly or fortnightly. The contract price falls with frequency and size.",
  },
];

export const COMPANY = {
  name: "Green Gardens",
  city: "Erbil",
  /** The yard and nursery. Clients are not received here — we go to them. */
  address: "Pirmam Road, Kilometre 6, Erbil, Kurdistan Region, Iraq",
  phone: "+964 782 782 9003",
  email: "greengarden632@gmail.com",
  /** Where the crews travel. Beyond it, ask — it is a question of travel time. */
  coverage:
    "Erbil and the surrounding districts, and elsewhere in the Kurdistan Region by arrangement",
  hours: [
    { days: "Saturday – Thursday", time: "08:00 – 17:00" },
    { days: "Friday", time: "closed" },
  ],
  /* What the office actually works to, so the assistant can promise it. */
  leadTime: {
    visit: "a site visit within three to five working days",
    quote: "a written quotation within a week of the visit",
    build: "construction usually starts two to four weeks after a signed quotation",
  },
  /** Beyond this the office prices it as a development, not a garden. */
  maxAreaM2: 50_000,
} as const;

/**
 * Everything above, as one block for Green AI's system prompt.
 *
 * Built rather than hand-written so the prompt cannot drift from the data the
 * emails use — change a rate above and the assistant quotes the new one.
 */
export function brandBriefing(): string {
  const services = SERVICES.map((s) => `- ${s.name}: ${s.note}`).join("\n");
  const rates = RATES.map((r) => `- ${r.name}: ${r.price}. ${r.detail}`).join("\n");
  const hours = COMPANY.hours.map((h) => `- ${h.days}: ${h.time}`).join("\n");

  return `Company: ${COMPANY.name}, a garden design and landscaping company in ${COMPANY.city}.
Green Gardens designs, builds and maintains gardens and landscapes. It is NOT a venue, a restaurant, a park or anywhere the public visits. All work happens at the client's own property and the team travels to them.
Office and nursery, which is a working yard rather than somewhere to receive clients: ${COMPANY.address}
Areas served: ${COMPANY.coverage}
Phone: ${COMPANY.phone} — Email: ${COMPANY.email}

Services:
${services}

Indicative rates, in Iraqi dinar. Every figure is a STARTING price and none of them is a quotation — a real price comes from a site visit:
${rates}

Office hours:
${hours}

What the office works to: ${COMPANY.leadTime.visit}; ${COMPANY.leadTime.quote}; ${COMPANY.leadTime.build}.
Largest site handled as a garden project: ${COMPANY.maxAreaM2.toLocaleString("en-US")} m². Anything larger is quoted as a development.
Green Gardens works for private clients and for companies. Company work is invoiced and can be placed against a purchase order.`;
}
