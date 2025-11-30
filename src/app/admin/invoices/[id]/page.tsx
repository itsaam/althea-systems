interface AdminInvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminInvoiceDetailPage({
  params,
}: AdminInvoiceDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Facture #{id}</h1>
      {/* Invoice details */}
    </div>
  );
}
