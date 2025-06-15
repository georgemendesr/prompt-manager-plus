import { useState } from "react";
import { MoreHorizontal, ChevronRight, FolderOpen, X, Edit, Trash, FolderPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Category } from "@/types/prompt";
import { AddCategory } from "../AddCategory";
import { EditCategory } from "../EditCategory";

interface CategoryHeaderProps {
  category: Category;
  isExpanded: boolean;
  toggleExpanded: () => void;
  onAddSubcategory: (name: string, parentId: string) => Promise<boolean>;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  availableParentCategories?: Category[];
}

export const CategoryHeader = ({
  category,
  isExpanded,
  toggleExpanded,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
  availableParentCategories = [],
}: CategoryHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const hasPrompts = category.prompts && category.prompts.length > 0;
  
  const totalPrompts = (() => {
    let total = category.prompts.length;
    
    const countPromptsRecursively = (subcategories: Category[]) => {
      subcategories.forEach(subcat => {
        total += subcat.prompts.length;
        if (subcat.subcategories && subcat.subcategories.length > 0) {
          countPromptsRecursively(subcat.subcategories);
        }
      });
    };
    
    if (hasSubcategories) {
      countPromptsRecursively(category.subcategories);
    }
    
    return total;
  })();

  return (
    <div className="relative">
      <Card className="p-2 mb-2 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0" onClick={toggleExpanded}>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
          />
          <FolderOpen className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{category.name}</span>
            <span className="text-xs text-gray-500">
              {totalPrompts} {totalPrompts === 1 ? 'prompt' : 'prompts'}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setShowAddDialog(true)}
              className="cursor-pointer"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Adicionar subcategoria
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowEditDialog(true)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar categoria
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="cursor-pointer text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir categoria
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria 
              "{category.name}" e removerá seus dados do servidor.
              {hasSubcategories && " Esta ação também excluirá todas as subcategorias e prompts relacionados."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onDeleteCategory(category.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para adicionar subcategoria */}
      {showAddDialog && (
        <AddCategory
          onClose={() => setShowAddDialog(false)}
          onAddCategory={async (name) => {
            const success = await onAddSubcategory(name, category.id);
            if (success) setShowAddDialog(false);
            return success;
          }}
          title={`Adicionar subcategoria em "${category.name}"`}
        />
      )}

      {/* Dialog para editar categoria */}
      {showEditDialog && (
        <EditCategory
          category={category}
          availableParentCategories={availableParentCategories}
          onClose={() => setShowEditDialog(false)}
          onEditCategory={async (id, newName, newParentId) => {
            try {
              const success = await onEditCategory(id, newName, newParentId);
              if (success) setShowEditDialog(false);
              return success;
            } catch (error) {
              console.error("Erro ao editar categoria:", error);
              return false;
            }
          }}
        />
      )}
    </div>
  );
};
