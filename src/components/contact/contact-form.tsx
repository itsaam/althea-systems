"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AlertCircle, Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
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
      const subjectLabel = SUBJECT_LABEL.get(parsed.data.subjectKey) ?? parsed.data.subjectKey;
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
        className="rounded-2xl border bg-card p-8 text-center md:p-10"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-bold tracking-tight">
          Message bien reçu
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Un membre de notre équipe commerciale va vous recontacter sous 24
          heures ouvrées à l&apos;adresse indiquée. Une copie de confirmation
          vous a été envoyée par email.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border bg-card p-6 md:p-8"
      aria-describedby="contact-form-intro"
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Envoyez-nous un message
        </h2>
        <p id="contact-form-intro" className="mt-2 text-sm text-muted-foreground">
          Réponse garantie sous 24 heures ouvrées. Les champs marqués d&apos;un
          astérisque sont obligatoires.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="name" error={errors.name} required>
          <Input
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
          />
        </Field>

        <Field label="Email professionnel" htmlFor="email" error={errors.email} required>
          <Input
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
          />
        </Field>
      </div>

      <Field label="Société / structure" htmlFor="company" error={errors.company}>
        <Input
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
        />
      </Field>

      <Field label="Sujet" htmlFor="subject" error={errors.subjectKey} required>
        <Select
          value={values.subjectKey}
          onValueChange={(val) => handleChange("subjectKey", val)}
          disabled={submitting}
        >
          <SelectTrigger
            id="subject"
            aria-invalid={Boolean(errors.subjectKey)}
            aria-describedby={errors.subjectKey ? "subject-error" : undefined}
            className="h-10"
          >
            <SelectValue placeholder="Sélectionnez un sujet" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject.value} value={subject.value}>
                {subject.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Message" htmlFor="message" error={errors.message} required>
        <Textarea
          id="message"
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => handleChange("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : "message-help"}
          placeholder="Décrivez votre besoin, votre structure et le niveau d'urgence…"
          maxLength={2000}
          disabled={submitting}
          className="min-h-[150px] resize-y"
        />
        {!errors.message && (
          <p id="message-help" className="mt-1.5 text-xs text-muted-foreground">
            {values.message.length} / 2000 caractères
          </p>
        )}
      </Field>

      <div
        className={`rounded-lg border p-4 ${
          errors.consent ? "border-destructive/40 bg-destructive/5" : "bg-muted/30"
        }`}
      >
        <label
          htmlFor="consent"
          className="flex cursor-pointer items-start gap-3 text-sm"
        >
          <Checkbox
            id="consent"
            checked={values.consent}
            onCheckedChange={(checked) => handleChange("consent", checked === true)}
            disabled={submitting}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">
            J&apos;accepte qu&apos;Althea Systems traite les données saisies
            dans ce formulaire dans le seul but de répondre à ma demande,
            conformément à sa{" "}
            <a
              href="/legal/privacy"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              politique de confidentialité
            </a>
            . <span className="text-destructive">*</span>
          </span>
        </label>
        {errors.consent && (
          <p
            id="consent-error"
            role="alert"
            className="ml-7 mt-2 flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {errors.consent}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            Envoyer le message
          </>
        )}
      </Button>
    </form>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
