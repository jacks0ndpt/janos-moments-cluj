import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SortableStoryPhoto({ id, disabled, label, children }: { id: string; disabled: boolean; label: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative min-w-0 ${isDragging ? "z-10 opacity-70" : ""}`}>
    {children}
    <Button type="button" variant="secondary" size="icon" className="absolute top-1 left-1 h-11 w-11 touch-none cursor-grab active:cursor-grabbing" {...attributes} {...listeners} disabled={disabled} aria-label={label} title={label}><GripVertical size={18} /></Button>
  </div>;
}