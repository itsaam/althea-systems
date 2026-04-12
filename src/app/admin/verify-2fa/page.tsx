"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck, Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export default function Verify2FAPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus le premier input au chargement
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((c) => c) && index === 5) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);

    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const fullCode = codeString || code.join("");
    if (fullCode.length !== 6) {
      setError("Veuillez entrer le code à 6 chiffres");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await response.json();

      if (response.ok) {
        await update({
          user: {
            ...session?.user,
            twoFactorVerified: true,
          },
        });
        toast.success("Vérification réussie");
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Code incorrect");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = code.every((c) => c);

  return (
    <section className="relative isolate grain overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-[1400px] items-center justify-center px-4 py-16 sm:px-6 lg:px-10">
        <div className="w-full max-w-[520px]">
          {/* Index marker */}
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
            <span>— Admin · Sécurité</span>
            <span className="tabular-nums">Index · 007 / 2FA</span>
          </div>

          {/* Main card */}
          <div className="mt-6 border border-border/60 bg-background p-8 md:p-10">
            {/* Icon + eyebrow */}
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center border border-border/60">
                <ShieldCheck
                  className="h-4 w-4 text-foreground/70"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                  Authentification forte
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                  Time-based · TOTP
                </p>
              </div>
            </div>

            {/* Title */}
            <h1 className="mt-10 font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground md:text-[40px]">
              Vérification
              <br />
              en deux temps
              <span
                aria-hidden
                className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-electric-indigo-500 align-middle"
              />
            </h1>

            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-foreground/60">
              Ouvrez votre application d&apos;authentification (Google
              Authenticator, Authy, 1Password…) et entrez le code à 6 chiffres
              ci-dessous.
            </p>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="mt-8 flex items-center gap-3 border border-destructive/60 bg-background px-4 py-3"
              >
                <span
                  aria-hidden
                  className="h-1 w-1 shrink-0 rounded-full bg-destructive"
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-destructive">
                  {error}
                </p>
              </div>
            )}

            {/* Code inputs */}
            <div
              className="mt-10 flex justify-between gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  aria-label={`Chiffre ${index + 1} sur 6`}
                  className="h-16 w-full max-w-[64px] border-x-0 border-t-0 border-b-2 border-border/60 bg-transparent text-center font-mono text-3xl font-medium tabular-nums text-foreground outline-none transition-colors focus:border-foreground disabled:opacity-50"
                />
              ))}
            </div>

            {/* Progress indicator */}
            <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              <span>État</span>
              <span className="tabular-nums">
                {code.filter((c) => c).length} / 6
              </span>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || !isComplete}
              className="group/cta mt-10 inline-flex h-12 w-full items-center justify-between gap-3 border border-foreground bg-background px-5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-background disabled:text-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              <span className="inline-flex items-center gap-3">
                {isLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {isLoading ? "Vérification" : "Vérifier le code"}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 group-disabled/cta:translate-x-0 group-disabled/cta:translate-y-0" />
            </button>

            {/* Recovery link */}
            <div className="mt-8 border-t border-border/60 pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
                Accès perdu ?
              </p>
              <button
                type="button"
                className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:text-foreground/60 focus-visible:outline-none focus-visible:underline"
              >
                → Utiliser un code de récupération
              </button>
            </div>
          </div>

          {/* Helper line */}
          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
            Vous pouvez coller votre code directement (⌘V)
          </p>
        </div>
      </div>
    </section>
  );
}
