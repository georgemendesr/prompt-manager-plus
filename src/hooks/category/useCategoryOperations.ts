
import { useCallback } from "react";
import { useRetry } from "../utils/useRetry";
import { toast } from "sonner";

interface UseCategoryOperationsProps {
  originalAddCategory: (name: string, parentId?: string) => Promise<boolean>;
  originalEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  originalDeleteCategory: (id: string) => Promise<boolean>;
  loadCategories: () => Promise<void>;
}

export const useCategoryOperations = ({
  originalAddCategory,
  originalEditCategory,
  originalDeleteCategory,
  loadCategories
}: UseCategoryOperationsProps) => {
  const { executeWithRetry, operationInProgress } = useRetry();

  const addCategory = useCallback(async (name: string, parentId?: string) => {
    return executeWithRetry(
      async () => {
        const result = await originalAddCategory(name, parentId);
        return result;
      },
      "adicionar categoria"
    ) || false;
  }, [executeWithRetry, originalAddCategory]);

  const editCategory = useCallback(async (id: string, newName: string, newParentId?: string) => {
    return executeWithRetry(
      async () => {
        const result = await originalEditCategory(id, newName, newParentId);
        return result;
      },
      "editar categoria"
    ) || false;
  }, [executeWithRetry, originalEditCategory]);

  const deleteCategory = useCallback(async (id: string) => {
    if (operationInProgress) {
      toast.error("Operação em andamento. Aguarde um momento.");
      return false;
    }
    
    try {
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
      await loadCategories();
      
      return true;
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      toast.error("Falha ao deletar categoria. Tente novamente após atualizar a página.");
      return false;
    } finally {
      toast.dismiss();
    }
  }, [operationInProgress, originalDeleteCategory, loadCategories]);

  return {
    addCategory,
    editCategory,
    deleteCategory,
    operationInProgress
  };
};
