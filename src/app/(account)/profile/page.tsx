import ProfileForm from "@/components/account/profile-form";
import PasswordForm from "@/components/account/password-form";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <ProfileForm />
      <PasswordForm />
    </div>
  );
}
