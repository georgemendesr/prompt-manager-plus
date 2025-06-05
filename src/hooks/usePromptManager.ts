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
  const [useOptimized, setUseOptimized] = useState(true);

  // Try optimized data first
  const {
    categories: optimizedCategories,
    loading: optimizedLoading,
    error: optimizedError,
    refetch: optimizedRefetch,
    ratePrompt: optimizedRatePrompt,
    addComment: optimizedAddComment,
    invalidateData,
    nextPage: optimizedNextPage,
    previousPage: optimizedPreviousPage,
    currentPage: optimizedCurrentPage
  } = useOptimizedData(20, 0); // Increased limit and start from 0

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

  // Check if optimized data is working
  useEffect(() => {
    console.log('🔍 Verificando dados otimizados:', {
      optimizedCategories: optimizedCategories.length,
      optimizedError,
      optimizedLoading,
      useOptimized
    });

    // Se há erro ou não há dados após loading, use fallback
    if (optimizedError || (!optimizedLoading && optimizedCategories.length === 0)) {
      console.log('⚠️ Mudando para fallback devido a:', { optimizedError, categoriesLength: optimizedCategories.length });
      setUseOptimized(false);
      fallbackLoadCategories();
    }
  }, [optimizedCategories, optimizedError, optimizedLoading, fallbackLoadCategories]);

  // Use optimized data if available and working, fallback otherwise
  const categories = useOptimized && optimizedCategories.length > 0 ? optimizedCategories : fallbackCategories;
  const loading = useOptimized ? optimizedLoading : fallbackLoading;
  const loadError = useOptimized ? optimizedError : null;

  console.log('📊 Estado atual do PromptManager:', {
    useOptimized,
    categoriesCount: categories.length,
    loading,
    loadError,
    totalPrompts: categories.reduce((acc, cat) => acc + cat.prompts.length, 0)
  });

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
      if (useOptimized) {
        invalidateData();
        return optimizedRefetch();
      } else {
        return fallbackLoadCategories();
      }
    }
  });

  // Optimized functions with fallback
  const ratePrompt = async (promptId: string, increment: boolean) => {
    if (useOptimized && optimizedCategories.length > 0) {
      optimizedRatePrompt(promptId, increment);
    } else {
      await fallbackRatePrompt(promptId, increment);
    }
  };

  const addComment = async (promptId: string, comment: string) => {
    if (useOptimized && optimizedCategories.length > 0) {
      optimizedAddComment(promptId, comment);
    } else {
      await fallbackAddComment(promptId, comment);
    }
  };

  const loadCategories = async () => {
    if (useOptimized) {
      await optimizedRefetch();
    } else {
      await fallbackLoadCategories();
    }
  };

  // Page navigation - only use optimized if working
  const nextPage = () => {
    if (useOptimized && optimizedCategories.length > 0) {
      optimizedNextPage();
    }
  };

  const previousPage = () => {
    if (useOptimized && optimizedCategories.length > 0) {
      optimizedPreviousPage();
    }
  };

  const currentPage = useOptimized && optimizedCategories.length > 0 ? optimizedCurrentPage : 1;

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
