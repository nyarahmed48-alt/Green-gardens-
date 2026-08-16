/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The site-visit request form.
 *
 * What is being booked is a visit to the client's own property, so the two
 * fields that carry the most weight are the site address and the rough area.
 * Everything else can be corrected on the phone; without an address there is
 * nowhere to send anyone.
 *
 * Two audiences, one form. Switching to "Business" adds the five fields a
 * company job actually needs — company name, role, registration number,
 * invoice address, purchase order — and nothing else changes, so a client who
 * picks the wrong tab does not lose what they have typed.
 *
 * Validation is the server's job (server/reservations.ts) and this file
 * renders what comes back per field. Doing it in both places would mean two
 * sets of rules that drift, and the server's set is the one that has to be
 * right — the endpoint is public and a browser check protects nobody. What
 * the browser does add is the cheap part: `required`, `min` on the date, and
 * `type=email`, so an obvious mistake is caught before a round trip.
 *
 * The submit button is never disabled on invalid input. A disabled button
 * that will not say why is the most common accessibility failure in a booking
 * form; a button that submits and explains is better for everyone.
 */

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { CalendarCheck, Check, Loader2, TriangleAlert, User, Building2 } from "lucide-react";
import { useLang } from "./i18n";
import { FORM, GARDEN, PROJECTS } from "./content";
import { GG } from "./theme";

type Audience = "individual" | "business";

/** Everything the endpoint accepts, kept as strings so the inputs stay
 *  controlled and the server does the coercion in one place. */
interface FormState {
  name: string;
  email: string;
  phone: string;
  siteAddress: string;
  areaM2: string;
  service: string;
  project: string;
  date: string;
  notes: string;
  company: string;
  companyRole: string;
  taxId: string;
  invoiceEmail: string;
  poNumber: string;
}

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  siteAddress: "",
  areaM2: "",
  service: "design",
  project: "villa-garden",
  date: "",
  notes: "",
  company: "",
  companyRole: "",
  taxId: "",
  invoiceEmail: "",
  poNumber: "",
};

/** Today as YYYY-MM-DD in the visitor's own timezone — `toISOString` would
 *  give UTC and rule out today for anyone east of Greenwich after 21:00. */
function today(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function Label({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold" style={{ color: GG.cream }}>
      {children}
      {hint ? (
        <span className="ms-1.5 font-normal" style={{ color: GG.faint }}>
          ({hint})
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[12.5px]" style={{ color: GG.warn }}>
      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export function ReservationForm() {
  const { t: c, lang } = useLang();
  const uid = useId();

  const [audience, setAudience] = useState<Audience>("individual");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; confirmationSent: boolean } | null>(null);

  /* The honeypot: a field positioned off-screen that no person sees and a
     naive bot fills in. Kept in a ref rather than state so it never triggers
     a render, and never announced to a screen reader. */
  const honeypot = useRef<HTMLInputElement>(null);

  const minDate = useMemo(today, []);
  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* Switching audience changes which site types are on offer, so one chosen
     on the other tab would submit an id the server rejects. */
  function switchTo(next: Audience) {
    if (next === audience) return;
    setAudience(next);
    setForm((prev) => ({ ...prev, project: PROJECTS[next][0].id }));
    setErrors({});
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setErrors({});
    setProblem(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          audience,
          areaM2: Number(form.areaM2),
          lang,
          website: honeypot.current?.value ?? "",
        }),
      });

      /* A static-only host has no function to answer this path, so the SPA
         fallback returns index.html. Say that plainly rather than failing on
         a JSON parse error nobody can interpret. */
      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error(c(FORM.errNoBackend));
      }

      const data = await res.json();

      if (!res.ok) {
        if (data?.fields && typeof data.fields === "object") setErrors(data.fields);
        setProblem(data?.message || c(FORM.errOffline));
        return;
      }

      setDone({ reference: data.reference, confirmationSent: Boolean(data.confirmationSent) });
    } catch (err: any) {
      setProblem(err?.message || c(FORM.errOffline));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        className="gg-rise rounded-3xl p-8 text-center sm:p-12"
        style={{ background: GG.panel, border: `1px solid ${GG.line}` }}
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: GG.leaf, color: GG.onLeaf }}
        >
          <Check className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-display text-[24px] font-bold" style={{ color: GG.cream }}>
          {c(FORM.successTitle)}
        </h3>
        <p className="mt-2 text-[15px]" style={{ color: GG.muted }}>
          {c(FORM.successBody)}
        </p>
        <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: GG.faint }}>
          {c(FORM.successRef)}
        </p>
        <p dir="ltr" className="mt-1 font-mono text-[20px] font-bold" style={{ color: GG.leaf }}>
          {done.reference}
        </p>
        {done.confirmationSent ? (
          <p className="mt-4 text-[13.5px]" style={{ color: GG.faint }}>
            {c(FORM.successMail)}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setForm(EMPTY);
          }}
          className="mt-7 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors"
          style={{ border: `1px solid ${GG.lineBright}`, color: GG.cream }}
        >
          {c(FORM.another)}
        </button>
      </div>
    );
  }

  const field = (key: keyof FormState) => ({
    id: `${uid}-${key}`,
    errorId: `${uid}-${key}-error`,
    invalid: Boolean(errors[key]),
  });

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl p-6 sm:p-8"
      style={{ background: GG.panel, border: `1px solid ${GG.line}` }}
    >
      {/* ------------------------------------------------ who is booking */}
      <fieldset>
        <legend className="sr-only">{c(FORM.title)}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["individual", "business"] as const).map((option) => {
            const active = audience === option;
            const Icon = option === "individual" ? User : Building2;
            return (
              <button
                key={option}
                type="button"
                onClick={() => switchTo(option)}
                aria-pressed={active}
                className="rounded-2xl p-4 text-start transition-colors"
                style={{
                  background: active ? GG.raised : "transparent",
                  border: `1px solid ${active ? GG.leaf : GG.line}`,
                }}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: active ? GG.leaf : GG.faint }} />
                  <span className="text-[15px] font-bold" style={{ color: active ? GG.cream : GG.muted }}>
                    {c(option === "individual" ? FORM.individual : FORM.business)}
                  </span>
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed" style={{ color: GG.faint }}>
                  {c(option === "individual" ? FORM.individualHint : FORM.businessHint)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* --------------------------------------------------------- the site

          First, and full width: this is the job. Everything below it is
          detail, and a client who fills in only this and their phone number
          can still be helped. */}
      <div className="mt-7">
        <Label htmlFor={field("siteAddress").id} hint={c(FORM.siteAddressHint)}>
          {c(FORM.siteAddress)}
        </Label>
        <input
          id={field("siteAddress").id}
          type="text"
          required
          autoComplete="street-address"
          value={form.siteAddress}
          onChange={(e) => set("siteAddress")(e.target.value)}
          aria-invalid={field("siteAddress").invalid}
          aria-describedby={errors.siteAddress ? field("siteAddress").errorId : undefined}
          className="gg-field"
        />
        <FieldError id={field("siteAddress").errorId} message={errors.siteAddress} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={field("service").id}>{c(FORM.service)}</Label>
          <select
            id={field("service").id}
            value={form.service}
            onChange={(e) => set("service")(e.target.value)}
            aria-invalid={field("service").invalid}
            aria-describedby={errors.service ? field("service").errorId : undefined}
            className="gg-field"
          >
            {GARDEN.services.map((service) => (
              <option key={service.id} value={service.id}>
                {c(service.name)}
              </option>
            ))}
          </select>
          <FieldError id={field("service").errorId} message={errors.service} />
        </div>

        <div>
          <Label htmlFor={field("project").id}>{c(FORM.project)}</Label>
          <select
            id={field("project").id}
            value={form.project}
            onChange={(e) => set("project")(e.target.value)}
            aria-invalid={field("project").invalid}
            aria-describedby={errors.project ? field("project").errorId : undefined}
            className="gg-field"
          >
            {PROJECTS[audience].map((project) => (
              <option key={project.id} value={project.id}>
                {c(project.name)}
              </option>
            ))}
          </select>
          <FieldError id={field("project").errorId} message={errors.project} />
        </div>

        <div>
          <Label htmlFor={field("areaM2").id} hint={c(FORM.areaHint)}>
            {c(FORM.areaM2)}
          </Label>
          <input
            id={field("areaM2").id}
            type="number"
            required
            min={1}
            max={50000}
            inputMode="numeric"
            placeholder="200"
            value={form.areaM2}
            onChange={(e) => set("areaM2")(e.target.value)}
            aria-invalid={field("areaM2").invalid}
            aria-describedby={errors.areaM2 ? field("areaM2").errorId : undefined}
            className="gg-field"
            dir="ltr"
          />
          <FieldError id={field("areaM2").errorId} message={errors.areaM2} />
        </div>

        <div className="hidden sm:block" aria-hidden="true" />

        {/* A day, not an hour. A client cannot know which hour suits a crew
            already booked across the city, so asking for one only produces a
            guess the office has to undo on the phone. */}
        <div>
          <Label htmlFor={field("date").id} hint={c(FORM.dateHint)}>
            {c(FORM.date)}
          </Label>
          <input
            id={field("date").id}
            type="date"
            required
            min={minDate}
            value={form.date}
            onChange={(e) => set("date")(e.target.value)}
            aria-invalid={field("date").invalid}
            aria-describedby={errors.date ? field("date").errorId : undefined}
            className="gg-field"
            dir="ltr"
          />
          <FieldError id={field("date").errorId} message={errors.date} />
        </div>
      </div>

      {/* ------------------------------------------------------- who you are */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor={field("name").id}>{c(FORM.name)}</Label>
          <input
            id={field("name").id}
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            aria-invalid={field("name").invalid}
            aria-describedby={errors.name ? field("name").errorId : undefined}
            className="gg-field"
          />
          <FieldError id={field("name").errorId} message={errors.name} />
        </div>

        <div>
          <Label htmlFor={field("email").id}>{c(FORM.email)}</Label>
          <input
            id={field("email").id}
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            aria-invalid={field("email").invalid}
            aria-describedby={errors.email ? field("email").errorId : undefined}
            className="gg-field"
            dir="ltr"
          />
          <FieldError id={field("email").errorId} message={errors.email} />
        </div>

        <div>
          <Label htmlFor={field("phone").id}>{c(FORM.phone)}</Label>
          <input
            id={field("phone").id}
            type="tel"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
            aria-invalid={field("phone").invalid}
            aria-describedby={errors.phone ? field("phone").errorId : undefined}
            className="gg-field"
            dir="ltr"
          />
          <FieldError id={field("phone").errorId} message={errors.phone} />
        </div>
      </div>

      {/* ------------------------------------------------- the company half */}
      {audience === "business" ? (
        <div
          className="gg-rise mt-4 grid gap-4 rounded-2xl p-5 sm:grid-cols-2"
          style={{ background: GG.raised, border: `1px solid ${GG.line}` }}
        >
          <div className="sm:col-span-2">
            <Label htmlFor={field("company").id}>{c(FORM.company)}</Label>
            <input
              id={field("company").id}
              type="text"
              required
              autoComplete="organization"
              value={form.company}
              onChange={(e) => set("company")(e.target.value)}
              aria-invalid={field("company").invalid}
              aria-describedby={errors.company ? field("company").errorId : undefined}
              className="gg-field"
            />
            <FieldError id={field("company").errorId} message={errors.company} />
          </div>

          <div>
            <Label htmlFor={field("companyRole").id} hint={c(FORM.optional)}>
              {c(FORM.companyRole)}
            </Label>
            <input
              id={field("companyRole").id}
              type="text"
              autoComplete="organization-title"
              value={form.companyRole}
              onChange={(e) => set("companyRole")(e.target.value)}
              className="gg-field"
            />
          </div>

          <div>
            <Label htmlFor={field("taxId").id} hint={c(FORM.optional)}>
              {c(FORM.taxId)}
            </Label>
            <input
              id={field("taxId").id}
              type="text"
              value={form.taxId}
              onChange={(e) => set("taxId")(e.target.value)}
              className="gg-field"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor={field("invoiceEmail").id} hint={c(FORM.optional)}>
              {c(FORM.invoiceEmail)}
            </Label>
            <input
              id={field("invoiceEmail").id}
              type="email"
              value={form.invoiceEmail}
              onChange={(e) => set("invoiceEmail")(e.target.value)}
              aria-invalid={field("invoiceEmail").invalid}
              aria-describedby={errors.invoiceEmail ? field("invoiceEmail").errorId : undefined}
              className="gg-field"
              dir="ltr"
            />
            <FieldError id={field("invoiceEmail").errorId} message={errors.invoiceEmail} />
          </div>

          <div>
            <Label htmlFor={field("poNumber").id} hint={c(FORM.optional)}>
              {c(FORM.poNumber)}
            </Label>
            <input
              id={field("poNumber").id}
              type="text"
              value={form.poNumber}
              onChange={(e) => set("poNumber")(e.target.value)}
              className="gg-field"
              dir="ltr"
            />
          </div>
        </div>
      ) : null}

      {/* -------------------------------------------------------------notes */}
      <div className="mt-4">
        <Label htmlFor={field("notes").id} hint={c(FORM.optional)}>
          {c(FORM.notes)}
        </Label>
        <textarea
          id={field("notes").id}
          rows={3}
          maxLength={1200}
          placeholder={c(FORM.notesHint)}
          value={form.notes}
          onChange={(e) => set("notes")(e.target.value)}
          className="gg-field resize-y"
        />
      </div>

      {/* Clipped to nothing rather than display:none — some bots skip hidden
          fields but fill anything present in the DOM. Collapsed with
          overflow rather than parked off-screen at -9999px, which in a
          right-to-left layout can add a scrollbar to the whole page.
          aria-hidden and tabIndex keep it away from keyboards and readers. */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} ref={honeypot} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {problem ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl p-3.5 text-[13.5px] leading-relaxed"
          style={{ background: "#1a0f0c", border: `1px solid #43241d`, color: GG.warn }}
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{problem}</span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold transition-opacity hover:opacity-90 disabled:opacity-70 sm:w-auto"
        style={{ background: GG.leaf, color: GG.onLeaf }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
        {c(busy ? FORM.sending : FORM.submit)}
      </button>
    </form>
  );
}
