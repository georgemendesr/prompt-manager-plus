
import { useState } from "react";
import { useCategories } from "./useCategories";
import { usePrompts } from "./usePrompts";
import { useBulkActions } from "./useBulkActions";
import { useSelection } from "./useSelection";
import { useCategoryOperations } from "./category/useCategoryOperations";
import { useCategoryLoader } from "./category/useCategoryLoader";
import type { Category, Prompt } from "@/types/prompt";

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
  exportPrompts: () => void;
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

  // New export functionality
  const exportPrompts = () => {
    try {
      // Collect all prompts from all categories
      const allPrompts: Array<{
        text: string;
        category: string;
        rating: number;
        comments: string[];
        createdAt: string;
      }> = [];
      
      const collectPromptsRecursive = (cats: Category[], parentPath: string = "") => {
        cats.forEach(category => {
          const categoryPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
          
          // Add prompts from this category
          category.prompts.forEach(prompt => {
            allPrompts.push({
              text: prompt.text,
              category: categoryPath,
              rating: prompt.rating,
              comments: prompt.comments,
              createdAt: prompt.createdAt.toISOString(),
            });
          });
          
          // Recursively process subcategories
          if (category.subcategories && category.subcategories.length > 0) {
            collectPromptsRecursive(category.subcategories, categoryPath);
          }
        });
      };
      
      collectPromptsRecursive(categories);
      
      // Create JSON data
      const jsonData = JSON.stringify(allPrompts, null, 2);
      
      // Create and download file
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename with date
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      link.download = `prompts-export-${date}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar prompts:', error);
    }
  };

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
    toggleSelectAll,
    exportPrompts
  };
};
