"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordForm() {
  return (
    <form className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Entrez votre email et nous vous enverrons un lien pour réinitialiser
        votre mot de passe.
      </p>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="jean@example.com" />
      </div>
      <Button type="submit" className="w-full">
        Envoyer le lien
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
