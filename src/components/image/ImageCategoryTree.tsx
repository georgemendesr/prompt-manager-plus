
import { useState } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageDisplay } from "./ImageDisplay";
import { AdminGuard } from "../AdminGuard";
import { AddCategory } from "../AddCategory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ImageCategory } from "@/types/imageCategory";
import type { ImagePrompt } from "@/types/imagePrompt";

interface ImageCategoryTreeProps {
  category: ImageCategory;
  categories: ImageCategory[];
  imagePrompts: ImagePrompt[];
  searchTerm: string;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  level?: number;
}

export const ImageCategoryTree = ({
  category,
  categories,
  imagePrompts,
  searchTerm,
  onEditCategory,
  onDeleteCategory,
  level = 0
}: ImageCategoryTreeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const categoryPrompts = imagePrompts.filter(prompt => 
    prompt.categoryId === category.id &&
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCategory = async () => {
    const success = await onDeleteCategory(category.id);
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  const handleEditCategory = async (newName: string, newParentId?: string) => {
    return await onEditCategory(category.id, newName, newParentId);
  };

  const renderSubcategories = () => {
    if (!category.subcategories || category.subcategories.length === 0) {
      return null;
    }

    return category.subcategories.map((subcategory) => (
      <div key={subcategory.id} className="ml-4 border-l border-gray-200 pl-4">
        <ImageCategoryTree
          category={subcategory}
          categories={categories}
          imagePrompts={imagePrompts}
          searchTerm={searchTerm}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          level={level + 1}
        />
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer flex-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <h3 className="font-medium text-lg">{category.name}</h3>
            <span className="text-sm text-gray-500">
              ({categoryPrompts.length} {categoryPrompts.length === 1 ? 'prompt' : 'prompts'})
            </span>
          </div>

          <AdminGuard>
            <div className="flex items-center gap-2">
              <AddCategory
                onEdit={handleEditCategory}
                categories={categories.map(cat => ({
                  id: cat.id,
                  name: cat.name,
                  parentId: cat.parentId,
                  prompts: [],
                  subcategories: []
                }))}
                mode="edit"
                initialName={category.name}
                initialParentId={category.parentId}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </AdminGuard>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4">
              {categoryPrompts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "Nenhum prompt encontrado" : "Nenhum prompt de imagem nesta categoria"}
                </div>
              ) : (
                categoryPrompts.map((prompt) => (
                  <ImageDisplay
                    key={prompt.id}
                    prompt={prompt}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </Card>

      {isExpanded && renderSubcategories()}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{category.name}"? 
              Esta ação não pode ser desfeita e todos os prompts desta categoria serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
