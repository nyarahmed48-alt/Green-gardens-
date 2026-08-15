# Green Gardens

The website for Green Gardens — a private garden estate and restaurant in
Erbil. One page in **Arabic, Sorani Kurdish and English**, with two working
systems behind it:

- **A reservation desk** that takes bookings from private guests and from
  companies, and emails them to the venue.
- **Green AI**, a concierge that answers questions about the spaces, the
  packages and the hours.

```bash
npm install
npm run dev        # http://localhost:3000
```

The site runs with no configuration at all. Both systems below report
themselves as switched off rather than failing, so you can see the whole page
before setting up either one.

---

## Configuration

Copy `.env.example` to `.env` and fill in what you need. Every variable is
documented in that file; this is the short version.

### The concierge

```dotenv
OPENROUTER_API_KEY=sk-or-v1-…
OPENROUTER_MODEL=vendor/model-name:free
```

- **Key** — https://openrouter.ai/keys
- **Model** — https://openrouter.ai/models. Anything ending `:free` costs
  nothing to call.

Swapping either is one line and a restart. No code change, no redeploy of the
site itself. `OPENROUTER_MODEL` also accepts several ids separated by commas
and tries them in order, which keeps the concierge answering when a free model
hits its daily cap.

There is deliberately **no default model**. Ids on aggregators get renamed and
retired, and a stale hardcoded one fails as "model not found" — an error that
points nowhere near the cause.

### Reservations

One address is mandatory — where bookings go:

```dotenv
MAIL_TO=reservations@greengardens.iq
MAIL_FROM=Green Gardens <reservations@greengardens.iq>
```

Then pick **one** way to send.

**Option A — your own mail server:**

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=reservations@greengardens.iq
SMTP_PASS=your-app-password
```

Gmail and Outlook need an **app password**, not the account password.
`SMTP_SECURE` can normally be left blank — port 465 defaults to implicit TLS
and everything else to STARTTLS.

> **SMTP cannot run on Cloudflare Workers.** Workers have no TCP sockets. Use
> option B there; the endpoint will tell you so plainly if you configure SMTP
> anyway.

**Option B — an HTTP mail API**, which works everywhere including Cloudflare:

```dotenv
RESEND_API_KEY=re_…
```

Get one at https://resend.com/api-keys and verify your sending domain first, or
the provider will refuse your `From` address. Brevo works the same way with
`BREVO_API_KEY`.

### Checking what is live

```bash
curl http://localhost:3000/api/health
```

```jsonc
{
  "concierge":    { "configured": true, "modelsConfigured": 2 },
  "reservations": { "ready": false, "transport": "none", "recipients": 0,
                    "reason": "MAIL_TO is not set — there is no address to send reservations to." }
}
```

States only — never the key, never the model ids, never a provider's own error
text.

---

## How a booking works

A guest picks **Individual** or **Business**. These are genuinely different
bookings rather than one form with a checkbox: a company needs an invoice
address, a registration number and often a purchase order, and none of that
belongs in front of someone booking a birthday dinner.

On submit, two messages go out:

1. **The desk copy**, to `MAIL_TO`. English, every field, laid out the same way
   every time — it is a work item, and staff should not have to adapt to
   whichever language the guest used. `Reply-To` is the guest, so hitting reply
   answers them.
2. **The guest copy**, in whichever language they filled the form in, when they
   gave an address. `Reply-To` is the desk.

If the desk copy cannot be sent, **the booking fails and says so**. A form that
thanks someone for a reservation nobody received is worse than one that admits
it is not connected. If only the guest's copy fails, the booking still
succeeded — the venue has it — so that is logged and nothing more.

Green AI **cannot confirm a booking** and is instructed to say so and point at
the form. It answers from the venue's facts in `server/brand.ts`,
which the reservation emails read too, so a price cannot be right in one place
and wrong in the other.

---

## Deploying

The server honours `$PORT`, so it runs on any Node host with no extra config.

| Host | Notes |
| --- | --- |
| **Cloudflare Workers** | `npm run deploy`. Use `RESEND_API_KEY` — SMTP cannot run here. |
| **Vercel** | `vercel.json` is in the repo; functions in `api/`. SMTP works. |
| **Netlify** | `netlify.toml` and `public/_redirects` are in the repo. SMTP works. |
| **Render / Cloud Run** | Runs `npm run build && npm start`. SMTP works. |

Set the same environment variables in whichever platform's dashboard you use.

> **A static-only deploy** — dragging `dist/` onto a host — gives you the whole
> page but no endpoints, because there is no function to answer them. The chat
> and the form both detect this and say the feature is not connected on this
> deployment rather than failing on a parse error a visitor cannot interpret.

---

## Layout

```
index.html            the page shell, title, link preview, favicon
server.ts             Express: serves the site and both endpoints

server/               shared by every deployment target
  brand.ts            the venue's facts — spaces, packages, hours, lead times
  chat.ts             the concierge: prompt, guardrails, health
  reservations.ts     validation, reference codes, both emails
  settings.ts         every environment variable is read here
  openrouter.ts       the provider client — fetch only, no SDK
  mail.ts             transports that work anywhere (Resend, Brevo)
  mail-node.ts        the same, plus SMTP — imported only by Node entries
  smtp.ts             a small SMTP client (node:net/node:tls, no library)

src/
  App.tsx             the page — composition only
  ReservationForm.tsx the individual / business flow
  ConciergeChat.tsx   the floating concierge panel
  content.ts          every visible string, in all three languages
  i18n.tsx            the language provider
  theme.ts            the palette
  components/         header, footer, and the three shared primitives

worker/               Cloudflare Worker entry
api/                  Vercel functions
netlify/functions/    Netlify functions
```

`mail.ts` and `mail-node.ts` are two files for one reason: the Worker bundles
the first and never sees `node:net`, which would fail to build there. Node
entry points import the second. Everything else is shared verbatim.

### The endpoints

| | |
| --- | --- |
| `POST /api/chat` | `{ message, history, lang }` → `{ text, fallback }` |
| `POST /api/reservations` | the form → `{ ok, reference, confirmationSent }` |
| `GET /api/health` | what is configured |

Both POST endpoints are public, so both are throttled per IP on the Express
server — 40 chat messages and 8 reservations an hour. Serverless invocations
share no memory, so there the platform's own rate limiting is the place for it.
The form also carries a honeypot field: a submission that fills it gets a
plausible-looking success and is quietly dropped.

---

## Languages

The site opens in **Arabic**, with Kurdish and English one press away in the
header. The choice is remembered, so the switch only has to be used once.

- `src/content.ts` — every string, all three languages, one entry each, so a
  reviewer can read three lines and see whether they say the same thing. `ckb`
  is required rather than optional: a missing Kurdish string is a type error,
  not a silent fall back to English.
- Layout is **direction-agnostic**. It uses logical CSS properties (`ps-`,
  `me-`, `start-`) rather than physical ones, so right-to-left is a `dir` flip
  and not a second stylesheet.
- The name "Green Gardens" stays in Latin script in all three. It is the
  venue's name, not a phrase to translate.

## Changing the content

- **Prices, spaces, hours, anything the concierge may quote** —
  `server/brand.ts`.
- **Anything visible on the page** — `src/content.ts`.
- **Photographs** — drop files into `public/photos/` and name them in
  `src/content.ts`; see `public/photos/README.md`. Empty slots render palette
  gradients, so pictures can be added one at a time.

The space and occasion **ids** in `src/content.ts` are validated against
`server/brand.ts`. If you rename one, rename it in both — a booking carrying an
id the server does not know is rejected.
