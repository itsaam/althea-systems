import AccountSidebar from "@/components/layout/account-sidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <AccountSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
