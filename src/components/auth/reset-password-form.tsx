"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordForm() {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input id="password" type="password" />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input id="confirmPassword" type="password" />
      </div>
      <Button type="submit" className="w-full">
        Réinitialiser
      </Button>
    </form>
  );
}
