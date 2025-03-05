
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
const MAX_RETRIES = 8; // Aumentado para maior resiliência

export const usePromptManager = (): PromptManager => {
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState<NodeJS.Timeout | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);

  const {
    categories,
    setCategories,
    loading,
    loadError,
    loadCategories: originalLoadCategories,
    addCategory: originalAddCategory,
    editCategory: originalEditCategory,
    deleteCategory: originalDeleteCategory
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
      setOperationInProgress(true);
      await originalLoadCategories();
      // Reset retry count on success
      setRetryCount(0);
      
      // Clear any existing retry timer
      if (retryTimer) {
        clearTimeout(retryTimer);
        setRetryTimer(null);
      }
      setOperationInProgress(false);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff: wait longer between each retry
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        
        console.log(`Tentando novamente em ${delay/1000} segundos... (Tentativa ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Set up retry timer with exponential backoff
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadCategoriesWithRetry();
        }, delay);
        
        setRetryTimer(timer);
      } else {
        toast.error("Falha ao conectar ao banco de dados após várias tentativas.");
        setOperationInProgress(false);
      }
    }
  }, [originalLoadCategories, retryCount, retryTimer]);

  // Wrap operations with retry and blocking logic
  const addCategory = async (name: string, parentId?: string) => {
    if (operationInProgress) {
      toast.error("Operação em andamento. Aguarde um momento.");
      return false;
    }
    
    try {
      setOperationInProgress(true);
      const result = await originalAddCategory(name, parentId);
      return result;
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast.error("Falha ao adicionar categoria. Tente novamente.");
      return false;
    } finally {
      setOperationInProgress(false);
    }
  };

  const editCategory = async (id: string, newName: string, newParentId?: string) => {
    if (operationInProgress) {
      toast.error("Operação em andamento. Aguarde um momento.");
      return false;
    }
    
    try {
      setOperationInProgress(true);
      const result = await originalEditCategory(id, newName, newParentId);
      return result;
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
      toast.error("Falha ao editar categoria. Tente novamente.");
      return false;
    } finally {
      setOperationInProgress(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (operationInProgress) {
      toast.error("Operação em andamento. Aguarde um momento.");
      return false;
    }
    
    try {
      setOperationInProgress(true);
      toast.loading("Excluindo categoria e seus dados...");
      
      // Attempt to delete category with multiple retries if needed
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!success && attempts < maxAttempts) {
        attempts++;
        console.log(`Tentativa ${attempts} de ${maxAttempts} para deletar categoria ${id}`);
        
        try {
          const result = await originalDeleteCategory(id);
          if (result) {
            success = true;
            console.log('Categoria deletada com sucesso');
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        } catch (deleteError) {
          console.error(`Erro na tentativa ${attempts}:`, deleteError);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      if (!success) {
        throw new Error(`Falha ao deletar categoria após ${maxAttempts} tentativas`);
      }
      
      // Força recarregamento das categorias para garantir sincronização
      await loadCategoriesWithRetry();
      
      return true;
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      toast.error("Falha ao deletar categoria. Tente novamente após atualizar a página.");
      return false;
    } finally {
      toast.dismiss();
      setOperationInProgress(false);
    }
  };

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
