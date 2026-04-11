"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientExportButton } from "@/components/admin/client-export-button";
import type { CsvColumn } from "@/lib/csv-export";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/shell/page-header";
import { signalDegradedMode } from "@/lib/admin/mock-data";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  _count: {
    products: number;
  };
}

const CATEGORY_EXPORT_COLUMNS: CsvColumn<Category>[] = [
  { header: "Nom", accessor: (c) => c.name },
  { header: "Slug", accessor: (c) => c.slug },
  { header: "Description", accessor: (c) => c.description ?? "" },
  { header: "Ordre", accessor: (c) => c.order },
  { header: "Active", accessor: (c) => c.active },
  { header: "Nombre de produits", accessor: (c) => c._count.products },
  { header: "Créée le", accessor: (c) => new Date(c.createdAt) },
];

// Sortable row component
function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            width={48}
            height={48}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
            N/A
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
      <TableCell>{category._count.products} produit(s)</TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(category.createdAt).toLocaleDateString("fr-FR")}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(category.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(category.id, category.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      const cats = data.categories || data.data?.categories || [];
      // Sort by order field
      cats.sort((a: Category, b: Category) => a.order - b.order);
      setCategories(cats);
    } catch {
      // Silent fallback — DB unavailable in dev backdoor mode
      setCategories([]);
      signalDegradedMode();
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Etes-vous sur de vouloir supprimer la categorie "${name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Categorie supprimee avec succes");
        fetchCategories();
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(newCategories);

    // Update order for all affected categories
    try {
      await Promise.all(
        newCategories.map((cat, index) =>
          fetch(`/api/categories/${cat.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index }),
          })
        )
      );
      toast.success("Ordre mis a jour");
    } catch (error) {
      console.error("Erreur mise a jour ordre:", error);
      toast.error("Erreur lors de la mise a jour de l'ordre");
      fetchCategories(); // Revert on error
    }
  };

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Admin — Catalogue"
        index="005 / Catégories"
        title="Catégories"
        description="Organisez la taxonomie du catalogue. Glissez-déposez les lignes pour réordonner."
        actions={
          <>
            <ClientExportButton
              rows={filteredCategories}
              columns={CATEGORY_EXPORT_COLUMNS}
              filename="categories"
            />
            <Button onClick={() => router.push("/admin/categories/new")}>
              Nouvelle catégorie
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <Input
          placeholder="Rechercher une categorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <p className="text-sm text-muted-foreground">
          Glissez-deposez les lignes pour reorganiser l&apos;ordre des categories.
        </p>

        <div className="rounded-md border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead>Date de creation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? "Aucune categorie trouvee"
                        : "Aucune categorie"}
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={filteredCategories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredCategories.map((category) => (
                      <SortableRow
                        key={category.id}
                        category={category}
                        onEdit={(id) => router.push(`/admin/categories/${id}`)}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
