import ResetPasswordForm from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">
        Réinitialiser le mot de passe
      </h1>
      <ResetPasswordForm />
    </div>
  );
}
