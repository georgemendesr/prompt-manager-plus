
import { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddCategory } from "@/components/AddCategory";
import { AdminGuard } from "@/components/AdminGuard";
import { useForceDeleteCategory } from "@/hooks/useForceDeleteCategory";
import type { Category } from "@/types/prompt";

interface CategoryHeaderProps {
  name: string;
  hasSubcategories: boolean;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  categories?: Category[];
  category: Category;
}

export const CategoryHeader = ({
  name,
  hasSubcategories,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  categories = [],
  category
}: CategoryHeaderProps) => {
  const { forceDeleteCategory, isDeleting } = useForceDeleteCategory();
  
  const handleDelete = async () => {
    console.log(`🎯 Tentando excluir categoria: ${name} (ID: ${category.id})`);
    
    // Para categorias problemáticas, usar exclusão forçada
    const problematicCategories = ['Emocionantes II', 'emocionantes ii'];
    const isProblematic = problematicCategories.some(prob => 
      name.toLowerCase().includes(prob.toLowerCase())
    );
    
    if (isProblematic) {
      console.log(`⚠️ Categoria problemática detectada - usando exclusão forçada`);
      const success = await forceDeleteCategory(category.id, name);
      if (success) {
        // Recarregar a página após exclusão bem-sucedida
        window.location.reload();
      }
    } else {
      // Usar método normal para outras categorias
      await onDelete(category.id);
    }
  };

  return (
    <div 
      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        {hasSubcategories && (
          <div className="flex items-center justify-center h-6 w-6">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-700 hover:text-gray-900">
          {name}
        </h3>
      </div>
      <AdminGuard showError={false}>
        <div 
          className="flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <AddCategory
                  mode="edit"
                  initialName={name}
                  initialParentId={category.parentId}
                  onEdit={onEdit}
                  categories={categories}
                />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </AdminGuard>
    </div>
  );
};
