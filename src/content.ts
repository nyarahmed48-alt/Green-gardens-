/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Green Gardens — every visible string, in Arabic, Sorani Kurdish and English.
 *
 * Green Gardens designs and builds gardens. Nobody comes to us: the crew goes
 * to the client's property, so nothing on this page invites a visit and every
 * call to action books a visit the other way round.
 *
 * One file, one entry per string, so a reviewer can read three lines and see
 * straight away whether they say the same thing. `ckb` is required rather than
 * optional for the same reason: a missing Kurdish string is a type error, not
 * a silent fall back to English.
 *
 * Arabic is Modern Standard — the language Baghdad reads first, and the site
 * default. The Kurdish is Sorani in the Arabic script, kept because clients
 * come from across Iraq. Western numerals throughout: they are what regional
 * business writing uses and they keep prices legible in both directions.
 *
 * "Green Gardens" stays in Latin script in all three languages. It is the
 * company's name, not a phrase to translate.
 *
 * IMPORTANT — the `id` fields below are a contract with the server. Service
 * and site-type ids are validated against server/brand.ts, and a request
 * carrying an id that file does not know is rejected. Change one, change both.
 */

import type { Copy } from "./i18n";

/**
 * A photograph on the page.
 *
 * Every slot is optional. With none, the page renders palette gradients and
 * looks deliberate rather than half-finished, so photographs can be added one
 * at a time — see public/photos/README.md.
 *
 * Alt text is required and carries all three languages, because for a company
 * selling finished gardens the photographs are the argument. "A photo of a
 * garden" helps nobody; say what is actually in the frame.
 */
export interface Photo {
  /** Path under public/, e.g. "/photos/hero.jpg". */
  src: string;
  alt: Copy;
}

export const GARDEN = {
  name: "Green Gardens",

  kicker: {
    ar: "تصميم وتنفيذ الحدائق · بغداد",
    ckb: "دیزاین و دروستکردنی باخچە · بەغدا",
    en: "Garden design & landscaping · Baghdad",
  },
  tagline: {
    ar: "نصمّم حديقتك ونبنيها ونبقيها حيّة.",
    ckb: "باخچەکەت دیزاین دەکەین، دروستی دەکەین، و بە زیندوویی دەیهێڵینەوە.",
    en: "We design your garden, build it, and keep it alive.",
  },
  intro: {
    ar: "من الرسم الأول حتى آخر شجرة: تصميم، وتنفيذ كامل، وريّ، وصيانة. نعمل في بيوت بغداد وفي مواقع الشركات، ونأتي إليك — الزيارة الأولى مجانية وبلا التزام.",
    ckb: "لە یەکەم نەخشەوە تا دوایین دار: دیزاین، جێبەجێکردنی تەواو، ئاودێری، و چاودێری. لە ماڵەکانی بەغدا و لە شوێنی کۆمپانیاکاندا کار دەکەین، و ئێمە دێینە لات — یەکەم سەردان بێبەرامبەرە و هیچ ئەرکێکت ناخاتە سەر.",
    en: "From the first drawing to the last tree: design, full construction, irrigation and upkeep. We work on homes across Baghdad and on company grounds — and we come to you. The first visit is free and commits you to nothing.",
  },
  ctaVisit: { ar: "احجز زيارة مجانية", ckb: "سەردانێکی بێبەرامبەر داوا بکە", en: "Book a free site visit" },
  ctaServices: { ar: "شاهد ما نقدّمه", ckb: "بزانە چی دەکەین", en: "See what we do" },

  /* ------------------------------------------------------------- figures */
  stats: [
    {
      value: "2026",
      label: { ar: "سنة التأسيس", ckb: "ساڵی دامەزراندن", en: "established" },
    },
    {
      value: "5",
      label: { ar: "خدمات، وفريق واحد", ckb: "خزمەتگوزاری، بە یەک تیم", en: "services, one team" },
    },
    {
      value: "3–5",
      label: { ar: "أيام عمل حتى زيارة الموقع", ckb: "ڕۆژی کاری تا سەردانی شوێن", en: "working days to a site visit" },
    },
  ],

  /* --------------------------------------------------------------- story */
  storyTitle: { ar: "من نحن", ckb: "ئێمە کێین", en: "Who we are" },
  /* The company is months old. The copy says so and leans on the people
     rather than on a history it does not have — a new firm claiming decades
     is the fastest way to lose a client who asks one follow-up question. */
  story: [
    {
      ar: "تأسّست Green Gardens عام 2026، لكن مَن فيها ليسوا جددًا على هذا العمل. أمضى مؤسّسوها سنوات في تنفيذ الحدائق في بغداد قبل أن يبدأوا الشركة، وأول ما بنَوه كان المشتل الذي يأتي منه كل نبات نزرعه.",
      ckb: "Green Gardens لە 2026دا دامەزرا، بەڵام ئەوانەی تێیدان لەم کارە نوێ نین. دامەزرێنەرانی ساڵانێک باخچەیان لە بەغدا دروست کردووە پێش ئەوەی کۆمپانیاکە دەست پێ بکات، و یەکەم شت کە دروستیان کرد ئەو نەمامگەیە بوو کە هەموو ڕووەکەکانمان لێوەی دێن.",
      en: "Green Gardens was established in 2026, but the people in it are not new to this. Our founders spent years building gardens across Baghdad before starting the company, and the first thing they built was the nursery every plant we use comes from.",
    },
    {
      ar: "نزرع ما يعيش هنا فعلًا. صيف بغداد يقتل النبات الجميل الذي لا يحتمل الحرارة، لذلك نختار من مشتلنا ما جرّبناه على أرضنا، ونصمّم الريّ قبل أن نصمّم الشكل.",
      ckb: "ئەوە دەچێنین کە بەڕاستی لێرە دەژیێت. هاوینی بەغدا ئەو ڕووەکە جوانانە دەکوژێت کە بەرگەی گەرما ناگرن، بۆیە لە نەمامگەکەی خۆمانەوە ئەوە هەڵدەبژێرین کە لەسەر زەوی خۆمان تاقیمان کردووەتەوە، و پێش دیزاینی شێوە، ئاودێری دیزاین دەکەین.",
      en: "We plant what actually lives here. A Baghdad summer kills the beautiful things that can't take the heat, so we choose from our own nursery what we've tested in our own ground — and we design the irrigation before we design the look.",
    },
  ],

  /* ------------------------------------------------------------ services */
  servicesTitle: { ar: "ما نقدّمه", ckb: "چی دەکەین", en: "What we do" },
  servicesNote: {
    ar: "خذ العمل كاملًا، أو خذ منه ما تحتاجه فقط.",
    ckb: "کارەکە بە تەواوی وەربگرە، یان تەنها ئەو بەشەی پێویستتە.",
    en: "Take the whole job, or only the part you need.",
  },
  /* ids match SERVICES in server/brand.ts. */
  services: [
    {
      id: "design",
      name: { ar: "تصميم الحدائق", ckb: "دیزاینی باخچە", en: "Garden design" },
      body: {
        ar: "قياس الموقع، ومخطط زراعة، ورسومات تراها قبل أن نحفر أي شيء. تُخصم قيمة التصميم من التنفيذ إن أكملت معنا.",
        ckb: "پێوانی شوێنەکە، نەخشەی چاندن، و ڕەسمی کە پێش هەڵکەندنی هیچ شتێک دەیبینیت. ئەگەر کارەکە لەگەڵمان تەواو بکەیت، نرخی دیزاین لە جێبەجێکردنەکە کەم دەکرێتەوە.",
        en: "A measured survey, a planting plan, and drawings you see before anything is dug. The design fee comes off the build if you go ahead with us.",
      },
    },
    {
      id: "build",
      name: { ar: "تنفيذ كامل", ckb: "جێبەجێکردنی تەواو", en: "Full construction" },
      body: {
        ar: "المشروع كله: تسوية الأرض، والبلاط، والجدران، والمياه، والزراعة، والإنارة — بفريق واحد ومسؤول واحد.",
        ckb: "هەموو پڕۆژەکە: ڕێکخستنی ئاست، بەرد، دیوار، ئاو، چاندن و ڕووناکی — بە یەک تیم و یەک بەرپرس.",
        en: "The whole project: levels, paving, walls, water, planting and lighting — one team and one person answerable for it.",
      },
    },
    {
      id: "planting",
      name: { ar: "الزراعة والنجيل", ckb: "چاندن و سەوزەڵە", en: "Planting and lawns" },
      body: {
        ar: "أشجار وأحواض ونجيل وغطاء أرضي، مختارة لمناخ بغداد، مع تجهيز التربة ورعاية الموسم الأول.",
        ckb: "دار، باخچەبەند، سەوزەڵە و ڕووپۆشی زەوی، هەڵبژێردراو بۆ کەشوهەوای بەغدا، لەگەڵ ئامادەکردنی خاک و چاودێریی وەرزی یەکەم.",
        en: "Trees, beds, turf and ground cover chosen for the Baghdad climate, with the soil prepared and the first season looked after.",
      },
    },
    {
      id: "irrigation",
      name: { ar: "الريّ والإنارة", ckb: "ئاودێری و ڕووناکی", en: "Irrigation and lighting" },
      body: {
        ar: "نظام ريّ أوتوماتيكي مقسّم ومبرمج، وإنارة حديقة — تركيبًا جديدًا أو إصلاحًا لما هو قائم.",
        ckb: "سیستەمی ئاودێریی ئۆتۆماتیکی بەش‌بەش و کاتبەند، و ڕووناکیی باخچە — دانانی نوێ یان چاککردنەوەی ئەوەی هەیە.",
        en: "An automatic irrigation system, zoned and timed, and garden lighting — installed new or repaired where it already exists.",
      },
    },
    {
      id: "maintenance",
      name: { ar: "الصيانة", ckb: "چاودێری", en: "Maintenance" },
      body: {
        ar: "زيارات منتظمة: تقليم، وقص، وتسميد، وتبديل موسمي. شهريًا أو كل أسبوعين، بعقد أو بالزيارة.",
        ckb: "سەردانی بەردەوام: پاککردنەوە، بڕین، پەین، و گۆڕینی وەرزی. مانگانە یان هەر دوو هەفتە جارێک، بە گرێبەست یان بە سەردان.",
        en: "Regular visits: pruning, mowing, feeding and seasonal replanting. Monthly or fortnightly, on a contract or visit by visit.",
      },
    },
  ],

  /* ------------------------------------------------------------ the work */
  howTitle: { ar: "كيف نعمل", ckb: "چۆن کار دەکەین", en: "How it works" },
  howNote: {
    ar: "أربع خطوات، ولا مفاجآت في السعر.",
    ckb: "چوار هەنگاو، و هیچ سەرسوڕمانێک لە نرخدا نییە.",
    en: "Four steps, and no surprises in the price.",
  },
  steps: [
    {
      n: "1",
      name: { ar: "زيارة الموقع", ckb: "سەردانی شوێن", en: "The site visit" },
      body: {
        ar: "نأتي إليك، نقيس، ونرى التربة والشمس والوصول. مجانًا وبلا التزام.",
        ckb: "دێینە لات، دەیپێوین، و خاک و خۆر و ڕێگای گەیشتن دەبینین. بێبەرامبەر و بێ هیچ ئەرکێک.",
        en: "We come to you, measure, and look at the soil, the sun and the access. Free, and it commits you to nothing.",
      },
    },
    {
      n: "2",
      name: { ar: "التصميم والسعر", ckb: "دیزاین و نرخ", en: "Design and price" },
      body: {
        ar: "مخطط وقائمة نباتات وعرض سعر مكتوب خلال أسبوع من الزيارة.",
        ckb: "نەخشە، لیستی ڕووەک، و نرخێکی نووسراو لە ماوەی هەفتەیەکدا دوای سەردانەکە.",
        en: "A plan, a planting list and a written quotation, within a week of the visit.",
      },
    },
    {
      n: "3",
      name: { ar: "التنفيذ", ckb: "جێبەجێکردن", en: "The build" },
      body: {
        ar: "يبدأ العمل عادةً بعد أسبوعين إلى أربعة من توقيع العرض، بجدول تعرفه مسبقًا.",
        ckb: "کارەکە زۆرجار دوو تا چوار هەفتە دوای واژووکردنی نرخەکە دەست پێدەکات، بە خشتەیەک کە پێشتر دەیزانیت.",
        en: "Work usually starts two to four weeks after the quotation is signed, to a schedule you have in advance.",
      },
    },
    {
      n: "4",
      name: { ar: "ما بعد التسليم", ckb: "دوای تەواوبوون", en: "After we leave" },
      body: {
        ar: "نشرح لك الريّ، ونرجع في الموسم الأول. وإن أردت، نبقى على الصيانة.",
        ckb: "ئاودێرییەکەت بۆ ڕوون دەکەینەوە، و لە وەرزی یەکەمدا دەگەڕێینەوە. ئەگەر بتەوێت، لەسەر چاودێری دەمێنینەوە.",
        en: "We show you how the irrigation works and come back through the first season. If you want us to, we stay on for the upkeep.",
      },
    },
  ],

  /* --------------------------------------------------------------- rates */
  ratesTitle: { ar: "الأسعار التقريبية", ckb: "نرخە نزیکەییەکان", en: "Indicative rates" },
  ratesNote: {
    ar: "كل رقم هنا نقطة بداية وليس عرض سعر. الأرض والوصول والمستويات تحرّك السعر أكثر من المساحة نفسها — لذلك السعر الحقيقي يأتي بعد الزيارة.",
    ckb: "هەموو ژمارەیەکی ئێرە خاڵی دەستپێکە نەک نرخی کۆتایی. زەوی و ڕێگای گەیشتن و ئاستەکان زیاتر لە ڕووبەرەکە نرخ دەگۆڕن — بۆیە نرخی ڕاستەقینە دوای سەردانەکە دێت.",
    en: "Every figure here is a starting point, not a quotation. Ground, access and levels move a price more than the area does — which is why the real number comes after the visit.",
  },
  rates: [
    {
      name: { ar: "تصميم حديقة", ckb: "دیزاینی باخچە", en: "Garden design" },
      detail: { ar: "قياس ومخطط وقائمة نباتات", ckb: "پێوان، نەخشە و لیستی ڕووەک", en: "survey, plan and planting list" },
      price: { ar: "من 250,000", ckb: "لە 250,000ـەوە", en: "from 250,000" },
    },
    {
      name: { ar: "تنفيذ كامل", ckb: "جێبەجێکردنی تەواو", en: "Full construction" },
      detail: { ar: "للمتر المربع، حسب البلاط والجدران والمياه", ckb: "بۆ مەتری چوارگۆشە، بەپێی بەرد و دیوار و ئاو", en: "per m², depending on paving, walls and water" },
      price: { ar: "من 90,000", ckb: "لە 90,000ـەوە", en: "from 90,000" },
    },
    {
      name: { ar: "زراعة ونجيل", ckb: "چاندن و سەوزەڵە", en: "Planting and lawns" },
      detail: { ar: "للمتر المربع، مع تجهيز التربة", ckb: "بۆ مەتری چوارگۆشە، لەگەڵ ئامادەکردنی خاک", en: "per m², soil preparation included" },
      price: { ar: "من 25,000", ckb: "لە 25,000ـەوە", en: "from 25,000" },
    },
    {
      name: { ar: "ريّ أوتوماتيكي", ckb: "ئاودێریی ئۆتۆماتیکی", en: "Automatic irrigation" },
      detail: { ar: "للمتر المربع، مقسّم ومبرمج", ckb: "بۆ مەتری چوارگۆشە، بەش‌بەش و کاتبەند", en: "per m², zoned and timed" },
      price: { ar: "من 18,000", ckb: "لە 18,000ـەوە", en: "from 18,000" },
    },
    {
      name: { ar: "صيانة", ckb: "چاودێری", en: "Maintenance" },
      detail: { ar: "للزيارة، ويقلّ بالعقد", ckb: "بۆ هەر سەردانێک، بە گرێبەست کەمتر دەبێت", en: "per visit, less on a contract" },
      price: { ar: "من 150,000", ckb: "لە 150,000ـەوە", en: "from 150,000" },
    },
  ],
  currencyNote: {
    ar: "جميع الأسعار بالدينار العراقي.",
    ckb: "هەموو نرخەکان بە دیناری عێراقین.",
    en: "All prices in Iraqi dinar.",
  },

  /* ------------------------------------------------------------- gallery */
  galleryTitle: { ar: "من أعمالنا", ckb: "لە کارەکانمان", en: "Our work" },
  galleryNote: {
    ar: "حدائق بيوت ومواقع شركات في بغداد وما حولها.",
    ckb: "باخچەی ماڵان و شوێنی کۆمپانیاکان لە بەغدا و دەوروبەری.",
    en: "House gardens and company grounds in and around Baghdad.",
  },

  /* ----------------------------------------------------------- standards

     This replaces a testimonials section. The company was founded this year,
     so quotes from clients would have to be invented — and an invented quote
     is the one thing on a site that can cost real trust when a reader checks.
     What a new firm CAN prove is how it runs a job, so that is what stands
     here: the promises, stated plainly enough to be held to. */
  standardsTitle: {
    ar: "ما يمكنك الاعتماد عليه",
    ckb: "ئەوەی دەتوانیت پشتی پێببەستیت",
    en: "What you can count on",
  },
  standardsNote: {
    ar: "نحن شركة جديدة، فبدل أن ننقل لك كلام أشخاص لا تعرفهم، إليك بالضبط كيف نعمل.",
    ckb: "ئێمە کۆمپانیایەکی نوێین، بۆیە لەبری گێڕانەوەی قسەی کەسانێک کە نایانناسیت، ئەوەتا بە تەواوی چۆن کار دەکەین.",
    en: "We're new, so instead of quoting clients you've never met, here is exactly how we work.",
  },
  standards: [
    {
      id: "price",
      name: { ar: "سعر لا يتغيّر", ckb: "نرخێک کە ناگۆڕێت", en: "A price that doesn't move" },
      body: {
        ar: "عرض السعر يُثبَّت قبل بدء العمل. وإن لزم تغيير شيء، يُتَّفق عليه ويُسعَّر كتابيًا قبل أن يلمسه أحد.",
        ckb: "نرخەکە پێش دەستپێکردنی کار جێگیر دەکرێت. ئەگەر پێویست بوو شتێک بگۆڕدرێت، پێش ئەوەی کەس دەستی لێ بدات بە نووسراوی ڕێککەوتنی لەسەر دەکرێت و نرخ دەکرێت.",
        en: "The quotation is fixed before work starts. If something has to change, it is agreed and priced in writing before anyone touches it.",
      },
    },
    {
      id: "owner",
      name: { ar: "شخص واحد مسؤول", ckb: "یەک کەس بەرپرسە", en: "One person answerable" },
      body: {
        ar: "مشرف باسمه على موقعك ورقم واحد تتصل به. لن تلاحق مقاولًا نحن من أحضره.",
        ckb: "سەرپەرشتیارێکی دیاریکراو لەسەر کارەکەت و یەک ژمارە کە پەیوەندی پێوە دەکەیت. هەرگیز دوای ئەو کەسە ناکەویت کە ئێمە هێناومانە.",
        en: "A named supervisor on your job and one number to call. You never chase a subcontractor we brought in.",
      },
    },
    {
      id: "dates",
      name: { ar: "مواعيد قبل أن نبدأ", ckb: "بەروار پێش دەستپێکردن", en: "Dates before we start" },
      body: {
        ar: "تاريخ بدء وتاريخ انتهاء مكتوبان — وإن أخّرهما الطقس أو تأخّرت مواد، تسمع ذلك منّا في اليوم نفسه لا بعد أسبوع.",
        ckb: "بەرواری دەستپێک و کۆتایی بە نووسراوی — و ئەگەر کەشوهەوا یان دواکەوتنی کەلوپەل گۆڕی، هەمان ڕۆژ لە ئێمەوە دەیبیستیت نەک دوای هەفتەیەک.",
        en: "A start date and a finish date in writing — and if weather or a delivery moves them, you hear it from us that day, not a week later.",
      },
    },
    {
      id: "capacity",
      name: {
        ar: "عدد محدود من المشاريع معًا",
        ckb: "ژمارەیەکی سنووردار لە پڕۆژە پێکەوە",
        en: "A limited number of builds at once",
      },
      body: {
        ar: "لا نبدأ إلا ما تستطيع فرقنا إنهاءه. لن تبقى حديقتك نصف محفورة بينما نعمل في موقع آخر.",
        ckb: "تەنها ئەوە دەست پێدەکەین کە تیمەکانی خۆمان دەتوانن تەواوی بکەن. باخچەکەت بە نیوە هەڵکەندراوی نامێنێتەوە لە کاتێکدا لە شوێنێکی تردا کار دەکەین.",
        en: "We only start what our own crews can finish. Your garden doesn't sit half-dug while we work somewhere else.",
      },
    },
    {
      id: "clean",
      name: { ar: "موقع نظيف كل مساء", ckb: "شوێنێکی پاک هەموو ئێوارەیەک", en: "A clean site every evening" },
      body: {
        ar: "الأدوات تُرفع، والأنقاض تُزال أولًا بأول، ويبقى المدخل والباب صالحين للاستخدام طوال فترة العمل.",
        ckb: "ئامرازەکان کۆدەکرێنەوە، خاشاک بەردەوام لادەبرێت، و ڕێگا و دەرگا بە درێژایی کارەکە بەکارهێنراو دەمێننەوە.",
        en: "Tools away, rubble cleared as we go, and the drive and the door kept usable the whole time we're there.",
      },
    },
    {
      id: "aftercare",
      name: { ar: "نعود بعد التسليم", ckb: "دوای تەواوکردن دەگەڕێینەوە", en: "We come back after we finish" },
      body: {
        ar: "شرح عملي لنظام الريّ، وزيارات متابعة خلال الموسم الأول حتى تثبت الزراعة وتستقرّ.",
        ckb: "ڕوونکردنەوەی کردەیی بۆ سیستەمی ئاودێری، و سەردانی بەدواداچوون بە درێژایی وەرزی یەکەم تا چاندنەکە جێگیر دەبێت.",
        en: "A walkthrough of the irrigation, and return visits through the first season while the planting takes.",
      },
    },
  ],

  /* --------------------------------------------------------------- reach */
  reachTitle: { ar: "أين نعمل", ckb: "لە کوێ کار دەکەین", en: "Where we work" },
  coverageTitle: { ar: "مناطق العمل", ckb: "ناوچەکانی کارکردن", en: "Areas we cover" },
  coverage: {
    ar: "بغداد والمناطق المحيطة بها.\nخارجها داخل العراق بالاتفاق.",
    ckb: "بەغدا و ناوچەکانی دەوروبەری.\nدەرەوەی ئەوە لە ناو عێراق بە ڕێککەوتن.",
    en: "Baghdad and the surrounding districts.\nElsewhere in Iraq by arrangement.",
  },
  hoursTitle: { ar: "أوقات المكتب", ckb: "کاتی نووسینگە", en: "Office hours" },
  hours: [
    {
      day: { ar: "السبت – الخميس", ckb: "شەممە – پێنجشەممە", en: "Saturday – Thursday" },
      time: { ar: "8:00 ص – 5:00 م", ckb: "08:00 – 17:00", en: "08:00 – 17:00" },
    },
    { day: { ar: "الجمعة", ckb: "هەینی", en: "Friday" }, time: { ar: "مغلق", ckb: "داخراو", en: "Closed" } },
  ],
  officeTitle: { ar: "مقرّنا", ckb: "بنکەمان", en: "Based in" },
  /* The city and nothing finer, matching COMPANY.address in server/brand.ts.
     There is no shop to walk into, so a street would only invite a visit that
     cannot happen. */
  office: {
    ar: "بغداد، العراق",
    ckb: "بەغدا، عێراق",
    en: "Baghdad, Iraq",
  },
  officeNote: {
    ar: "لا يوجد معرض تزوره — نحن من يأتي إليك.",
    ckb: "پێشانگایەک نییە سەردانی بکەیت — ئێمەین کە دێینە لات.",
    en: "There's no showroom to visit — we come to you.",
  },

  /* Photographs. Every slot optional; empty ones render palette gradients.
     See public/photos/README.md. */
  heroPhoto: undefined as Photo | undefined,
  storyPhoto: undefined as Photo | undefined,
  gallery: [] as Photo[],
};

/* ============================================================== the site === */

/**
 * How to reach the company. These are the real details.
 *
 * The number is digits only, country code included, because that is the form
 * wa.me takes. WhatsApp is first everywhere it appears: it is the channel a
 * client in Iraq will actually use.
 */
export const CONTACT = {
  phoneDisplay: "+964 782 782 9003",
  whatsappDigits: "9647827829003",
  email: "greengarden632@gmail.com",
};

/** Builds a wa.me link, optionally pre-filling the first message. */
export const whatsapp = (message = ""): string =>
  message
    ? `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${CONTACT.whatsappDigits}`;

export const NAV = {
  services: { ar: "الخدمات", ckb: "خزمەتگوزاری", en: "Services" },
  how: { ar: "كيف نعمل", ckb: "چۆن کار دەکەین", en: "How it works" },
  rates: { ar: "الأسعار", ckb: "نرخەکان", en: "Rates" },
  work: { ar: "أعمالنا", ckb: "کارەکانمان", en: "Our work" },
  visit: { ar: "احجز زيارة", ckb: "سەردان داوا بکە", en: "Book a visit" },
  openMenu: { ar: "افتح القائمة", ckb: "لیستە بکەرەوە", en: "Open menu" },
  closeMenu: { ar: "أغلق القائمة", ckb: "لیستە دابخە", en: "Close menu" },
  langAria: { ar: "تغيير اللغة", ckb: "گۆڕینی زمان", en: "Change language" },
  skip: { ar: "تخطَّ إلى المحتوى", ckb: "بازبدە بۆ ناوەڕۆک", en: "Skip to content" },
  home: { ar: "الصفحة الرئيسية", ckb: "پەڕەی سەرەکی", en: "Home" },
};

export const FOOTER = {
  blurb: {
    ar: "شركة تصميم وتنفيذ حدائق في بغداد، تأسّست عام 2026. نصمّم وننفّذ ونصون حدائق البيوت ومواقع الشركات — ونأتي إليك.",
    ckb: "کۆمپانیایەکی دیزاین و دروستکردنی باخچەیە لە بەغدا، لە 2026دا دامەزراوە. باخچەی ماڵان و شوێنی کۆمپانیاکان دیزاین و دروست و چاودێری دەکەین — و ئێمە دێینە لات.",
    en: "A garden design and landscaping company in Baghdad, established 2026. We design, build and maintain house gardens and company grounds — and we come to you.",
  },
  contactTitle: { ar: "تواصل معنا", ckb: "پەیوەندیمان پێوە بکە", en: "Get in touch" },
  whatsapp: { ar: "راسلنا على واتساب", ckb: "لە واتساپ نامەمان بۆ بنێرە", en: "Message us on WhatsApp" },
  rights: { ar: "جميع الحقوق محفوظة.", ckb: "هەموو مافەکان پارێزراون.", en: "All rights reserved." },
  established: { ar: "تأسّست 2026", ckb: "دامەزراوە 2026", en: "Established 2026" },
  /* Who built the site, and a way through to them. The URL is rendered as a
     link rather than pasted as text — a bare address in a footer is something
     people read, not something they click. */
  builtBy: {
    ar: "من تطوير CoreOs و CoreOs.ai. إن كان لديك مشروع، تفضّل إلى",
    ckb: "دروستکراوە لەلایەن CoreOs و CoreOs.ai. ئەگەر پڕۆژەیەکت هەیە، سەردانی ئێرە بکە",
    en: "Powered by CoreOs and CoreOs.ai. If you need a project built, go to",
  },
};

/** Where the credit line points. */
export const COREOS_URL = "https://coreosai.netlify.app";

/* ====================================================== site visit form === */

/** Site-type ids match PROJECTS in server/brand.ts. */
export const PROJECTS: Record<"individual" | "business", Array<{ id: string; name: Copy }>> = {
  individual: [
    { id: "villa-garden", name: { ar: "حديقة فيلا أو بيت", ckb: "باخچەی ڤێلا یان ماڵ", en: "Villa or house garden" } },
    { id: "roof-terrace", name: { ar: "سطح أو شرفة", ckb: "سەربان یان بەرەبان", en: "Roof terrace or balcony" } },
    { id: "small-yard", name: { ar: "ساحة صغيرة أو فناء", ckb: "حەوشەی بچووک", en: "Small yard or courtyard" } },
    { id: "repair", name: { ar: "إصلاح حديقة قائمة", ckb: "چاککردنەوەی باخچەیەکی هەبوو", en: "Repair an existing garden" } },
  ],
  business: [
    { id: "commercial-grounds", name: { ar: "مقر شركة أو مبنى تجاري", ckb: "بارەگای کۆمپانیا یان بینای بازرگانی", en: "Office or commercial grounds" } },
    { id: "hospitality", name: { ar: "فندق أو مطعم أو مقهى", ckb: "هوتێل، چێشتخانە یان کافێ", en: "Hotel, restaurant or café" } },
    { id: "development", name: { ar: "مجمع سكني أو مشروع", ckb: "کۆمەڵگەی نیشتەجێبوون یان پڕۆژە", en: "Housing development or compound" } },
    { id: "public", name: { ar: "مشروع عام أو بلدي", ckb: "پڕۆژەی گشتی یان شارەوانی", en: "Public or municipal landscape" } },
    { id: "maintenance-contract", name: { ar: "عقد صيانة", ckb: "گرێبەستی چاودێری", en: "Maintenance contract" } },
  ],
};

export const FORM = {
  eyebrow: { ar: "زيارة الموقع", ckb: "سەردانی شوێن", en: "Site visit" },
  title: { ar: "احجز زيارة مجانية", ckb: "سەردانێکی بێبەرامبەر داوا بکە", en: "Book a free site visit" },
  lede: {
    ar: "نأتي إليك، ونقيس، ونرى الأرض بأنفسنا — ثم نرسل لك التصميم والسعر. الزيارة مجانية ولا تلزمك بشيء.",
    ckb: "دێینە لات، دەیپێوین، و بە چاوی خۆمان زەوییەکە دەبینین — پاشان دیزاین و نرخەکەت بۆ دەنێرین. سەردانەکە بێبەرامبەرە و هیچ ئەرکێکت ناخاتە سەر.",
    en: "We come to you, measure, and see the ground for ourselves — then send you the design and the price. The visit is free and commits you to nothing.",
  },

  /* The two halves of the flow. A homeowner and a company are asked for
     different things, so this is a real fork rather than a checkbox. */
  individual: { ar: "شخص", ckb: "کەسێک", en: "Individual" },
  business: { ar: "شركة", ckb: "کۆمپانیا", en: "Business" },
  individualHint: {
    ar: "حديقة بيت، سطح، فناء، أو إصلاح ما هو قائم.",
    ckb: "باخچەی ماڵ، سەربان، حەوشە، یان چاککردنەوەی ئەوەی هەیە.",
    en: "A house garden, a roof, a yard, or fixing what's already there.",
  },
  businessHint: {
    ar: "فاتورة باسم الشركة، مع إمكانية أمر الشراء والعقود.",
    ckb: "پسوولە بە ناوی کۆمپانیا، لەگەڵ ئەگەری ئۆردەری کڕین و گرێبەست.",
    en: "Invoiced to the company, with purchase orders and contracts.",
  },

  name: { ar: "الاسم الكامل", ckb: "ناوی تەواو", en: "Full name" },
  email: { ar: "البريد الإلكتروني", ckb: "ئیمەیڵ", en: "Email" },
  phone: { ar: "رقم الهاتف", ckb: "ژمارەی تەلەفۆن", en: "Phone" },
  siteAddress: { ar: "عنوان الموقع", ckb: "ناونیشانی شوێن", en: "Site address" },
  siteAddressHint: {
    ar: "أين الحديقة؟ الحي والشارع وأقرب علامة تكفي.",
    ckb: "باخچەکە لە کوێیە؟ گەڕەک و شەقام و نزیکترین نیشانە بەسە.",
    en: "Where is the garden? The district, street and a nearby landmark is enough.",
  },
  areaM2: { ar: "المساحة التقريبية (م²)", ckb: "ڕووبەری نزیکەیی (م²)", en: "Approximate area (m²)" },
  areaHint: {
    ar: "تقدير يكفي — نقيسها في الزيارة.",
    ckb: "خەمڵاندنێک بەسە — لە سەردانەکەدا دەیپێوین.",
    en: "An estimate is fine — we measure it on the visit.",
  },
  service: { ar: "الخدمة المطلوبة", ckb: "خزمەتگوزاریی پێویست", en: "What you need" },
  project: { ar: "نوع الموقع", ckb: "جۆری شوێن", en: "Kind of site" },
  date: { ar: "اليوم المفضّل", ckb: "ڕۆژی پەسەند", en: "Preferred day" },
  dateHint: {
    ar: "نتفق على الساعة معك عند الاتصال.",
    ckb: "کاتژمێرەکە لە کاتی پەیوەندیکردندا لەگەڵت ڕێک دەخەین.",
    en: "We agree the hour with you when we call.",
  },
  notes: { ar: "ملاحظات", ckb: "تێبینی", en: "Notes" },
  notesHint: {
    ar: "ما تريده، ما لا تريده، ميزانية تقريبية، أي شيء يفيدنا.",
    ckb: "چیت دەوێت، چیت ناوێت، بودجەی نزیکەیی، هەر شتێک سوودی هەبێت.",
    en: "What you want, what you don't, a rough budget — anything that helps.",
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
    ar: "سنتواصل معك لتحديد موعد الزيارة، عادةً خلال يوم عمل.",
    ckb: "پەیوەندیت پێوە دەکەین بۆ دیاریکردنی کاتی سەردانەکە، زۆرجار لە ماوەی ڕۆژێکی کاریدا.",
    en: "We'll be in touch to fix a time for the visit, usually within a working day.",
  },
  successMail: {
    ar: "أرسلنا نسخة إلى بريدك أيضًا.",
    ckb: "وێنەیەکیشمان بۆ ئیمەیڵەکەت ناردووە.",
    en: "A copy is on its way to your inbox too.",
  },
  another: { ar: "أرسل طلبًا آخر", ckb: "داواکارییەکی تر بنێرە", en: "Send another request" },

  /* Failures the browser can hit before the server ever answers. */
  errOffline: {
    ar: "تعذّر إرسال الطلب. تحقّق من الاتصال وحاول مرة أخرى.",
    ckb: "نەتوانرا داواکارییەکە بنێردرێت. لە پەیوەندییەکە دڵنیا بەرەوە و دووبارە هەوڵ بدە.",
    en: "The request couldn't be sent. Check your connection and try again.",
  },
  errNoBackend: {
    ar: "نموذج الطلب غير موصول على هذه النسخة من الموقع.",
    ckb: "فۆرمی داواکاری لەسەر ئەم وەشانەی ماڵپەڕەکە پەیوەست نەکراوە.",
    en: "The request form isn't connected on this deployment of the site.",
  },
};

/* ============================================================== Green AI === */

export const CHAT = {
  name: { ar: "Green AI", ckb: "Green AI", en: "Green AI" },
  role: { ar: "مساعِد الحدائق", ckb: "یاریدەدەری باخچە", en: "Garden assistant" },
  open: { ar: "اسأل Green AI", ckb: "لە Green AI بپرسە", en: "Ask Green AI" },
  close: { ar: "إغلاق", ckb: "داخستن", en: "Close" },
  clear: { ar: "محادثة جديدة", ckb: "گفتوگۆی نوێ", en: "New conversation" },
  send: { ar: "إرسال", ckb: "ناردن", en: "Send" },
  placeholder: {
    ar: "اسأل عن الخدمات أو الأسعار أو النباتات…",
    ckb: "لەسەر خزمەتگوزاری، نرخ یان ڕووەک بپرسە…",
    en: "Ask about services, rates or plants…",
  },
  greeting: {
    ar: "أهلًا. أستطيع أن أشرح ما نقدّمه، والأسعار التقريبية، وما ينجح في مناخ بغداد. لحجز زيارة مجانية، النموذج في الأسفل يصل مباشرة إلى المكتب.",
    ckb: "سڵاو. دەتوانم ڕوون بکەمەوە چی دەکەین، نرخە نزیکەییەکان، و چی لە کەشوهەوای بەغدادا سەرکەوتوو دەبێت. بۆ سەردانێکی بێبەرامبەر، فۆرمەکەی خوارەوە ڕاستەوخۆ دەگاتە نووسینگە.",
    en: "Hello. I can explain what we do, what things roughly cost, and what survives a Baghdad summer. To book a free visit, the form below goes straight to the office.",
  },
  /* Openers, so a visitor who does not know what to ask still gets a useful
     first answer rather than an empty box. */
  prompts: [
    { ar: "كم تكلفة حديقة 200 متر؟", ckb: "باخچەیەکی 200 مەتری چەندی تێدەچێت؟", en: "What would a 200 m² garden cost?" },
    { ar: "ما النباتات التي تتحمّل صيف بغداد؟", ckb: "چ ڕووەکێک بەرگەی هاوینی بەغدا دەگرێت؟", en: "What survives a Baghdad summer?" },
    { ar: "هل تعملون خارج بغداد؟", ckb: "لە دەرەوەی بەغدا کار دەکەن؟", en: "Do you work outside Baghdad?" },
  ],
  note: {
    ar: "مساعِد ذكي. الأسعار تقريبية — السعر النهائي بعد زيارة الموقع.",
    ckb: "یاریدەدەرێکی زیرەکە. نرخەکان نزیکەیین — نرخی کۆتایی دوای سەردانی شوێنە.",
    en: "An AI assistant. Rates are indicative — the real price follows the site visit.",
  },
  /** Attribution, shown under the assistant. CoreOs built and runs it. */
  poweredBy: { ar: "مدعوم من CoreOs", ckb: "پشتیوانیکراو لەلایەن CoreOs", en: "Powered by CoreOs" },
  errGeneric: {
    ar: "تعذّر الوصول إلى المساعِد. النموذج في الأسفل يعمل كالمعتاد.",
    ckb: "نەتوانرا بگەین بە یاریدەدەر. فۆرمەکەی خوارەوە وەک خۆی کار دەکات.",
    en: "The assistant couldn't be reached. The form below still works.",
  },
  errNoBackend: {
    ar: "المساعِد غير موصول على هذه النسخة من الموقع.",
    ckb: "یاریدەدەر لەسەر ئەم وەشانەی ماڵپەڕەکە پەیوەست نەکراوە.",
    en: "The assistant isn't connected on this deployment of the site.",
  },
};
