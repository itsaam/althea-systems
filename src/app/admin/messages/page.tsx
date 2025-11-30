import DataTable from "@/components/admin/data-table";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Messages</h1>
      <DataTable />
    </div>
  );
}
