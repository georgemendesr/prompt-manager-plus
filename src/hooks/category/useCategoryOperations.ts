
import { useCallback, useState } from "react";
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
  const [operationInProgress, setOperationInProgress] = useState(false);

  const addCategory = useCallback(async (name: string, parentId?: string) => {
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
      toast.error("Erro ao adicionar categoria");
      return false;
    } finally {
      setOperationInProgress(false);
    }
  }, [operationInProgress, originalAddCategory]);

  const editCategory = useCallback(async (id: string, newName: string, newParentId?: string) => {
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
      toast.error("Erro ao editar categoria");
      return false;
    } finally {
      setOperationInProgress(false);
    }
  }, [operationInProgress, originalEditCategory]);

  const deleteCategory = useCallback(async (id: string) => {
    if (operationInProgress) {
      toast.error("Operação em andamento. Aguarde um momento.");
      return false;
    }
    
    try {
      setOperationInProgress(true);
      
      // Create a truly unique ID for each delete operation using timestamp and random value
      const uniqueId = `delete-category-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      toast.loading("Excluindo categoria...", { id: uniqueId });
      console.log(`🚀 Iniciando exclusão da categoria ID: ${id} com operação ${uniqueId}`);
      
      const success = await originalDeleteCategory(id);
      
      if (success) {
        console.log(`✅ Categoria excluída com sucesso, recarregando dados para operação ${uniqueId}`);
        await loadCategories();
        toast.success("Categoria excluída com sucesso!", { id: uniqueId });
        return true;
      } else {
        console.error(`❌ Falha ao excluir categoria com ID: ${id} na operação ${uniqueId}`);
        toast.error("Falha ao excluir categoria. Tente novamente.", { id: uniqueId });
        return false;
      }
    } catch (error) {
      const errorId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.error(`❌ Erro crítico ao deletar categoria (${errorId}):`, error);
      toast.error("Erro ao excluir categoria. Atualize a página e tente novamente.", { id: errorId });
      return false;
    } finally {
      setOperationInProgress(false);
    }
  }, [operationInProgress, originalDeleteCategory, loadCategories]);

  return {
    addCategory,
    editCategory,
    deleteCategory,
    operationInProgress
  };
};
