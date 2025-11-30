"use client";

export default function DragDropList() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Glissez pour réorganiser</p>
      <div className="space-y-2">
        {/* Draggable items will be mapped here */}
        <div className="p-4 border rounded-lg bg-background flex items-center gap-4 cursor-move">
          <span className="text-muted-foreground">⋮⋮</span>
          <span>Item 1</span>
        </div>
        <div className="p-4 border rounded-lg bg-background flex items-center gap-4 cursor-move">
          <span className="text-muted-foreground">⋮⋮</span>
          <span>Item 2</span>
        </div>
      </div>
    </div>
  );
}
