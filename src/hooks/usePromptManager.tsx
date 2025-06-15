
import { useQueryClient } from '@tanstack/react-query';
import { useOptimizedData } from './useOptimizedData';

interface PromptManager {
  categories: any[];
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
  const queryClient = useQueryClient();

  const {
    categories,
    loading,
    error,
    invalidateData: invalidateOptimizedData,
    refetch: optimizedRefetch,
    nextPage,
    previousPage,
    currentPage
  } = useOptimizedData();

  const loadCategories = async () => {
    console.log("🔄 Invalidando e recarregando categorias...");
    
    invalidateOptimizedData(); 

    await queryClient.refetchQueries({ queryKey: ['optimized-data'] });
    
    console.log("✅ Recarregamento de categorias finalizado.");
  };

  // Placeholder implementations for other methods
  const addCategory = async (name: string, parentId?: string): Promise<boolean> => {
    console.log('addCategory:', name, parentId);
    return true;
  };

  const editCategory = async (id: string, newName: string, newParentId?: string): Promise<boolean> => {
    console.log('editCategory:', id, newName, newParentId);
    return true;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    console.log('deleteCategory:', id);
    return true;
  };

  const ratePrompt = async (promptId: string, increment: boolean): Promise<void> => {
    console.log('ratePrompt:', promptId, increment);
  };

  const addComment = async (promptId: string, comment: string): Promise<void> => {
    console.log('addComment:', promptId, comment);
  };

  const movePrompt = async (promptId: string, targetCategoryId: string): Promise<void> => {
    console.log('movePrompt:', promptId, targetCategoryId);
  };

  const bulkImportPrompts = async (prompts: { text: string; tags: string[] }[], categoryName: string): Promise<void> => {
    console.log('bulkImportPrompts:', prompts, categoryName);
  };

  const deleteSelectedPrompts = async (categoryName: string): Promise<void> => {
    console.log('deleteSelectedPrompts:', categoryName);
  };

  const togglePromptSelection = (promptId: string, selected: boolean): void => {
    console.log('togglePromptSelection:', promptId, selected);
  };

  const toggleSelectAll = (categoryName: string, selected: boolean): void => {
    console.log('toggleSelectAll:', categoryName, selected);
  };

  const exportPrompts = (): void => {
    console.log('exportPrompts');
  };

  return {
    categories,
    loading,
    loadError: error,
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
    exportPrompts,
    nextPage,
    previousPage,
    currentPage
  };
};
