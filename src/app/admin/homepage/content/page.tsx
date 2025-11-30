import RichTextEditor from "@/components/admin/rich-text-editor";

export default function AdminContentPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestion contenu</h1>
      <RichTextEditor />
    </div>
  );
}
