import { useState } from "react";
import { useCategories } from "./useCategories";
import { usePrompts } from "./usePrompts";
import { useBulkActions } from "./useBulkActions";
import { useSelection } from "./useSelection";
import { useCategoryOperations } from "./category/useCategoryOperations";
import { useCategoryLoader } from "./category/useCategoryLoader";
import type { Category } from "@/types/prompt";

export interface PromptManager {
  categories: Category[];
  loading: boolean;
  loadError: string | null;
  loadCategories: () => Promise<void>;
  addCategory: (name: string, parentId?: string) => Promise<boolean>;
  editCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  ratePrompt: (promptId: string, increment: boolean) => Promise<void>;
  addComment: (promptId: string, comment: string) => Promise<void>;
  movePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  bulkImportPrompts: (prompts: string[], categoryName: string) => Promise<void>;
  deleteSelectedPrompts: (categoryName: string) => Promise<void>;
  togglePromptSelection: (promptId: string, selected: boolean) => void;
  toggleSelectAll: (categoryName: string, selected: boolean) => void;
}

export const usePromptManager = (): PromptManager => {
  const {
    categories,
    setCategories,
    loading,
    loadCategories: originalLoadCategories,
    addCategory: originalAddCategory,
    editCategory: originalEditCategory,
    deleteCategory: originalDeleteCategory
  } = useCategories();
  
  // Use category loader with retry logic
  const { loadError, loadCategories } = useCategoryLoader(originalLoadCategories);
  
  // Use category operations with retry
  const {
    addCategory,
    editCategory,
    deleteCategory
  } = useCategoryOperations({
    originalAddCategory,
    originalEditCategory,
    originalDeleteCategory,
    loadCategories
  });

  // Existing hooks
  const {
    ratePrompt,
    addComment,
    movePrompt
  } = usePrompts(categories, setCategories);

  const {
    bulkImportPrompts,
    deleteSelectedPrompts
  } = useBulkActions(categories, setCategories);

  const {
    togglePromptSelection,
    toggleSelectAll
  } = useSelection(categories, setCategories);

  return {
    categories,
    loading,
    loadError,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory,
    ratePrompt,
    addComment,
    movePrompt,
    bulkImportPrompts,
    deleteSelectedPrompts,
    togglePromptSelection,
    toggleSelectAll
  };
};
