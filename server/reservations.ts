/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Site-visit requests, minus transport, so all four deployment targets share
 * one copy of the flow — the same arrangement as Green AI next door.
 *
 * What is being booked is a VISIT TO THE CLIENT'S PROPERTY. Green Gardens
 * builds gardens; there is nowhere for a client to come to. So the two fields
 * that matter most here are ones a table booking would never carry: where the
 * site is, and roughly how big it is. Without an address there is no visit to
 * make, which is why it is required of everyone.
 *
 * A DAY is asked for, never an hour. The client has no way of knowing which
 * hour suits a crew already booked across the city, so picking one is a guess
 * that the office then has to undo on the phone. Ask for the day, agree the
 * time when you call.
 *
 * A request can come from a private client or from a company, and the two are
 * genuinely different jobs rather than one form with a checkbox: a company
 * needs an invoice address, a registration number and often a purchase order,
 * and none of that should be asked of someone who wants their back garden
 * replanted. So the audience decides which fields are required, and the emails
 * are laid out differently for each.
 *
 * Two messages leave here on a successful request:
 *
 *   1. The office copy, to MAIL_TO. English, dense, every field — it is a work
 *      item, and whoever schedules the crew needs it to look the same every
 *      time regardless of which language the client wrote in.
 *   2. The client's copy, in the language they filled the form in, when they
 *      gave an address and confirmations are switched on.
 *
 * If the office copy cannot be sent, the request FAILS and says so. A form
 * that thanks someone for a visit nobody booked is worse than one that admits
 * it is not wired up.
 */

import {
  COMPANY,
  PROJECTS,
  SERVICE_IDS,
  projectName,
  serviceName,
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
  /** Preferred day for the visit. The office fixes the hour when it calls —
   *  a client cannot know which hour suits a crew that is already booked. */
  date: string;
  /** Where the garden is. The whole point of the request. */
  siteAddress: string;
  /** Rough size in square metres. Clients estimate; the visit measures. */
  areaM2: number;
  service: string;
  project: string;
  notes: string;
  /** Business requests only. */
  company: string;
  companyRole: string;
  taxId: string;
  invoiceEmail: string;
  poNumber: string;
  lang: Lang;
  submittedAt: string;
}

/* ============================================================ validation === */

const MAX = { name: 120, email: 160, phone: 40, address: 400, notes: 1200, company: 160, role: 120, taxId: 60, po: 80 };

const text = (value: unknown, limit: number): string =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

/* Deliberately loose. The strict-looking address regexes people paste in
   reject valid addresses, and the real check is whether the confirmation
   arrives — this only catches the typo that has no @ in it at all. */
const looksLikeEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

/* Enough digits to dial, in any of the formats people actually type. */
const looksLikePhone = (value: string): boolean => (value.match(/\d/g) ?? []).length >= 7;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
      ar: "هذا التاريخ مضى. اختر يومًا قادمًا للزيارة.",
      ckb: "ئەم بەروارە تێپەڕیوە. ڕۆژێکی داهاتوو بۆ سەردانەکە هەڵبژێرە.",
      en: "That date has passed. Pick a day still to come for the visit.",
    });
  } else if (day > today + MAX_DAYS_AHEAD * DAY_MS) {
    errors.date = say({
      ar: "هذا التاريخ بعيد جدًا. راسلنا مباشرة لموعد أبعد من ذلك.",
      ckb: "ئەم بەروارە زۆر دوورە. بۆ کاتێکی دوورتر ڕاستەوخۆ پەیوەندیمان پێوە بکە.",
      en: "That is further out than the diary goes. Contact us directly for a date that far ahead.",
    });
  }

  /* The address is the job. Without it there is nowhere to send a crew, so it
     is required of everyone — the one field a client cannot skip. */
  const siteAddress = text(raw?.siteAddress, MAX.address);
  if (siteAddress.length < 8) {
    errors.siteAddress = say({
      ar: "اكتب عنوان الموقع — أين الحديقة؟",
      ckb: "ناونیشانی شوێنەکە بنووسە — باخچەکە لە کوێیە؟",
      en: "Enter the site address — where is the garden?",
    });
  }

  /* An estimate, not a survey. Clients pace it out or guess from the plot, and
     the visit is what measures it, so the range is wide on purpose. */
  const areaM2 = Number(raw?.areaM2);
  if (!Number.isFinite(areaM2) || areaM2 < 1 || areaM2 > COMPANY.maxAreaM2) {
    errors.areaM2 = say({
      ar: `المساحة التقريبية بين 1 و${COMPANY.maxAreaM2.toLocaleString("en-US")} متر مربع.`,
      ckb: `ڕووبەری نزیکەیی لە نێوان 1 و ${COMPANY.maxAreaM2.toLocaleString("en-US")} مەتر چوارگۆشە بێت.`,
      en: `The approximate area should be between 1 and ${COMPANY.maxAreaM2.toLocaleString("en-US")} m².`,
    });
  }

  const service = text(raw?.service, 40);
  if (!SERVICE_IDS.includes(service)) {
    errors.service = say({
      ar: "اختر الخدمة المطلوبة.",
      ckb: "خزمەتگوزارییە پێویستەکە هەڵبژێرە.",
      en: "Choose the service you need.",
    });
  }

  const project = text(raw?.project, 40);
  const allowed = (PROJECTS[audience] as readonly { id: string }[]).map((p) => p.id);
  if (!allowed.includes(project)) {
    errors.project = say({
      ar: "اختر نوع الموقع.",
      ckb: "جۆری شوێنەکە هەڵبژێرە.",
      en: "Choose what kind of site it is.",
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
      siteAddress,
      areaM2,
      service,
      project,
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

/** Rows the office sees, in the order it works through them.
 *
 *  The address is second, under the reference: whoever reads this is deciding
 *  which crew goes where, and where is the first thing they need. */
function officeRows(r: Reservation): Row[] {
  const rows: Row[] = [
    { label: "Reference", value: r.reference },
    { label: "Site address", value: r.siteAddress },
    { label: "Client type", value: r.audience === "business" ? "Business" : "Individual" },
    { label: "Service wanted", value: serviceName(r.service) },
    { label: "Site type", value: projectName(r.audience, r.project) },
    { label: "Approx. area", value: `${r.areaM2.toLocaleString("en-US")} m²` },
    { label: "Visit requested", value: r.date },
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
        <div style="color:${GREEN};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">${escapeHtml(COMPANY.name)}</div>
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
    COMPANY.name.toUpperCase(),
    title,
    "",
    intro,
    "",
    ...rows.map(({ label, value }) => `${label}: ${value}`),
    "",
    footer,
  ].join("\n");

/** The office copy. English by design — see the note at the top of the file. */
export function officeEmail(r: Reservation, settings: MailSettings): OutgoingMail {
  const rows = officeRows(r);
  const kind = r.audience === "business" ? "Business" : "Private";
  const title = `Site visit requested — ${r.date}`;
  const intro = `${r.name} has asked for a visit to ${r.siteAddress}, for ${serviceName(r.service).toLowerCase()} on roughly ${r.areaM2.toLocaleString("en-US")} m². Confirm the appointment with them directly; this message is the only record.`;
  const footer = `Sent by the ${COMPANY.name} website. Reply to this message to answer the client.`;

  return {
    from: settings.from,
    to: settings.to,
    bcc: settings.bcc,
    // So hitting reply in the office mailbox writes to the client, not itself.
    replyTo: r.email,
    subject: `[${r.reference}] ${kind} site visit — ${r.date} — ${serviceName(r.service)}`,
    text: plain(title, intro, rows, footer),
    html: shell(title, intro, rows, footer, "ltr"),
  };
}

/** The client's copy, in the language they used. */
export function clientEmail(r: Reservation, settings: MailSettings): OutgoingMail {
  const say = (choices: Says) => choices[r.lang];

  const title = say({
    ar: "استلمنا طلب زيارة الموقع",
    ckb: "داواکاریی سەردانی شوێنەکەت پێگەیشت",
    en: "We have your site visit request",
  });

  const intro = say({
    ar: `شكرًا ${r.name}. هذا طلب زيارة وليس موعدًا مؤكدًا — يراجعه المكتب ويتواصل معك لتثبيت الوقت. الزيارة مجانية ولا يترتب عليها أي التزام، وبعدها نرسل لك عرض السعر. رقم الطلب ${r.reference}.`,
    ckb: `سوپاس ${r.name}. ئەمە داواکاریی سەردانە نەک کاتێکی جێگیر — نووسینگە پێداچوونەوەی بۆ دەکات و پەیوەندیت پێوە دەکات بۆ جێگیرکردنی کاتەکە. سەردانەکە بێبەرامبەرە و هیچ ئەرکێکت ناخاتە سەر، و دوای ئەوە نرخەکەت بۆ دەنێرین. ژمارەی داواکاری ${r.reference}.`,
    en: `Thank you, ${r.name}. This is a request rather than a confirmed appointment — the office will review it and come back to you to fix a time. The visit is free and commits you to nothing; the quotation follows it. Your reference is ${r.reference}.`,
  });

  const label = (choices: Says) => say(choices);
  const rows: Row[] = [
    { label: label({ ar: "رقم الطلب", ckb: "ژمارەی داواکاری", en: "Reference" }), value: r.reference },
    { label: label({ ar: "عنوان الموقع", ckb: "ناونیشانی شوێن", en: "Site address" }), value: r.siteAddress },
    { label: label({ ar: "الخدمة", ckb: "خزمەتگوزاری", en: "Service" }), value: serviceName(r.service) },
    { label: label({ ar: "نوع الموقع", ckb: "جۆری شوێن", en: "Site type" }), value: projectName(r.audience, r.project) },
    { label: label({ ar: "المساحة التقريبية", ckb: "ڕووبەری نزیکەیی", en: "Approx. area" }), value: `${r.areaM2.toLocaleString("en-US")} m²` },
    { label: label({ ar: "اليوم المطلوب", ckb: "ڕۆژی داواکراو", en: "Day requested" }), value: r.date },
  ];
  if (r.audience === "business" && r.company) {
    rows.push({ label: label({ ar: "الشركة", ckb: "کۆمپانیا", en: "Company" }), value: r.company });
  }

  const footer = say({
    ar: `${COMPANY.name} — ${COMPANY.phone} — ${COMPANY.email}. لتعديل الطلب أو إلغائه، ردّ على هذه الرسالة.`,
    ckb: `${COMPANY.name} — ${COMPANY.phone} — ${COMPANY.email}. بۆ گۆڕین یان هەڵوەشاندنەوەی داواکارییەکە، وەڵامی ئەم نامەیە بدەرەوە.`,
    en: `${COMPANY.name} — ${COMPANY.phone} — ${COMPANY.email}. To change or cancel, reply to this message.`,
  });

  const subject = say({
    ar: `طلب زيارة موقع ${COMPANY.name} — ${r.reference}`,
    ckb: `داواکاریی سەردانی شوێنی ${COMPANY.name} — ${r.reference}`,
    en: `${COMPANY.name} site visit request — ${r.reference}`,
  });

  return {
    from: settings.from,
    to: [r.email],
    // A client replying to their confirmation is answered by the office.
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
 * Take one site-visit request.
 *
 * Success means the office copy was accepted by the mail provider. Anything
 * less is reported as a failure with somewhere else to go, because a request
 * the office never sees is a client waiting in a garden for a crew that was
 * never told to come.
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
    console.warn(`Green Gardens site-visit requests are not configured: ${readiness.reason}`);
    return {
      status: 503,
      body: {
        error: "NOT_CONFIGURED",
        message: say({
          ar: `نموذج الطلب غير مفعّل على هذه النسخة، فلم يُرسَل طلبك. اتصل بنا على ${COMPANY.phone} وسنحدّد لك موعد الزيارة.`,
          ckb: `فۆرمی داواکاری لەسەر ئەم نەخشەیە چالاک نەکراوە، بۆیە داواکارییەکەت نەنێردرا. پەیوەندی بکە بە ${COMPANY.phone} و کاتی سەردانەکەت بۆ دیاری دەکەین.`,
          en: `The request form isn't switched on for this deployment, so nothing was sent. Call us on ${COMPANY.phone} and we'll arrange the visit.`,
        }),
      },
    };
  }

  try {
    await send(officeEmail(reservation, settings), settings);
  } catch (err) {
    const detail = err instanceof MailError ? err.message : String(err);
    console.error(`Green Gardens reservation ${reservation.reference} could not be delivered:`, detail);
    return {
      status: 502,
      body: {
        error: "NOT_DELIVERED",
        message: say({
          ar: `تعذّر إرسال طلبك في هذه اللحظة. حاول مرة أخرى بعد قليل، أو اتصل بنا على ${COMPANY.phone}.`,
          ckb: `لەم ساتەدا نەتوانرا داواکارییەکەت بنێردرێت. دوای کەمێک دووبارە هەوڵ بدەرەوە، یان پەیوەندی بکە بە ${COMPANY.phone}.`,
          en: `Your request couldn't be sent just now. Try again in a moment, or call us on ${COMPANY.phone}.`,
        }),
      },
    };
  }

  /* The client's copy is a courtesy, not the request. If their mail server
     bounces it, the office still has the job, so a failure here is logged and
     nothing more — telling the client their request failed would be false. */
  let confirmationSent = false;
  if (settings.confirmGuest) {
    try {
      await send(clientEmail(reservation, settings), settings);
      confirmationSent = true;
    } catch (err) {
      console.warn(
        `Green Gardens confirmation to the client for ${reservation.reference} failed:`,
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
        ar: `استلمنا طلبك. رقمه ${reservation.reference}، وسنتواصل معك لتحديد موعد الزيارة.`,
        ckb: `داواکارییەکەت پێگەیشت. ژمارەکەی ${reservation.reference}ـە، و پەیوەندیت پێوە دەکەین بۆ دیاریکردنی کاتی سەردانەکە.`,
        en: `We have your request. It is reference ${reservation.reference}, and we'll be in touch to fix a time for the visit.`,
      }),
    },
  };
}
