interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Utilisateur #{id}</h1>
      {/* User details */}
    </div>
  );
}
