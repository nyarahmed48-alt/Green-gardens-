/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Green Gardens — every visible string, in Arabic, Sorani Kurdish and English.
 *
 * One file, one entry per string, so a reviewer can read three lines and see
 * straight away whether they say the same thing. `ckb` is required rather than
 * optional for the same reason: a missing Kurdish string is a type error, not
 * a silent fall back to English.
 *
 * Arabic is Modern Standard. The Kurdish is Sorani in the Arabic script, which
 * is what Erbil reads. Western numerals throughout — they are what regional
 * business writing uses and they keep prices legible in both directions.
 *
 * "Green Gardens" stays in Latin script in all three languages. It is the
 * venue's name, not a phrase to translate.
 *
 * IMPORTANT — the `id` fields below are a contract with the server. Space and
 * occasion ids are validated against server/brand.ts, and a booking carrying
 * an id that file does not know is rejected. Change one, change both.
 */

import type { Copy } from "./i18n";

/**
 * A photograph on the page.
 *
 * Every slot is optional. With none, the page renders palette gradients and
 * looks deliberate rather than half-finished, so photographs can be added one
 * at a time — see public/photos/README.md.
 *
 * Alt text is required and carries all three languages, because here the
 * photographs are the content. "A photo of the garden" helps nobody; say what
 * is actually in the frame.
 */
export interface Photo {
  /** Path under public/, e.g. "/photos/hero.jpg". */
  src: string;
  alt: Copy;
}

export const GARDEN = {
  name: "Green Gardens",

  kicker: {
    ar: "حديقة خاصة ومطعم · أربيل",
    ckb: "باخچەیەکی تایبەت و چێشتخانە · هەولێر",
    en: "Private garden estate & restaurant · Erbil",
  },
  tagline: {
    ar: "أربعة دونمات من الحدائق، وثلاث مساحات، ومساء واحد لا يشبه غيره.",
    ckb: "چوار دۆنم باخچە، سێ شوێن، و ئێوارەیەک کە لە هیچی تر ناچێت.",
    en: "Four acres of garden, three spaces, and an evening that doesn't look like anywhere else.",
  },
  intro: {
    ar: "نستضيف العشاء والأعراس والمناسبات الخاصة ومناسبات الشركات تحت أشجار الزيتون. المطبخ مفتوح كل يوم، والحجز يبدأ من طاولة لشخصين وحتى الحديقة كاملة.",
    ckb: "نانی ئێوارە، زەماوەند، بۆنەی تایبەت و بۆنەی کۆمپانیاکان لە ژێر دار زەیتوونەکاندا بەڕێوە دەبەین. چێشتخانە هەموو ڕۆژێک کراوەیە، و حجز لە مێزێکی دوو کەسییەوە دەست پێدەکات تا هەموو باخچەکە.",
    en: "We host dinner, weddings, private celebrations and company events under the olive trees. The kitchen is open every day, and a booking runs from a table for two to the whole estate.",
  },
  ctaReserve: { ar: "احجز الآن", ckb: "ئێستا حجز بکە", en: "Reserve now" },
  ctaSpaces: { ar: "شاهد المساحات", ckb: "شوێنەکان ببینە", en: "See the spaces" },

  /* ------------------------------------------------------------- figures */
  stats: [
    {
      value: "220",
      label: { ar: "ضيفًا في المساحة الكاملة", ckb: "میوان لە هەموو شوێنەکەدا", en: "guests across the estate" },
    },
    {
      value: "3",
      label: { ar: "مساحات منفصلة", ckb: "شوێنی جیاواز", en: "separate spaces" },
    },
    {
      value: "1998",
      label: { ar: "زرعنا أول شجرة", ckb: "یەکەم دارمان چاند", en: "the year we planted the first tree" },
    },
  ],

  /* --------------------------------------------------------------- story */
  storyTitle: { ar: "المكان", ckb: "شوێنەکە", en: "The place" },
  story: [
    {
      ar: "بدأت الحديقة بستّ شجرات زيتون وبيت زجاجي صغير على طريق برمام. لم تكن مطعمًا في البداية — كانت أرضًا للعائلة، وكان الناس يسألون إن كان بإمكانهم إقامة أعراسهم فيها.",
      ckb: "باخچەکە بە شەش دار زەیتوون و ماڵێکی بچووکی شووشەیی لەسەر ڕێگای پیرمام دەستی پێکرد. لە سەرەتادا چێشتخانە نەبوو — زەوی خێزان بوو، و خەڵک دەپرسین ئایا دەتوانن زەماوەندەکانیان لێرە بکەن.",
      en: "The garden began with six olive trees and a small glass house on the Pirmam road. It was not a restaurant at first — it was family land, and people kept asking whether they could hold their weddings in it.",
    },
    {
      ar: "بعد خمسة وعشرين عامًا صارت الأشجار مظلّة، والبيت الزجاجي قاعة تتّسع لمئة وعشرين. ما بقي كما هو: كل مناسبة واحدة في اليوم، ولا مناسبتين في الوقت نفسه.",
      ckb: "دوای بیست و پێنج ساڵ دارەکان بوونە سێبەر، و ماڵە شووشەییەکەش بووە هۆڵێک کە سەد و بیست کەس هەڵدەگرێت. ئەوەی نەگۆڕاوە: ڕۆژانە تەنها یەک بۆنە، هەرگیز دوو بۆنە پێکەوە.",
      en: "Twenty-five years on, the trees are a canopy and the glass house seats a hundred and twenty. What hasn't changed: one event a day, never two at once.",
    },
  ],

  /* -------------------------------------------------------------- spaces */
  spacesTitle: { ar: "المساحات", ckb: "شوێنەکان", en: "The spaces" },
  spacesNote: {
    ar: "كل مساحة تُحجز وحدها، أو تُحجز الحديقة كاملة لمناسبة واحدة.",
    ckb: "هەر شوێنێک بە تەنها حجز دەکرێت، یان هەموو باخچەکە بۆ یەک بۆنە.",
    en: "Each space books on its own, or take the whole estate for a single event.",
  },
  /* ids match SPACES in greengardens/brand.ts. */
  spaces: [
    {
      id: "terrace",
      name: { ar: "التراس", ckb: "تەراس", en: "The Terrace" },
      seats: { ar: "60 ضيفًا", ckb: "60 میوان", en: "seats 60" },
      body: {
        ar: "عشاء في الهواء الطلق تحت أشجار الزيتون، مع تدفئة في الشتاء. هنا يجلس معظم الضيوف في أي مساء عادي.",
        ckb: "نانی ئێوارە لە هەوای کراوەدا لە ژێر دار زەیتوونەکان، بە گەرمکەرەوە لە زستاندا. زۆربەی میوانان لە ئێوارەیەکی ئاساییدا لێرە دادەنیشن.",
        en: "Open-air dining under the olive canopy, heated through winter. This is where most guests sit on an ordinary evening.",
      },
    },
    {
      id: "orangery",
      name: { ar: "البيت الزجاجي", ckb: "ماڵە شووشەییەکە", en: "The Orangery" },
      seats: { ar: "120 ضيفًا", ckb: "120 میوان", en: "seats 120" },
      body: {
        ar: "القاعة الزجاجية التي تُقام فيها الأعراس وحفلات إطلاق المنتجات. سقف زجاجي، وأرضية رقص، ومدخل خاص.",
        ckb: "هۆڵە شووشەییەکە کە زەماوەند و بۆنەی دەستپێکردنی بەرهەمی تێدا بەڕێوە دەچێت. سەقفی شووشەیی، شوێنی سەما، و دەروازەیەکی تایبەت.",
        en: "The glass room, used for weddings and launches. Glass roof, a dance floor, and its own entrance.",
      },
    },
    {
      id: "grove",
      name: { ar: "الحديقة المسوّرة", ckb: "باخچە دیوارلێدراوەکە", en: "The Grove" },
      seats: { ar: "24 ضيفًا", ckb: "24 میوان", en: "seats 24" },
      body: {
        ar: "حديقة صغيرة مسوّرة للعشاءات المغلقة واجتماعات مجالس الإدارة. هادئة، ومنفصلة تمامًا عن بقية الحديقة.",
        ckb: "باخچەیەکی بچووکی دیوارلێدراو بۆ نانی ئێوارەی داخراو و کۆبوونەوەی ئەنجومەن. بێدەنگ، و بە تەواوی جیا لە باقی باخچەکە.",
        en: "A small walled garden for closed dinners and board meetings. Quiet, and fully separate from the rest of the grounds.",
      },
    },
    {
      id: "whole",
      name: { ar: "الحديقة كاملة", ckb: "هەموو باخچەکە", en: "The whole estate" },
      seats: { ar: "220 ضيفًا", ckb: "220 میوان", en: "seats 220" },
      body: {
        ar: "المساحات الثلاث معًا، حصريًا، لمناسبة واحدة. تُغلق الحديقة أمام الجمهور في ذلك اليوم.",
        ckb: "هەر سێ شوێنەکە پێکەوە، بە تایبەتی، بۆ یەک بۆنە. لەو ڕۆژەدا باخچەکە بۆ خەڵکی گشتی دادەخرێت.",
        en: "All three spaces, exclusively, for one event. The garden closes to the public that day.",
      },
    },
  ],

  /* ------------------------------------------------------------ packages */
  packagesTitle: { ar: "الباقات", ckb: "پاکێجەکان", en: "Packages" },
  packagesNote: {
    ar: "الأسعار للفرد الواحد بالدينار العراقي، شاملة الخدمة. الباقات النهائية تُتّفق مع مكتب الحجوزات.",
    ckb: "نرخەکان بۆ هەر کەسێک بە دیناری عێراقین، خزمەتگوزاری تێیدایە. پاکێجی کۆتایی لەگەڵ نووسینگەی حجز ڕێک دەکەوێت.",
    en: "Per head, in Iraqi dinar, service included. The final package is agreed with the reservations desk.",
  },
  packages: [
    {
      name: { ar: "طاولة في الحديقة", ckb: "مێزێک لە باخچەدا", en: "Garden table" },
      detail: { ar: "قائمة مفتوحة على التراس، من ضيفين", ckb: "لیستی کراوە لە تەراس، لە دوو میوانەوە", en: "à la carte on the Terrace, from two guests" },
      price: { ar: "من 35,000", ckb: "لە 35,000ـەوە", en: "from 35,000" },
    },
    {
      name: { ar: "مناسبة خاصة", ckb: "بۆنەی تایبەت", en: "Celebration" },
      detail: { ar: "قائمة ثابتة، ورد، طاولة كعك، أربع ساعات", ckb: "لیستی دیاریکراو، گوڵ، مێزی کێک، چوار کاتژمێر", en: "set menu, flowers, cake table, four hours" },
      price: { ar: "من 55,000", ckb: "لە 55,000ـەوە", en: "from 55,000" },
    },
    {
      name: { ar: "زفاف", ckb: "زەماوەند", en: "Wedding" },
      detail: { ar: "البيت الزجاجي، خدمة كاملة، 60 ضيفًا كحد أدنى", ckb: "ماڵە شووشەییەکە، خزمەتگوزاریی تەواو، لانیکەم 60 میوان", en: "the Orangery, full service, 60 guests minimum" },
      price: { ar: "من 85,000", ckb: "لە 85,000ـەوە", en: "from 85,000" },
    },
    {
      name: { ar: "مناسبات الشركات", ckb: "بۆنەی کۆمپانیاکان", en: "Corporate" },
      detail: { ar: "أي مساحة، شاشات وصوتيات، فاتورة باسم الشركة", ckb: "هەر شوێنێک، پەردە و دەنگ، پسوولە بە ناوی کۆمپانیا", en: "any space, AV and screens, invoiced to the company" },
      price: { ar: "من 65,000", ckb: "لە 65,000ـەوە", en: "from 65,000" },
    },
  ],

  /* ------------------------------------------------------------- gallery */
  galleryTitle: { ar: "من الحديقة", ckb: "لە باخچەکەوە", en: "Inside the gardens" },
  galleryNote: {
    ar: "التراس والبيت الزجاجي والحديقة المسوّرة، على مدار السنة.",
    ckb: "تەراس، ماڵە شووشەییەکە و باخچە دیوارلێدراوەکە، بە درێژایی ساڵ.",
    en: "The Terrace, the Orangery and the Grove, through the year.",
  },

  /* ------------------------------------------------------------- reviews */
  reviewsTitle: { ar: "ماذا قالوا", ckb: "چییان وت", en: "What guests say" },
  reviews: [
    {
      quote: {
        ar: "أقمنا زفافنا في البيت الزجاجي في تشرين. لم يشعر أحد أنه في قاعة أفراح، وهذا بالضبط ما أردناه.",
        ckb: "زەماوەندەکەمان لە ماڵە شووشەییەکەدا لە تشرینی یەکەمدا کرد. کەس هەست ناکات لە هۆڵێکی زەماوەنددایە، و ئەوەش بەتەواوی ئەوە بوو کە دەمانویست.",
        en: "We had our wedding in the Orangery in October. Nobody felt like they were in a wedding hall, which was exactly the point.",
      },
      author: { ar: "دلَير و شنَى", ckb: "دلێر و شنێ", en: "Dler & Shne" },
    },
    {
      quote: {
        ar: "حجزنا الحديقة المسوّرة لعشاء مع عملاء من الخارج. مكان هادئ، وخدمة تعرف متى تختفي.",
        ckb: "باخچە دیوارلێدراوەکەمان بۆ نانی ئێوارە لەگەڵ کڕیارانی دەرەوە حجز کرد. شوێنێکی بێدەنگ، و خزمەتگوزارییەک کە دەزانێت کەی ون بێت.",
        en: "We took the Grove for a dinner with visiting clients. A quiet room, and staff who know when to disappear.",
      },
      author: { ar: "ريڤين ح. — مدير عام", ckb: "ڕێڤین ح. — بەڕێوەبەری گشتی", en: "Revin H. — managing director" },
    },
    {
      quote: {
        ar: "نأتي مساء كل خميس منذ سنتين. الطاولة نفسها تحت الزيتونة نفسها.",
        ckb: "دوو ساڵە هەموو ئێوارەی پێنجشەممە دێین. هەمان مێز لە ژێر هەمان دار زەیتوون.",
        en: "We've come every Thursday evening for two years. The same table under the same olive tree.",
      },
      author: { ar: "سارة ع.", ckb: "سارا ع.", en: "Sara A." },
    },
  ],

  /* --------------------------------------------------------------- visit */
  visitTitle: { ar: "الزيارة", ckb: "سەردان", en: "Visit" },
  hoursTitle: { ar: "أوقات العمل", ckb: "کاتی کارکردن", en: "Opening hours" },
  hours: [
    {
      day: { ar: "السبت – الخميس", ckb: "شەممە – پێنجشەممە", en: "Saturday – Thursday" },
      time: { ar: "12:00 ظهرًا – 11:30 مساءً", ckb: "12:00 – 23:30", en: "12:00 – 23:30" },
    },
    {
      day: { ar: "الجمعة", ckb: "هەینی", en: "Friday" },
      time: { ar: "1:00 ظهرًا – 11:30 مساءً", ckb: "13:00 – 23:30", en: "13:00 – 23:30" },
    },
  ],
  addressTitle: { ar: "العنوان", ckb: "ناونیشان", en: "Address" },
  address: {
    ar: "طريق برمام، كيلومتر 6\nأربيل، إقليم كردستان",
    ckb: "ڕێگای پیرمام، کیلۆمەتر 6\nهەولێر، هەرێمی کوردستان",
    en: "Pirmam Road, Kilometre 6\nErbil, Kurdistan Region",
  },
  leadTimeTitle: { ar: "قبل كم؟", ckb: "چەند پێشتر؟", en: "How far ahead?" },
  leadTime: {
    ar: "طاولة العشاء: في اليوم نفسه إن توفّرت.\nمناسبة خاصة: سبعة أيام على الأقل.",
    ckb: "مێزی نانی ئێوارە: هەمان ڕۆژ ئەگەر بەردەست بوو.\nبۆنەی تایبەت: لانیکەم حەوت ڕۆژ پێشتر.",
    en: "A dinner table: same day, if there is room.\nA private event: at least seven days.",
  },

  /* Photographs. Every slot optional — a demo with none renders the palette
     gradients and looks deliberate rather than broken. See
     public/demos/README.md for where the files go. */
  heroPhoto: undefined as Photo | undefined,
  storyPhoto: undefined as Photo | undefined,
  gallery: [] as Photo[],
};

/* ====================================================== reservation form === */

/** Occasion ids match OCCASIONS in greengardens/brand.ts. */
export const OCCASIONS: Record<"individual" | "business", Array<{ id: string; name: Copy }>> = {
  individual: [
    { id: "dining", name: { ar: "حجز عشاء", ckb: "حجزی نانی ئێوارە", en: "Dinner reservation" } },
    { id: "celebration", name: { ar: "عيد ميلاد أو مناسبة عائلية", ckb: "ڕۆژی لەدایکبوون یان بۆنەی خێزانی", en: "Birthday or family celebration" } },
    { id: "wedding", name: { ar: "زفاف أو خطوبة", ckb: "زەماوەند یان دەستگیران", en: "Wedding or engagement" } },
    { id: "viewing", name: { ar: "زيارة لمعاينة المكان", ckb: "سەردان بۆ بینینی شوێنەکە", en: "Viewing — see the gardens first" } },
  ],
  business: [
    { id: "corporate-dinner", name: { ar: "عشاء شركة", ckb: "نانی ئێوارەی کۆمپانیا", en: "Corporate dinner" } },
    { id: "launch", name: { ar: "إطلاق منتج أو مؤتمر صحفي", ckb: "دەستپێکردنی بەرهەم یان بۆنەی ڕاگەیاندن", en: "Product launch or press event" } },
    { id: "conference", name: { ar: "مؤتمر أو يوم عمل", ckb: "کۆنفرانس یان ڕۆژی کاری", en: "Conference or away day" } },
    { id: "retainer", name: { ar: "اتفاقية ضيافة متكررة", ckb: "ڕێککەوتنی میوانداریی بەردەوام", en: "Recurring hospitality agreement" } },
  ],
};

export const FORM = {
  eyebrow: { ar: "الحجز", ckb: "حجزکردن", en: "Reservations" },
  title: { ar: "احجز في Green Gardens", ckb: "لە Green Gardens حجز بکە", en: "Book Green Gardens" },
  lede: {
    ar: "املأ الطلب ويصل مباشرة إلى مكتب الحجوزات. نردّ للتأكيد — هذا طلب وليس تأكيدًا نهائيًا.",
    ckb: "داواکارییەکە پڕ بکەرەوە و ڕاستەوخۆ دەگاتە نووسینگەی حجز. وەڵامت دەدەینەوە بۆ دڵنیاکردنەوە — ئەمە داواکارییە نەک دڵنیایی کۆتایی.",
    en: "Fill this in and it reaches the reservations desk directly. We reply to confirm — this is a request, not a confirmed booking.",
  },

  /* The two halves of the flow. A private guest and a company are asked for
     different things, so this is a real fork rather than a checkbox. */
  individual: { ar: "شخص", ckb: "کەسێک", en: "Individual" },
  business: { ar: "شركة", ckb: "کۆمپانیا", en: "Business" },
  individualHint: {
    ar: "عشاء، عيد ميلاد، زفاف، أو زيارة لمعاينة المكان.",
    ckb: "نانی ئێوارە، ڕۆژی لەدایکبوون، زەماوەند، یان سەردانی بینینی شوێنەکە.",
    en: "Dinner, a birthday, a wedding, or a look around first.",
  },
  businessHint: {
    ar: "فاتورة باسم الشركة، مع إمكانية الشراء بأمر شراء.",
    ckb: "پسوولە بە ناوی کۆمپانیا، لەگەڵ ئەگەری بەکارهێنانی ئۆردەری کڕین.",
    en: "Invoiced to the company, and can be placed against a purchase order.",
  },

  name: { ar: "الاسم الكامل", ckb: "ناوی تەواو", en: "Full name" },
  email: { ar: "البريد الإلكتروني", ckb: "ئیمەیڵ", en: "Email" },
  phone: { ar: "رقم الهاتف", ckb: "ژمارەی تەلەفۆن", en: "Phone" },
  date: { ar: "التاريخ", ckb: "بەروار", en: "Date" },
  time: { ar: "الوقت", ckb: "کات", en: "Time" },
  guests: { ar: "عدد الضيوف", ckb: "ژمارەی میوان", en: "Guests" },
  space: { ar: "المساحة", ckb: "شوێن", en: "Space" },
  occasion: { ar: "المناسبة", ckb: "بۆنە", en: "What for" },
  notes: { ar: "ملاحظات", ckb: "تێبینی", en: "Notes" },
  notesHint: {
    ar: "حساسية طعام، ترتيب الجلوس، أي شيء يجب أن نعرفه.",
    ckb: "هەستیاریی خواردن، ڕێکخستنی دانیشتن، هەر شتێک کە پێویستە بیزانین.",
    en: "Allergies, seating, anything we should know.",
  },

  company: { ar: "اسم الشركة", ckb: "ناوی کۆمپانیا", en: "Company name" },
  companyRole: { ar: "صفتك", ckb: "پێگەت", en: "Your role" },
  taxId: { ar: "رقم التسجيل الضريبي", ckb: "ژمارەی تۆمارکردنی باج", en: "Registration / tax id" },
  invoiceEmail: { ar: "بريد الفوترة", ckb: "ئیمەیڵی پسوولە", en: "Invoice to" },
  poNumber: { ar: "رقم أمر الشراء", ckb: "ژمارەی ئۆردەری کڕین", en: "Purchase order number" },
  optional: { ar: "اختياري", ckb: "ئیختیاری", en: "optional" },

  submit: { ar: "أرسل الطلب", ckb: "داواکارییەکە بنێرە", en: "Send the request" },
  sending: { ar: "جارٍ الإرسال…", ckb: "دەنێردرێت…", en: "Sending…" },

  successTitle: { ar: "وصلنا طلبك", ckb: "داواکارییەکەت پێمان گەیشت", en: "We have your request" },
  successRef: { ar: "رقم الطلب", ckb: "ژمارەی داواکاری", en: "Reference" },
  successBody: {
    ar: "يراجعه مكتب الحجوزات ويتواصل معك لتثبيت الموعد.",
    ckb: "نووسینگەی حجز پێداچوونەوەی بۆ دەکات و پەیوەندیت پێوە دەکات بۆ جێگیرکردنی.",
    en: "The reservations desk will review it and come back to you to confirm.",
  },
  successMail: {
    ar: "أرسلنا نسخة إلى بريدك أيضًا.",
    ckb: "وێنەیەکیشمان بۆ ئیمەیڵەکەت ناردووە.",
    en: "A copy is on its way to your inbox too.",
  },
  another: { ar: "احجز مرة أخرى", ckb: "دووبارە حجز بکە", en: "Book another" },

  /* Failures the browser can hit before the server ever answers. */
  errOffline: {
    ar: "تعذّر إرسال الطلب. تحقّق من الاتصال وحاول مرة أخرى.",
    ckb: "نەتوانرا داواکارییەکە بنێردرێت. لە پەیوەندییەکە دڵنیا بەرەوە و دووبارە هەوڵ بدە.",
    en: "The request couldn't be sent. Check your connection and try again.",
  },
  errNoBackend: {
    ar: "نموذج الحجز غير موصول على هذه النسخة من الموقع.",
    ckb: "فۆرمی حجز لەسەر ئەم وەشانەی ماڵپەڕەکە پەیوەست نەکراوە.",
    en: "The reservation form isn't connected on this deployment of the site.",
  },
};

/* ============================================================== concierge === */

export const CHAT = {
  name: { ar: "ياسمين", ckb: "یاسمین", en: "Yasmin" },
  role: { ar: "مساعِدة الحجوزات", ckb: "یاریدەدەری حجز", en: "Garden concierge" },
  open: { ar: "اسأل ياسمين", ckb: "لە یاسمین بپرسە", en: "Ask Yasmin" },
  close: { ar: "إغلاق", ckb: "داخستن", en: "Close" },
  clear: { ar: "محادثة جديدة", ckb: "گفتوگۆی نوێ", en: "New conversation" },
  send: { ar: "إرسال", ckb: "ناردن", en: "Send" },
  placeholder: {
    ar: "اسأل عن المساحات أو الأسعار أو المواعيد…",
    ckb: "لەسەر شوێنەکان، نرخەکان یان کاتەکان بپرسە…",
    en: "Ask about the spaces, prices or hours…",
  },
  greeting: {
    ar: "أهلًا بك في Green Gardens. أستطيع أن أشرح المساحات والباقات والمواعيد. للحجز، النموذج في الأسفل يصل مباشرة إلى المكتب.",
    ckb: "بەخێربێیت بۆ Green Gardens. دەتوانم شوێنەکان، پاکێجەکان و کاتەکانت بۆ ڕوون بکەمەوە. بۆ حجز، فۆرمەکەی خوارەوە ڕاستەوخۆ دەگاتە نووسینگە.",
    en: "Welcome to Green Gardens. I can explain the spaces, the packages and the hours. To book, the form below goes straight to the desk.",
  },
  /* Openers, so a visitor who does not know what to ask still gets a useful
     first answer rather than an empty box. */
  prompts: [
    { ar: "كم يتّسع البيت الزجاجي؟", ckb: "ماڵە شووشەییەکە چەند کەس هەڵدەگرێت؟", en: "How many fit in the Orangery?" },
    { ar: "ما تكلفة عشاء شركة؟", ckb: "نانی ئێوارەی کۆمپانیا چەندی تێدەچێت؟", en: "What does a corporate dinner cost?" },
    { ar: "هل تفتحون يوم الجمعة؟", ckb: "ڕۆژی هەینی کراوەن؟", en: "Are you open on Friday?" },
  ],
  note: {
    ar: "مساعِدة ذكية. لا تؤكّد الحجوزات — المكتب هو من يؤكّد.",
    ckb: "یاریدەدەرێکی زیرەکە. حجز جێگیر ناکات — نووسینگە جێگیری دەکات.",
    en: "An AI assistant. It can't confirm a booking — the desk does that.",
  },
  errGeneric: {
    ar: "تعذّر الوصول إلى المساعِدة. النموذج في الأسفل يعمل كالمعتاد.",
    ckb: "نەتوانرا بگەین بە یاریدەدەر. فۆرمەکەی خوارەوە وەک خۆی کار دەکات.",
    en: "The assistant couldn't be reached. The form below still works.",
  },
  errNoBackend: {
    ar: "المساعِدة غير موصولة على هذه النسخة من الموقع.",
    ckb: "یاریدەدەر لەسەر ئەم وەشانەی ماڵپەڕەکە پەیوەست نەکراوە.",
    en: "The assistant isn't connected on this deployment of the site.",
  },
};

/* ============================================================== the site === */

/**
 * How to reach the venue.
 *
 * Placeholders until the real details arrive — WhatsApp is the channel most
 * guests in Erbil will actually use, so it comes first in the header. The
 * number is digits only, country code included, because that is the form
 * wa.me takes.
 */
export const CONTACT = {
  phoneDisplay: "+964 750 000 0000",
  whatsappDigits: "9647500000000",
  email: "reservations@greengardens.iq",
  instagram: "greengardens.erbil",
};

/** Builds a wa.me link, optionally pre-filling the first message. */
export const whatsapp = (message = ""): string =>
  message
    ? `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${CONTACT.whatsappDigits}`;

export const NAV = {
  spaces: { ar: "المساحات", ckb: "شوێنەکان", en: "Spaces" },
  packages: { ar: "الباقات", ckb: "پاکێجەکان", en: "Packages" },
  gallery: { ar: "الصور", ckb: "وێنەکان", en: "Gallery" },
  visit: { ar: "الزيارة", ckb: "سەردان", en: "Visit" },
  reserve: { ar: "احجز", ckb: "حجز بکە", en: "Reserve" },
  openMenu: { ar: "افتح القائمة", ckb: "لیستە بکەرەوە", en: "Open menu" },
  closeMenu: { ar: "أغلق القائمة", ckb: "لیستە دابخە", en: "Close menu" },
  langAria: { ar: "تغيير اللغة", ckb: "گۆڕینی زمان", en: "Change language" },
  skip: { ar: "تخطَّ إلى المحتوى", ckb: "بازبدە بۆ ناوەڕۆک", en: "Skip to content" },
  home: { ar: "الصفحة الرئيسية", ckb: "پەڕەی سەرەکی", en: "Home" },
};

export const FOOTER = {
  blurb: {
    ar: "حديقة خاصة ومطعم على طريق برمام في أربيل. عشاء، وأعراس، ومناسبات الشركات، حتى 220 ضيفًا.",
    ckb: "باخچەیەکی تایبەت و چێشتخانە لەسەر ڕێگای پیرمام لە هەولێر. نانی ئێوارە، زەماوەند، و بۆنەی کۆمپانیاکان، تا 220 میوان.",
    en: "A private garden estate and restaurant on the Pirmam road in Erbil. Dinner, weddings and company events, for up to 220 guests.",
  },
  contactTitle: { ar: "تواصل معنا", ckb: "پەیوەندیمان پێوە بکە", en: "Get in touch" },
  whatsapp: { ar: "راسلنا على واتساب", ckb: "لە واتساپ نامەمان بۆ بنێرە", en: "Message us on WhatsApp" },
  rights: { ar: "جميع الحقوق محفوظة.", ckb: "هەموو مافەکان پارێزراون.", en: "All rights reserved." },
};
