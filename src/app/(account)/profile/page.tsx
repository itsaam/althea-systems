import type { Metadata } from "next";
import ProfileForm from "@/components/account/profile-form";
import PasswordForm from "@/components/account/password-form";

export const metadata: Metadata = {
  title: "Mon profil",
  description:
    "Modifiez vos informations personnelles, votre mot de passe et vos préférences de compte Althea Systems.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Mon profil
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}
