interface AdminMessageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMessageDetailPage({
  params,
}: AdminMessageDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Message #{id}</h1>
      {/* Message details */}
    </div>
  );
}
