import DragDropList from "@/components/admin/drag-drop-list";

export default function AdminFeaturedProductsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Top produits</h1>
      <DragDropList />
    </div>
  );
}
