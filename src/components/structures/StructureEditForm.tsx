
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import type { MusicStructure } from "@/types/prompt";

interface StructureEditFormProps {
  editedStructure: MusicStructure;
  setEditedStructure: (structure: MusicStructure) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const StructureEditForm = ({
  editedStructure,
  setEditedStructure,
  onSave,
  onCancel
}: StructureEditFormProps) => {
  return (
    <div className="space-y-4">
      <Input
        value={editedStructure.name}
        onChange={(e) => setEditedStructure({ ...editedStructure, name: e.target.value })}
      />
      <Input
        value={editedStructure.tags.join(", ")}
        onChange={(e) => setEditedStructure({ 
          ...editedStructure, 
          tags: e.target.value.split(",").map(t => t.trim()) 
        })}
      />
      <Textarea
        value={editedStructure.effect}
        onChange={(e) => setEditedStructure({ ...editedStructure, effect: e.target.value })}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
        <Button size="icon" onClick={onSave}>
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
