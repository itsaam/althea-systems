"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link2,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  Strikethrough,
  Palette,
  RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Variante minimaliste pour les petits blocs de texte (ex: sous-titre
   * du carrousel). Masque les listes et headings.
   */
  minimal?: boolean;
  className?: string;
}

/**
 * Palette alignée sur la charte Althea (tokens CSS de globals.css).
 * On utilise les valeurs HEX calculées à partir des tokens pour que
 * Tiptap puisse les sérialiser proprement en inline styles.
 */
const COLOR_PALETTE: { name: string; value: string }[] = [
  { name: "Défaut", value: "" },
  { name: "Navy", value: "#0B1F3A" },
  { name: "Teal", value: "#0E7C7B" },
  { name: "Foreground", value: "#111111" },
  { name: "Primary", value: "#4338CA" },
  { name: "Destructive", value: "#C8102E" },
  { name: "Muted", value: "#64748B" },
];

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Saisissez votre texte...",
  disabled = false,
  minimal = false,
  className,
}: RichTextEditorProps) {
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-primary underline",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
    editorProps: {
      attributes: {
        "aria-label": "Éditeur de texte enrichi",
        class:
          "prose prose-sm max-w-none p-4 min-h-[160px] focus:outline-none focus-visible:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = (editor.getAttributes("link").href as string) ?? "";
    const url = window.prompt("URL (laisser vide pour retirer le lien)", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Validation URL basique
    const safe = /^(https?:\/\/|\/|mailto:|tel:)/i.test(url);
    if (!safe) {
      window.alert(
        "URL invalide. Utilisez http(s)://, /chemin-relatif, mailto: ou tel:"
      );
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const applyColor = (hex: string) => {
    if (!hex) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(hex).run();
    }
    setShowPalette(false);
  };

  const clearFormatting = () => {
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .clearNodes()
      .run();
  };

  const toolbarBtn = cn(
    "h-8 w-8 p-0 rounded-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  );

  return (
    <div
      className={cn(
        "border border-border rounded-md overflow-hidden bg-background",
        className
      )}
    >
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Mise en forme du texte"
        className="border-b border-border bg-muted/50 p-2 flex gap-0.5 flex-wrap items-center"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          className={cn(toolbarBtn, editor.isActive("bold") && "bg-muted")}
          aria-label="Gras"
          aria-pressed={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            disabled || !editor.can().chain().focus().toggleItalic().run()
          }
          className={cn(toolbarBtn, editor.isActive("italic") && "bg-muted")}
          aria-label="Italique"
          aria-pressed={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          className={cn(toolbarBtn, editor.isActive("underline") && "bg-muted")}
          aria-label="Souligné"
          aria-pressed={editor.isActive("underline")}
        >
          <UnderlineIcon className="h-4 w-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled}
          className={cn(toolbarBtn, editor.isActive("strike") && "bg-muted")}
          aria-label="Barré"
          aria-pressed={editor.isActive("strike")}
        >
          <Strikethrough className="h-4 w-4" aria-hidden="true" />
        </Button>

        {!minimal && (
          <>
            <div className="w-px bg-border mx-1 h-6" aria-hidden="true" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              disabled={disabled}
              className={cn(
                toolbarBtn,
                editor.isActive("heading", { level: 2 }) && "bg-muted"
              )}
              aria-label="Titre niveau 2"
              aria-pressed={editor.isActive("heading", { level: 2 })}
            >
              <Heading2 className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled}
              className={cn(
                toolbarBtn,
                editor.isActive("bulletList") && "bg-muted"
              )}
              aria-label="Liste à puces"
              aria-pressed={editor.isActive("bulletList")}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled}
              className={cn(
                toolbarBtn,
                editor.isActive("orderedList") && "bg-muted"
              )}
              aria-label="Liste numérotée"
              aria-pressed={editor.isActive("orderedList")}
            >
              <ListOrdered className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        )}

        <div className="w-px bg-border mx-1 h-6" aria-hidden="true" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleLink}
          disabled={disabled}
          className={cn(toolbarBtn, editor.isActive("link") && "bg-muted")}
          aria-label="Insérer un lien"
          aria-pressed={editor.isActive("link")}
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* Color picker */}
        <div className="relative" ref={paletteRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPalette((v) => !v)}
            disabled={disabled}
            className={toolbarBtn}
            aria-label="Couleur du texte"
            aria-haspopup="true"
            aria-expanded={showPalette}
          >
            <Palette className="h-4 w-4" aria-hidden="true" />
          </Button>

          {showPalette && (
            <div
              role="menu"
              aria-label="Palette de couleurs"
              className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-md border border-border bg-popover p-2 shadow-md"
              style={{ minWidth: "10rem" }}
            >
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  role="menuitem"
                  onClick={() => applyColor(c.value)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    background: c.value || "transparent",
                    backgroundImage: c.value
                      ? undefined
                      : "linear-gradient(45deg, transparent 45%, currentColor 45%, currentColor 55%, transparent 55%)",
                  }}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFormatting}
          disabled={disabled}
          className={toolbarBtn}
          aria-label="Effacer le formatage"
        >
          <RemoveFormatting className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="w-px bg-border mx-1 h-6" aria-hidden="true" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          className={toolbarBtn}
          aria-label="Annuler"
        >
          <Undo className="h-4 w-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          className={toolbarBtn}
          aria-label="Rétablir"
        >
          <Redo className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
