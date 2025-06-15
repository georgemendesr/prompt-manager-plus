
import { useState } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryActions } from "./CategoryActions";
import { PromptCard } from "./PromptCard";
import { CategorySearch } from "./category/CategorySearch";
import { CategoryHeader } from "./category/CategoryHeader";
import { CategoryContent } from "./category/CategoryContent";
import { AdminGuard } from "./AdminGuard";
import { AddCategory } from "./AddCategory";
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

interface CategoryTreeProps {
  category: Category;
  categories: Category[];
  onRatePrompt: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onEditPrompt: (id: string, newText: string) => Promise<void>;
  onMovePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  onTogglePromptSelection: (id: string, selected: boolean) => void;
  onToggleSelectAll: (categoryName: string, selected: boolean) => void;
  onDeleteSelectedPrompts: (categoryName: string) => Promise<void>;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  level?: number;
}

export const CategoryTree = ({
  category,
  categories,
  onRatePrompt,
  onAddComment,
  onEditPrompt,
  onMovePrompt,
  onTogglePromptSelection,
  onToggleSelectAll,
  onDeleteSelectedPrompts,
  onEditCategory,
  onDeleteCategory,
  searchTerm,
  setSearchTerm,
  level = 0
}: CategoryTreeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredPrompts = category.prompts.filter(prompt =>
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasSelectedPrompts = filteredPrompts.some(p => p.selected);

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
        <CategoryTree
          category={subcategory}
          categories={categories}
          onRatePrompt={onRatePrompt}
          onAddComment={onAddComment}
          onEditPrompt={onEditPrompt}
          onMovePrompt={onMovePrompt}
          onTogglePromptSelection={onTogglePromptSelection}
          onToggleSelectAll={onToggleSelectAll}
          onDeleteSelectedPrompts={onDeleteSelectedPrompts}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          level={level + 1}
        />
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <CategoryHeader
        category={category}
        categories={categories}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        onEditCategory={handleEditCategory}
        onDeleteCategory={() => setShowDeleteDialog(true)}
        level={level}
      />

      {isExpanded && (
        <CategoryContent
          category={category}
          categories={categories}
          filteredPrompts={filteredPrompts}
          hasSelectedPrompts={hasSelectedPrompts}
          onRatePrompt={onRatePrompt}
          onAddComment={onAddComment}
          onEditPrompt={onEditPrompt}
          onMovePrompt={onMovePrompt}
          onTogglePromptSelection={onTogglePromptSelection}
          onToggleSelectAll={onToggleSelectAll}
          onDeleteSelectedPrompts={onDeleteSelectedPrompts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

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
