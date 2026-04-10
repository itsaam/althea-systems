import { InvoiceDetailView } from "@/components/admin/invoices/invoice-detail-view";

interface AdminInvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminInvoiceDetailPage({
  params,
}: AdminInvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailView invoiceId={id} />;
}
