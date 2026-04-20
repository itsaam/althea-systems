"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export default function AdminContentPage() {
  const [html, setHtml] = useState("");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestion contenu</h1>
      <RichTextEditor value={html} onChange={setHtml} />
    </div>
  );
}
