
import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { MusicStructure } from "@/types/prompt";
import { StructureEditForm } from "./StructureEditForm";
import { StructureItemContent } from "./StructureItemContent";

interface SubStructure extends MusicStructure {
  subcategories?: SubStructure[];
}

interface StructureItemProps {
  structure: SubStructure;
  level?: number;
  onEdit: (id: string, structure: MusicStructure) => void;
  onDelete: (id: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

export const StructureItem = ({ 
  structure, 
  level = 0,
  onEdit,
  onDelete,
  editingId,
  setEditingId,
}: StructureItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editedStructure, setEditedStructure] = useState(structure);

  const handleEdit = () => {
    onEdit(structure.id, editedStructure);
    setEditingId(null);
  };

  return (
    <div className={`space-y-4 ${level > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
      <Card className="p-4">
        {editingId === structure.id ? (
          <StructureEditForm
            editedStructure={editedStructure}
            setEditedStructure={setEditedStructure}
            onSave={handleEdit}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <StructureItemContent
            structure={structure}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setEditingId={setEditingId}
            onDelete={onDelete}
            hasSubcategories={structure.subcategories?.length > 0}
          />
        )}
      </Card>
      
      {isExpanded && structure.subcategories?.map((subStructure) => (
        <StructureItem
          key={subStructure.id}
          structure={subStructure}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          editingId={editingId}
          setEditingId={setEditingId}
        />
      ))}
    </div>
  );
};
