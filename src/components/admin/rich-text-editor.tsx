"use client";

import { Label } from "@/components/ui/label";

export default function RichTextEditor() {
  return (
    <div className="space-y-2">
      <Label>Contenu</Label>
      <div className="border rounded-lg">
        <div className="border-b p-2 flex gap-2">
          <button type="button" className="p-2 hover:bg-muted rounded">
            B
          </button>
          <button type="button" className="p-2 hover:bg-muted rounded italic">
            I
          </button>
          <button
            type="button"
            className="p-2 hover:bg-muted rounded underline"
          >
            U
          </button>
        </div>
        <textarea
          className="w-full min-h-[300px] p-4 text-sm resize-none focus:outline-none"
          placeholder="Écrivez votre contenu ici..."
        />
      </div>
    </div>
  );
}
