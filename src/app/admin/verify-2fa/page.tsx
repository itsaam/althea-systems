"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    // Accepter uniquement les chiffres
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Prendre le dernier caractère
    setCode(newCode);

    // Auto-focus sur le prochain input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si tous les champs sont remplis, soumettre automatiquement
    if (newCode.every((c) => c) && index === 5) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Retour arrière : focus sur l'input précédent
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

    // Focus sur le dernier input rempli ou le suivant
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    // Soumettre si complet
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
        // Mettre à jour la session avec twoFactorVerified = true
        await update({
          user: {
            ...session?.user,
            twoFactorVerified: true,
          },
        });
        toast.success("Vérification réussie !");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-8 bg-background rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Vérification 2FA</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Entrez le code à 6 chiffres de votre application
            d&apos;authentification
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md text-center">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              className="w-12 h-14 text-center text-2xl font-bold"
            />
          ))}
        </div>

        <Button
          onClick={() => handleSubmit()}
          disabled={isLoading || code.some((c) => !c)}
          className="w-full"
        >
          {isLoading ? "Vérification..." : "Vérifier"}
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Vous n&apos;avez pas accès à votre application ?{" "}
          <button className="text-primary hover:underline">
            Utiliser un code de récupération
          </button>
        </p>
      </div>
    </div>
  );
}
