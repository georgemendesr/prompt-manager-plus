
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
      toast.loading("Excluindo categoria...");
      
      // Call the original delete function directly
      const success = await originalDeleteCategory(id);
      
      if (success) {
        // Force reload categories for UI consistency
        await loadCategories();
        toast.success("Categoria excluída com sucesso!");
        return true;
      } else {
        toast.error("Falha ao excluir categoria. Tente novamente.");
        return false;
      }
    } catch (error) {
      console.error("Erro crítico ao deletar categoria:", error);
      toast.error("Erro ao excluir categoria. Atualize a página e tente novamente.");
      return false;
    } finally {
      setOperationInProgress(false);
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
