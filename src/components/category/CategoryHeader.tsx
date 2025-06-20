
import { useState } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/AdminGuard";
import { AddCategory } from "@/components/AddCategory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Category } from "@/types/prompt";

interface CategoryHeaderProps {
  name: string;
  hasSubcategories: boolean;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  categories: Category[];
  category: Category;
}

export const CategoryHeader = ({
  name,
  hasSubcategories,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  categories,
  category
}: CategoryHeaderProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(category.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1 h-8 w-8"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        
        <h3 className="text-lg font-semibold text-gray-800">
          {name}
        </h3>
        
        {hasSubcategories && (
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
            {category.subcategories?.length || 0} subcategorias
          </span>
        )}
      </div>

      <AdminGuard>
        <div className="flex items-center gap-2">
          <AddCategory
            mode="edit"
            initialName={category.name}
            initialParentId={category.parentId}
            categories={categories}
            onEdit={(newName, newParentId) => onEdit(category.id, newName, newParentId)}
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a categoria "{name}"? 
                  {hasSubcategories && " Esta ação também excluirá todas as subcategorias e prompts relacionados."}
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminGuard>
    </div>
  );
};
