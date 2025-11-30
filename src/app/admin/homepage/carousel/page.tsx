import DragDropList from "@/components/admin/drag-drop-list";
import ImageUpload from "@/components/admin/image-upload";

export default function AdminCarouselPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestion carrousel</h1>
      <ImageUpload />
      <DragDropList />
    </div>
  );
}
