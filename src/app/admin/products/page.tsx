import DataTable from "@/components/admin/data-table";

export default function AdminProductsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Produits</h1>
      <DataTable />
    </div>
  );
}
