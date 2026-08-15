/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The reservation flow, minus transport, so all four deployment targets share
 * one copy of it — the same arrangement as the concierge next door.
 *
 * A reservation can come from a private guest or from a company, and the two
 * are genuinely different bookings rather than one form with a checkbox: a
 * company needs an invoice address, a registration number and often a purchase
 * order, and none of that should be asked of someone booking a birthday
 * dinner. So the audience decides which fields are required, and the emails
 * that go out are laid out differently for each.
 *
 * Two messages leave here on a successful booking:
 *
 *   1. The desk copy, to MAIL_TO. English, dense, every field —
 *      it is a work item, and the staff reading it need it to look the same
 *      every time regardless of which language the guest used.
 *   2. The guest copy, in the language they filled the form in, when they gave
 *      an address and confirmations are switched on.
 *
 * If the desk copy cannot be sent, the booking FAILS and says so. A form that
 * thanks someone for a reservation nobody received is worse than one that
 * admits it is not wired up.
 */

import {
  OCCASIONS,
  SPACE_IDS,
  VENUE,
  occasionName,
  spaceName,
  type Audience,
} from "./brand";
import { mailReadiness, type MailSettings } from "./settings";
import { MailError, type OutgoingMail } from "./mail";

/** How the caller sends mail. Node passes sendMailNode, the Worker sendMail. */
export type MailSender = (mail: OutgoingMail, settings: MailSettings) => Promise<void>;

type Lang = "ar" | "ckb" | "en";
type Says = Record<Lang, string>;

const asLang = (value: unknown): Lang => (value === "en" || value === "ckb" ? value : "ar");

/** Field-level errors, keyed by the form field they belong to. */
export type FieldErrors = Record<string, string>;

export interface Reservation {
  reference: string;
  audience: Audience;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  space: string;
  occasion: string;
  notes: string;
  /** Business bookings only. */
  company: string;
  companyRole: string;
  taxId: string;
  invoiceEmail: string;
  poNumber: string;
  lang: Lang;
  submittedAt: string;
}

/* ============================================================ validation === */

const MAX = { name: 120, email: 160, phone: 40, notes: 1200, company: 160, role: 120, taxId: 60, po: 80 };

const text = (value: unknown, limit: number): string =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

/* Deliberately loose. The strict-looking address regexes people paste in
   reject valid addresses, and the real check is whether the confirmation
   arrives — this only catches the typo that has no @ in it at all. */
const looksLikeEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

/* Enough digits to dial, in any of the formats people actually type. */
const looksLikePhone = (value: string): boolean => (value.match(/\d/g) ?? []).length >= 7;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Midnight UTC for a YYYY-MM-DD string, or NaN. Compared against today the
 *  same way, so "today" is never rejected because of the hour it is now. */
function dayValue(iso: string): number {
  if (!ISO_DATE.test(iso)) return NaN;
  const stamp = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(stamp) ? NaN : stamp;
}

const DAY_MS = 86_400_000;
/** A diary this far out is not a booking, it is a typo in the year field. */
const MAX_DAYS_AHEAD = 550;

interface Validation {
  ok: boolean;
  errors: FieldErrors;
  reservation?: Reservation;
}

/**
 * Check a submitted form. Returns every problem at once rather than the first,
 * so a guest fixes one form instead of resubmitting four times.
 */
export function validate(raw: any, lang: Lang, now: Date): Validation {
  const say = (choices: Says) => choices[lang];
  const errors: FieldErrors = {};

  const audience: Audience = raw?.audience === "business" ? "business" : "individual";

  const name = text(raw?.name, MAX.name);
  if (name.length < 2) {
    errors.name = say({
      ar: "اكتب الاسم الكامل.",
      ckb: "ناوی تەواو بنووسە.",
      en: "Enter your full name.",
    });
  }

  const email = text(raw?.email, MAX.email);
  if (!looksLikeEmail(email)) {
    errors.email = say({
      ar: "اكتب بريدًا إلكترونيًا صحيحًا — إليه نرسل التأكيد.",
      ckb: "ئیمەیڵێکی دروست بنووسە — دڵنیاییەکەی بۆ دەنێرین.",
      en: "Enter a valid email address — the confirmation goes there.",
    });
  }

  const phone = text(raw?.phone, MAX.phone);
  if (!looksLikePhone(phone)) {
    errors.phone = say({
      ar: "اكتب رقم هاتف نستطيع الاتصال به.",
      ckb: "ژمارەی تەلەفۆنێک بنووسە کە بتوانین پەیوەندیت پێوە بکەین.",
      en: "Enter a phone number we can reach you on.",
    });
  }

  const date = text(raw?.date, 10);
  const day = dayValue(date);
  const today = dayValue(now.toISOString().slice(0, 10));
  if (Number.isNaN(day)) {
    errors.date = say({
      ar: "اختر تاريخًا.",
      ckb: "بەروارێک هەڵبژێرە.",
      en: "Pick a date.",
    });
  } else if (day < today) {
    errors.date = say({
      ar: "هذا التاريخ مضى. اختر يومًا قادمًا.",
      ckb: "ئەم بەروارە تێپەڕیوە. ڕۆژێکی داهاتوو هەڵبژێرە.",
      en: "That date has passed. Pick a day still to come.",
    });
  } else if (day > today + MAX_DAYS_AHEAD * DAY_MS) {
    errors.date = say({
      ar: "هذا التاريخ بعيد جدًا. راسلنا مباشرة لحجز أبعد من ذلك.",
      ckb: "ئەم بەروارە زۆر دوورە. بۆ حجزی دوورتر ڕاستەوخۆ پەیوەندیمان پێوە بکە.",
      en: "That is further out than the diary goes. Contact us directly for a date that far ahead.",
    });
  }

  const time = text(raw?.time, 5);
  if (!TIME.test(time)) {
    errors.time = say({
      ar: "اختر وقتًا.",
      ckb: "کاتێک هەڵبژێرە.",
      en: "Pick a time.",
    });
  }

  const guests = Number(raw?.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > VENUE.maxGuests) {
    errors.guests = say({
      ar: `عدد الضيوف بين 1 و${VENUE.maxGuests}.`,
      ckb: `ژمارەی میوانان لە نێوان 1 و ${VENUE.maxGuests} بێت.`,
      en: `Guests must be between 1 and ${VENUE.maxGuests}.`,
    });
  }

  const space = text(raw?.space, 40);
  if (!SPACE_IDS.includes(space)) {
    errors.space = say({
      ar: "اختر إحدى المساحات.",
      ckb: "یەکێک لە شوێنەکان هەڵبژێرە.",
      en: "Choose one of the spaces.",
    });
  }

  const occasion = text(raw?.occasion, 40);
  const allowed = (OCCASIONS[audience] as readonly { id: string }[]).map((o) => o.id);
  if (!allowed.includes(occasion)) {
    errors.occasion = say({
      ar: "اختر نوع المناسبة.",
      ckb: "جۆری بۆنەکە هەڵبژێرە.",
      en: "Choose what the booking is for.",
    });
  }

  /* ---- the company half, required only of companies ---- */
  const company = text(raw?.company, MAX.company);
  const companyRole = text(raw?.companyRole, MAX.role);
  const taxId = text(raw?.taxId, MAX.taxId);
  const poNumber = text(raw?.poNumber, MAX.po);
  const invoiceEmail = text(raw?.invoiceEmail, MAX.email);

  if (audience === "business") {
    if (company.length < 2) {
      errors.company = say({
        ar: "اكتب اسم الشركة.",
        ckb: "ناوی کۆمپانیاکە بنووسە.",
        en: "Enter the company name.",
      });
    }
    /* The invoice address is optional — plenty of small companies invoice to
       the person booking — but a wrong one is worse than a missing one. */
    if (invoiceEmail && !looksLikeEmail(invoiceEmail)) {
      errors.invoiceEmail = say({
        ar: "بريد الفوترة غير صحيح.",
        ckb: "ئیمەیڵی پسوولەکە دروست نییە.",
        en: "That invoicing address doesn't look right.",
      });
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    reservation: {
      reference: reference(now),
      audience,
      name,
      email,
      phone,
      date,
      time,
      guests,
      space,
      occasion,
      notes: text(raw?.notes, MAX.notes),
      company,
      companyRole,
      taxId,
      invoiceEmail,
      poNumber,
      lang,
      submittedAt: now.toISOString(),
    },
  };
}

/**
 * The booking reference the guest quotes on the phone.
 *
 * Date prefix so the desk can see at a glance how old one is, then four
 * random characters. Not a secret and not a primary key — the desk matches on
 * name and date — so collision resistance is not the job here; being short
 * enough to read down a phone line is.
 */
function reference(now: Date): string {
  const day = now.toISOString().slice(2, 10).replace(/-/g, "");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to read aloud
  let tail = "";
  const bytes = new Uint8Array(4);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (const byte of bytes) tail += alphabet[byte % alphabet.length];
  return `GG-${day}-${tail}`;
}

/* ================================================================ emails === */

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface Row {
  label: string;
  value: string;
}

/** Rows the desk sees, in the order the desk works through them. */
function deskRows(r: Reservation): Row[] {
  const rows: Row[] = [
    { label: "Reference", value: r.reference },
    { label: "Booking type", value: r.audience === "business" ? "Business" : "Individual" },
    { label: "Date", value: r.date },
    { label: "Time", value: r.time },
    { label: "Guests", value: String(r.guests) },
    { label: "Space", value: spaceName(r.space) },
    { label: "For", value: occasionName(r.audience, r.occasion) },
    { label: "Name", value: r.name },
    { label: "Email", value: r.email },
    { label: "Phone", value: r.phone },
  ];

  if (r.audience === "business") {
    rows.push({ label: "Company", value: r.company });
    if (r.companyRole) rows.push({ label: "Role", value: r.companyRole });
    if (r.taxId) rows.push({ label: "Registration / tax id", value: r.taxId });
    if (r.invoiceEmail) rows.push({ label: "Invoice to", value: r.invoiceEmail });
    if (r.poNumber) rows.push({ label: "Purchase order", value: r.poNumber });
  }

  if (r.notes) rows.push({ label: "Notes", value: r.notes });
  rows.push({ label: "Language", value: { ar: "Arabic", ckb: "Kurdish", en: "English" }[r.lang] });
  rows.push({ label: "Submitted", value: r.submittedAt });
  return rows;
}

const GREEN = "#8ee9a1";
const DARK = "#0b120e";
const CREAM = "#f2efe6";

/** One HTML shell for both emails, so they look like the same venue sent them. */
function shell(title: string, intro: string, rows: Row[], footer: string, dir: "rtl" | "ltr"): string {
  const cells = rows
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding:9px 0;color:#8ba192;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:9px 0 9px 18px;color:${CREAM};font-size:14px;font-weight:600;">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html dir="${dir}">
  <body style="margin:0;padding:24px;background:#050806;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:${DARK};border:1px solid #1c2a21;border-radius:16px;overflow:hidden;">
      <div style="padding:22px 26px;background:linear-gradient(135deg,#12211a,#0b120e);border-bottom:1px solid #1c2a21;">
        <div style="color:${GREEN};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">${escapeHtml(VENUE.name)}</div>
        <div style="color:${CREAM};font-size:20px;font-weight:700;margin-top:6px;">${escapeHtml(title)}</div>
      </div>
      <div style="padding:22px 26px;">
        <p style="margin:0 0 18px;color:#b9c9bf;font-size:14.5px;line-height:1.65;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;">${cells}</table>
      </div>
      <div style="padding:16px 26px;border-top:1px solid #1c2a21;color:#6f8377;font-size:12px;line-height:1.6;">
        ${escapeHtml(footer)}
      </div>
    </div>
  </body>
</html>`;
}

const plain = (title: string, intro: string, rows: Row[], footer: string): string =>
  [
    VENUE.name.toUpperCase(),
    title,
    "",
    intro,
    "",
    ...rows.map(({ label, value }) => `${label}: ${value}`),
    "",
    footer,
  ].join("\n");

/** The desk copy. English by design — see the note at the top of the file. */
export function deskEmail(r: Reservation, settings: MailSettings): OutgoingMail {
  const rows = deskRows(r);
  const kind = r.audience === "business" ? "Business" : "Individual";
  const title = `${kind} reservation — ${r.date} at ${r.time}`;
  const intro = `${r.name} has requested ${spaceName(r.space)} for ${r.guests} ${r.guests === 1 ? "guest" : "guests"}. Confirm with them directly; this message is the only record.`;
  const footer = `Sent by the ${VENUE.name} website. Reply to this message to answer the guest.`;

  return {
    from: settings.from,
    to: settings.to,
    bcc: settings.bcc,
    // So hitting reply in the desk mailbox writes to the guest, not to itself.
    replyTo: r.email,
    subject: `[${r.reference}] ${kind} reservation — ${r.date} ${r.time}, ${r.guests} guests`,
    text: plain(title, intro, rows, footer),
    html: shell(title, intro, rows, footer, "ltr"),
  };
}

/** The guest copy, in the language they used. */
export function guestEmail(r: Reservation, settings: MailSettings): OutgoingMail {
  const say = (choices: Says) => choices[r.lang];

  const title = say({
    ar: "استلمنا طلب حجزك",
    ckb: "داواکاریی حجزەکەت پێگەیشت",
    en: "We have your reservation request",
  });

  const intro = say({
    ar: `شكرًا ${r.name}. هذا طلب حجز وليس تأكيدًا نهائيًا — يراجعه مكتب الحجوزات ويتواصل معك لتثبيته. رقم الطلب ${r.reference}.`,
    ckb: `سوپاس ${r.name}. ئەمە داواکاریی حجزە نەک دڵنیایی کۆتایی — نووسینگەی حجز پێداچوونەوەی بۆ دەکات و پەیوەندیت پێوە دەکات بۆ جێگیرکردنی. ژمارەی داواکاری ${r.reference}.`,
    en: `Thank you, ${r.name}. This is a request rather than a confirmed booking — the reservations desk will review it and come back to you to confirm. Your reference is ${r.reference}.`,
  });

  const label = (choices: Says) => say(choices);
  const rows: Row[] = [
    { label: label({ ar: "رقم الطلب", ckb: "ژمارەی داواکاری", en: "Reference" }), value: r.reference },
    { label: label({ ar: "التاريخ", ckb: "بەروار", en: "Date" }), value: r.date },
    { label: label({ ar: "الوقت", ckb: "کات", en: "Time" }), value: r.time },
    { label: label({ ar: "عدد الضيوف", ckb: "ژمارەی میوان", en: "Guests" }), value: String(r.guests) },
    { label: label({ ar: "المكان", ckb: "شوێن", en: "Space" }), value: spaceName(r.space) },
    { label: label({ ar: "المناسبة", ckb: "بۆنە", en: "Occasion" }), value: occasionName(r.audience, r.occasion) },
  ];
  if (r.audience === "business" && r.company) {
    rows.push({ label: label({ ar: "الشركة", ckb: "کۆمپانیا", en: "Company" }), value: r.company });
  }

  const footer = say({
    ar: `${VENUE.name} — ${VENUE.address}. لتعديل الطلب أو إلغائه، ردّ على هذه الرسالة.`,
    ckb: `${VENUE.name} — ${VENUE.address}. بۆ گۆڕین یان هەڵوەشاندنەوەی داواکارییەکە، وەڵامی ئەم نامەیە بدەرەوە.`,
    en: `${VENUE.name} — ${VENUE.address}. To change or cancel, reply to this message.`,
  });

  const subject = say({
    ar: `طلب حجز ${VENUE.name} — ${r.reference}`,
    ckb: `داواکاریی حجزی ${VENUE.name} — ${r.reference}`,
    en: `${VENUE.name} reservation request — ${r.reference}`,
  });

  return {
    from: settings.from,
    to: [r.email],
    // A guest replying to their confirmation is answered by the desk.
    replyTo: settings.to[0],
    subject,
    text: plain(title, intro, rows, footer),
    html: shell(title, intro, rows, footer, r.lang === "en" ? "ltr" : "rtl"),
  };
}

/* =============================================================== handler === */

export interface ReservationOutcome {
  status: number;
  body: Record<string, unknown>;
}

export interface ReservationRequest {
  payload: any;
  settings: MailSettings;
  /** How to send. Node passes sendMailNode; the Worker passes sendMail. */
  send: MailSender;
  /** Injectable so the date checks can be exercised. */
  now?: Date;
}

/**
 * Take one reservation.
 *
 * Success means the desk copy was accepted by the mail provider. Anything less
 * is reported as a failure with somewhere else to go, because a booking the
 * venue never sees is a guest arriving to no table.
 */
export async function handleReservation({
  payload,
  settings,
  send,
  now = new Date(),
}: ReservationRequest): Promise<ReservationOutcome> {
  const lang = asLang(payload?.lang);
  const say = (choices: Says) => choices[lang];

  /* Honeypot. A field kept off-screen that no human fills and most bots do.
     Answering with a plausible success is deliberate — telling a bot it was
     detected just teaches whoever wrote it to leave the field alone. */
  if (typeof payload?.website === "string" && payload.website.trim()) {
    return { status: 200, body: { ok: true, reference: reference(now) } };
  }

  const { ok, errors, reservation } = validate(payload, lang, now);
  if (!ok || !reservation) {
    return {
      status: 400,
      body: {
        error: "INVALID",
        fields: errors,
        message: say({
          ar: "بعض الحقول تحتاج إلى مراجعة.",
          ckb: "چەند خانەیەک پێویستیان بە پێداچوونەوەیە.",
          en: "A few fields need another look.",
        }),
      },
    };
  }

  const readiness = mailReadiness(settings);
  if (!readiness.ready) {
    /* Unconfigured is a supported state everywhere in this codebase, but it
       cannot be a silent one here. The reason goes to the log for whoever
       deployed it; the guest gets a way to reach a human. */
    console.warn(`Green Gardens reservations are not configured: ${readiness.reason}`);
    return {
      status: 503,
      body: {
        error: "NOT_CONFIGURED",
        message: say({
          ar: "نظام الحجز غير مفعّل على هذه النسخة، فلم يُرسَل طلبك. تواصل معنا مباشرة وسنحجز لك.",
          ckb: "سیستەمی حجز لەسەر ئەم نەخشەیە چالاک نەکراوە، بۆیە داواکارییەکەت نەنێردرا. ڕاستەوخۆ پەیوەندیمان پێوە بکە و بۆت حجز دەکەین.",
          en: "Reservations aren't switched on for this deployment, so your request was not sent. Contact us directly and we'll book it for you.",
        }),
      },
    };
  }

  try {
    await send(deskEmail(reservation, settings), settings);
  } catch (err) {
    const detail = err instanceof MailError ? err.message : String(err);
    console.error(`Green Gardens reservation ${reservation.reference} could not be delivered:`, detail);
    return {
      status: 502,
      body: {
        error: "NOT_DELIVERED",
        message: say({
          ar: "تعذّر إرسال طلبك في هذه اللحظة. حاول مرة أخرى بعد قليل، أو تواصل معنا مباشرة.",
          ckb: "لەم ساتەدا نەتوانرا داواکارییەکەت بنێردرێت. دوای کەمێک دووبارە هەوڵ بدەرەوە، یان ڕاستەوخۆ پەیوەندیمان پێوە بکە.",
          en: "Your request couldn't be sent just now. Try again in a moment, or contact us directly.",
        }),
      },
    };
  }

  /* The guest's copy is a courtesy, not the booking. If their mail server
     bounces it the desk still has the reservation, so a failure here is
     logged and nothing more — telling the guest their confirmed booking
     failed would be false. */
  let confirmationSent = false;
  if (settings.confirmGuest) {
    try {
      await send(guestEmail(reservation, settings), settings);
      confirmationSent = true;
    } catch (err) {
      console.warn(
        `Green Gardens confirmation to the guest for ${reservation.reference} failed:`,
        err instanceof MailError ? err.message : err,
      );
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      reference: reservation.reference,
      confirmationSent,
      message: say({
        ar: `استلمنا طلبك. رقمه ${reservation.reference}، وسنتواصل معك لتأكيد الحجز.`,
        ckb: `داواکارییەکەت پێگەیشت. ژمارەکەی ${reservation.reference}ـە، و پەیوەندیت پێوە دەکەین بۆ دڵنیاکردنەوەی حجزەکە.`,
        en: `We have your request. It is reference ${reservation.reference}, and we'll be in touch to confirm.`,
      }),
    },
  };
}
