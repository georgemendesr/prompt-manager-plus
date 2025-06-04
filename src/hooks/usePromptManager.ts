
import { useState, useEffect } from "react";
import { useOptimizedData } from "./optimized/useOptimizedData";
import { useBulkActions } from "./useBulkActions";
import { useSelection } from "./useSelection";
import { useCategoryOperations } from "./category/useCategoryOperations";
import { useCategories } from "./useCategories";
import { usePrompts } from "./usePrompts";
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
  bulkImportPrompts: (prompts: { text: string; tags: string[] }[], categoryName: string) => Promise<void>;
  deleteSelectedPrompts: (categoryName: string) => Promise<void>;
  togglePromptSelection: (promptId: string, selected: boolean) => void;
  toggleSelectAll: (categoryName: string, selected: boolean) => void;
  exportPrompts: () => void;
  nextPage: () => void;
  previousPage: () => void;
  currentPage: number;
}

export const usePromptManager = (): PromptManager => {
  // Use optimized data hook
  const {
    categories: optimizedCategories,
    loading: optimizedLoading,
    error: optimizedError,
    refetch: optimizedRefetch,
    ratePrompt: optimizedRatePrompt,
    addComment: optimizedAddComment,
    invalidateData,
    nextPage,
    previousPage, // This should now exist in useOptimizedData
    currentPage   // This should now exist in useOptimizedData
  } = useOptimizedData();

  // Fallback to original hooks
  const {
    categories: fallbackCategories,
    setCategories,
    loading: fallbackLoading,
    loadCategories: fallbackLoadCategories,
    addCategory: fallbackAddCategory,
    editCategory: fallbackEditCategory,
    deleteCategory: fallbackDeleteCategory
  } = useCategories();

  const {
    ratePrompt: fallbackRatePrompt,
    addComment: fallbackAddComment,
    movePrompt
  } = usePrompts(fallbackCategories, setCategories);

  // Use optimized data if available, fallback otherwise
  const categories = optimizedCategories.length > 0 ? optimizedCategories : fallbackCategories;
  const loading = optimizedLoading || fallbackLoading;
  const loadError = optimizedError;

  // Existing hooks with current state
  const {
    bulkImportPrompts,
    deleteSelectedPrompts
  } = useBulkActions(categories, setCategories);

  const {
    togglePromptSelection,
    toggleSelectAll
  } = useSelection(categories, setCategories);

  // Category operations with cache invalidation
  const {
    addCategory: categoryAddCategory,
    editCategory: categoryEditCategory,
    deleteCategory: categoryDeleteCategory
  } = useCategoryOperations({
    originalAddCategory: fallbackAddCategory,
    originalEditCategory: fallbackEditCategory,
    originalDeleteCategory: fallbackDeleteCategory,
    loadCategories: () => {
      invalidateData();
      return fallbackLoadCategories();
    }
  });

  // Optimized functions with fallback
  const ratePrompt = async (promptId: string, increment: boolean) => {
    if (optimizedCategories.length > 0) {
      optimizedRatePrompt(promptId, increment);
    } else {
      await fallbackRatePrompt(promptId, increment);
    }
  };

  const addComment = async (promptId: string, comment: string) => {
    if (optimizedCategories.length > 0) {
      optimizedAddComment(promptId, comment);
    } else {
      await fallbackAddComment(promptId, comment);
    }
  };

  const loadCategories = async () => {
    if (optimizedCategories.length > 0) {
      await optimizedRefetch();
    } else {
      await fallbackLoadCategories();
    }
  };

  // Export functionality
  const exportPrompts = () => {
    try {
      const allPrompts: Array<{
        text: string;
        category: string;
        rating: number;
        comments: string[];
        tags: string[];
        createdAt: string;
      }> = [];
      
      const collectPromptsRecursive = (cats: Category[], parentPath: string = "") => {
        cats.forEach(category => {
          const categoryPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
          
          category.prompts.forEach(prompt => {
            allPrompts.push({
              text: prompt.text,
              category: categoryPath,
              rating: prompt.rating,
              comments: prompt.comments,
              tags: prompt.tags,
              createdAt: prompt.createdAt.toISOString(),
            });
          });
          
          if (category.subcategories && category.subcategories.length > 0) {
            collectPromptsRecursive(category.subcategories, categoryPath);
          }
        });
      };
      
      collectPromptsRecursive(categories);
      
      const jsonData = JSON.stringify(allPrompts, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      link.download = `prompts-export-${date}.json`;
      
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
    addCategory: categoryAddCategory,
    editCategory: categoryEditCategory,
    deleteCategory: categoryDeleteCategory,
    ratePrompt,
    addComment,
    movePrompt,
    bulkImportPrompts,
    deleteSelectedPrompts,
    togglePromptSelection,
    toggleSelectAll,
    exportPrompts,
    nextPage,
    previousPage,
    currentPage
  };
};
