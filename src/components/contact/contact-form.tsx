"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AlertCircle, Check, Loader2 } from "lucide-react";

const SUBJECTS = [
  { value: "commercial", label: "Demande commerciale" },
  { value: "devis", label: "Demande de devis" },
  { value: "produit", label: "Question produit" },
  { value: "sav", label: "Service après-vente" },
  { value: "livraison", label: "Suivi de livraison" },
  { value: "partenariat", label: "Partenariat" },
  { value: "autre", label: "Autre demande" },
] as const;

const SUBJECT_VALUES = SUBJECTS.map((s) => s.value) as [string, ...string[]];
const SUBJECT_LABEL = new Map<string, string>(
  SUBJECTS.map((s) => [s.value, s.label] as const)
);

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long"),
  email: z.string().trim().email("Adresse email invalide"),
  company: z.string().trim().max(150, "Nom de société trop long").optional(),
  subjectKey: z.enum(SUBJECT_VALUES, {
    message: "Sélectionnez un sujet",
  }),
  message: z
    .string()
    .trim()
    .min(20, "Votre message doit contenir au moins 20 caractères")
    .max(2000, "Votre message est trop long (2000 caractères max)"),
  consent: z.literal(true, {
    message: "Vous devez accepter le traitement de vos données",
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;
type FormState = {
  name: string;
  email: string;
  company: string;
  subjectKey: string;
  message: string;
  consent: boolean;
};
type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  company: "",
  subjectKey: "",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof ContactFormValues]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof ContactFormValues];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Merci de corriger les champs signalés.");
      return;
    }

    setSubmitting(true);
    try {
      const subjectLabel =
        SUBJECT_LABEL.get(parsed.data.subjectKey) ?? parsed.data.subjectKey;
      const fullSubject = parsed.data.company
        ? `[${subjectLabel}] ${parsed.data.company}`
        : `[${subjectLabel}]`;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          subject: fullSubject,
          message: parsed.data.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          data?.error || data?.message || "Impossible d'envoyer votre message.";
        throw new Error(message);
      }

      toast.success("Message envoyé", {
        description: "Notre équipe vous répondra sous 24 heures ouvrées.",
        icon: <Check className="h-4 w-4" aria-hidden="true" />,
      });
      setValues(INITIAL_STATE);
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-t border-border/60 pt-10"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
          Statut · 200 / Reçu
        </p>
        <h2 className="mt-4 font-display text-h2 leading-[1.02] tracking-[-0.025em] text-foreground">
          Message reçu<span className="text-electric-indigo-500">.</span>
        </h2>
        <p className="mt-4 max-w-md text-body text-foreground/70">
          Un membre de notre équipe commerciale vous recontactera sous 24 heures
          ouvrées à l&apos;adresse indiquée. Une copie de confirmation vous a
          été envoyée par email.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 inline-flex items-center rounded-full border border-foreground/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-describedby="contact-form-intro"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/50">
          Formulaire · 001 / Demande
        </p>
        <p id="contact-form-intro" className="text-body text-foreground/70">
          Réponse garantie sous 24 heures ouvrées. Les champs marqués d&apos;un
          astérisque sont obligatoires.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <MinimalField
          label="Nom complet"
          htmlFor="name"
          error={errors.name}
          required
        >
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="Dr. Jeanne Moreau"
            disabled={submitting}
            className={inputClass}
          />
        </MinimalField>

        <MinimalField
          label="Email professionnel"
          htmlFor="email"
          error={errors.email}
          required
        >
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="cabinet@exemple.fr"
            disabled={submitting}
            className={inputClass}
          />
        </MinimalField>
      </div>

      <MinimalField
        label="Société / structure"
        htmlFor="company"
        error={errors.company}
      >
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          value={values.company}
          onChange={(e) => handleChange("company", e.target.value)}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "company-error" : undefined}
          placeholder="Cabinet, clinique, hôpital…"
          disabled={submitting}
          className={inputClass}
        />
      </MinimalField>

      <MinimalField
        label="Sujet"
        htmlFor="subject"
        error={errors.subjectKey}
        required
      >
        <select
          id="subject"
          name="subject"
          value={values.subjectKey}
          onChange={(e) => handleChange("subjectKey", e.target.value)}
          aria-invalid={Boolean(errors.subjectKey)}
          aria-describedby={errors.subjectKey ? "subject-error" : undefined}
          disabled={submitting}
          className={`${inputClass} appearance-none bg-[length:8px] bg-[right_0_center] bg-no-repeat pr-6`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='%23000' d='M0 2l4 4 4-4z'/></svg>\")",
          }}
        >
          <option value="" disabled>
            Sélectionnez un sujet
          </option>
          {SUBJECTS.map((subject) => (
            <option key={subject.value} value={subject.value}>
              {subject.label}
            </option>
          ))}
        </select>
      </MinimalField>

      <MinimalField
        label="Message"
        htmlFor="message"
        error={errors.message}
        required
      >
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(e) => handleChange("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : "message-help"}
          placeholder="Décrivez votre besoin, votre structure et le niveau d'urgence…"
          maxLength={2000}
          disabled={submitting}
          className={`${inputClass} resize-y pt-3`}
        />
        {!errors.message && (
          <p
            id="message-help"
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-foreground/40"
          >
            {String(values.message.length).padStart(4, "0")} / 2000
          </p>
        )}
      </MinimalField>

      <div className="border-t border-border/60 pt-6">
        <label
          htmlFor="consent"
          className="flex cursor-pointer items-start gap-3 text-sm"
        >
          <input
            id="consent"
            type="checkbox"
            checked={values.consent}
            onChange={(e) => handleChange("consent", e.target.checked)}
            disabled={submitting}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-1 h-3.5 w-3.5 shrink-0 border-foreground/40 accent-electric-indigo-500"
          />
          <span className="text-xs leading-relaxed text-foreground/70">
            J&apos;accepte qu&apos;Althea Systems traite les données saisies
            dans ce formulaire dans le seul but de répondre à ma demande,
            conformément à sa{" "}
            <a
              href="/legal/privacy"
              className="font-medium text-foreground underline underline-offset-4 hover:text-electric-indigo-500"
            >
              politique de confidentialité
            </a>
            . <span className="text-electric-indigo-500">*</span>
          </span>
        </label>
        {errors.consent && (
          <p
            id="consent-error"
            role="alert"
            className="ml-7 mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {errors.consent}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-all hover:bg-electric-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Envoi en cours
            </>
          ) : (
            <>
              Envoyer le message
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full border-0 border-b border-border/80 bg-transparent px-0 py-3 font-sans text-body text-foreground placeholder:text-foreground/30 focus:border-foreground focus:outline-none focus:ring-0 disabled:opacity-60 aria-[invalid=true]:border-red-500";

interface MinimalFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function MinimalField({
  label,
  htmlFor,
  error,
  required,
  children,
}: MinimalFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50"
      >
        {label}
        {required && <span className="ml-1 text-electric-indigo-500">*</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
