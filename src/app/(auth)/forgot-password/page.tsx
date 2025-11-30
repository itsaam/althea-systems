import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">
        Mot de passe oublié
      </h1>
      <ForgotPasswordForm />
    </div>
  );
}
