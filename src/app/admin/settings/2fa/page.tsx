"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Setup2FAPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"init" | "verify" | "success">("init");
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSecret(data.secret);
        setOtpauthUrl(data.otpauthUrl);
        setBackupCodes(data.backupCodes || []);
        setStep("verify");
      } else {
        setError(data.error || "Erreur lors de l'initialisation");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, isSetup: true }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour la session avec les nouveaux flags 2FA
        await update({
          user: {
            ...session?.user,
            twoFactorEnabled: true,
            twoFactorVerified: true,
          },
        });
        setStep("success");
        toast.success("2FA activé avec succès !");
      } else {
        setError(data.error || "Code incorrect");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `Codes de sauvegarde Althea Systems
Généré le: ${new Date().toLocaleString("fr-FR")}

IMPORTANT: Conservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}

Ces codes peuvent être utilisés pour accéder à votre compte si vous perdez l'accès à votre application d'authentification.
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "althea-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Codes téléchargés avec succès");
  };

  const goToDashboard = async () => {
    router.push("/admin");
    router.refresh();
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-500">Accès réservé aux administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Configuration de l&apos;authentification à deux facteurs
        </h1>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {step === "init" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Pourquoi activer la 2FA ?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Protection renforcée de votre compte admin</li>
                <li>
                  • Sécurité supplémentaire contre les accès non autorisés
                </li>
                <li>• Conformité aux bonnes pratiques de sécurité</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Prérequis</h3>
              <p className="text-sm text-blue-700">
                Vous aurez besoin d&apos;une application d&apos;authentification
                comme :
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Google Authenticator</li>
                <li>• Microsoft Authenticator</li>
                <li>• Authy</li>
                <li>• 1Password</li>
              </ul>
            </div>

            <Button onClick={initSetup} disabled={isLoading} className="w-full">
              {isLoading ? "Initialisation..." : "Commencer la configuration"}
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">1. Scannez le QR code</h3>
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <QRCodeSVG
                  value={otpauthUrl}
                  size={192}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">
                2. Ou entrez ce code manuellement
              </h3>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all select-all">
                {secret}
              </div>
            </div>

            {backupCodes.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">
                  3. Sauvegardez vos codes de récupération
                </h3>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-semibold mb-2">
                    ⚠️ Important : Ces codes ne seront affichés qu&apos;une
                    seule fois !
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Conservez ces codes en lieu sûr. Chaque code peut être
                    utilisé une seule fois si vous perdez l&apos;accès à votre
                    application d&apos;authentification.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, i) => (
                      <div
                        key={i}
                        className="p-2 bg-white rounded font-mono text-sm text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={downloadBackupCodes}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    📥 Télécharger les codes
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">
                {backupCodes.length > 0 ? "4" : "3"}. Entrez le code généré
              </Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("init")}
                disabled={isLoading}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={verifyAndEnable}
                disabled={isLoading || code.length !== 6}
                className="flex-1"
              >
                {isLoading ? "Vérification..." : "Activer la 2FA"}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold">2FA activé avec succès !</h2>
            <p className="text-muted-foreground">
              Votre compte est maintenant protégé par l&apos;authentification à
              deux facteurs.
            </p>
            <div className="p-4 bg-yellow-50 rounded-lg text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">Important</h3>
              <p className="text-sm text-yellow-700">
                Conservez votre application d&apos;authentification en lieu sûr.
                Vous en aurez besoin à chaque connexion au panneau admin.
              </p>
            </div>
            <Button onClick={goToDashboard} className="mt-4">
              Retour au dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
