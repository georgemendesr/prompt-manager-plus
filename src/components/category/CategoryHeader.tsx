
import { useState } from "react";
import { Edit, Trash, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CategoryHeaderProps {
  name: string;
  hasSubcategories: boolean;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (newName: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const CategoryHeader = ({
  name,
  hasSubcategories,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: CategoryHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  const handleEdit = async () => {
    await onEdit(editName);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {hasSubcategories && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-white/30"
            onClick={onToggle}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        {isEditing ? (
          <Dialog>
            <DialogTrigger asChild>
              <h3 className="text-lg font-semibold text-gray-700 hover:text-gray-900">
                {name}
              </h3>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Categoria</DialogTitle>
              </DialogHeader>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome da categoria"
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEdit}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <h3 
            className="text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
            onClick={onToggle}
          >
            {name}
          </h3>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
