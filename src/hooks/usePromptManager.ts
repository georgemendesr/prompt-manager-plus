
import { useEffect, useState, useCallback } from "react";
import { useCategories } from "./useCategories";
import { usePrompts } from "./usePrompts";
import { useBulkActions } from "./useBulkActions";
import { useSelection } from "./useSelection";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

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

// Maximum number of retries for loading data
const MAX_RETRIES = 5;

export const usePromptManager = (): PromptManager => {
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState<NodeJS.Timeout | null>(null);

  const {
    categories,
    setCategories,
    loading,
    loadError,
    loadCategories: originalLoadCategories,
    addCategory,
    editCategory,
    deleteCategory
  } = useCategories();

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

  // Enhanced load categories function with retry logic
  const loadCategoriesWithRetry = useCallback(async () => {
    try {
      await originalLoadCategories();
      // Reset retry count on success
      setRetryCount(0);
      
      // Clear any existing retry timer
      if (retryTimer) {
        clearTimeout(retryTimer);
        setRetryTimer(null);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: wait longer between each retry
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        
        console.log(`Retrying in ${delay/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Set up retry timer with exponential backoff
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadCategoriesWithRetry();
        }, delay);
        
        setRetryTimer(timer);
      } else {
        toast.error("Falha ao conectar ao banco de dados após várias tentativas.");
      }
    }
  }, [originalLoadCategories, retryCount, retryTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [retryTimer]);

  // Iniciamos o carregamento automático dos dados
  useEffect(() => {
    loadCategoriesWithRetry();
  }, [loadCategoriesWithRetry]);

  return {
    categories,
    loading,
    loadError,
    loadCategories: loadCategoriesWithRetry,
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
