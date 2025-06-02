
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
    // Prevent multiple operations running at once
    if (operationInProgress) {
      toast.error("Já existe uma operação em andamento. Aguarde um momento.");
      return false;
    }
    
    try {
      // Set operation flag immediately
      setOperationInProgress(true);
      
      // Generate unique operation ID with timestamp and multiple random parts for guaranteed uniqueness
      const timestamp = Date.now();
      const randomPart1 = Math.random().toString(36).substring(2, 9);
      const randomPart2 = Math.random().toString(36).substring(2, 9);
      const uniqueId = `delete-category-${id}-${timestamp}-${randomPart1}-${randomPart2}`;
      
      // Show loading toast immediately
      toast.loading("Excluindo categoria...", { id: uniqueId });
      
      // Add detailed logging throughout the process
      console.log(`🚀 [${timestamp}] INÍCIO: Exclusão da categoria ID: ${id} (Operação: ${uniqueId})`);
      
      // Call the deletion function with increased timeout and better error handling
      const success = await Promise.race([
        originalDeleteCategory(id),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout excedido na exclusão")), 45000)
        )
      ]) as boolean;
      
      // Handle success case
      if (success) {
        console.log(`✅ [${timestamp}] SUCESSO: Categoria excluída (ID: ${id}, Operação: ${uniqueId})`);
        console.log(`🔄 [${timestamp}] Recarregando dados após exclusão bem-sucedida...`);
        
        // Force reload categories data with a small delay to ensure DB consistency
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadCategories();
        
        // Show success message
        toast.success("Categoria excluída com sucesso!", { id: uniqueId });
        return true;
      } else {
        // Handle failure case
        console.error(`❌ [${timestamp}] FALHA: Não foi possível excluir categoria (ID: ${id}, Operação: ${uniqueId})`);
        toast.error("Não foi possível excluir a categoria. Tente novamente.", { id: uniqueId });
        return false;
      }
    } catch (error) {
      // Handle error case with detailed logging
      const errorTimestamp = Date.now();
      const errorId = `error-${errorTimestamp}-${Math.random().toString(36).substring(2, 9)}`;
      
      console.error(`❌ [${errorTimestamp}] ERRO CRÍTICO (${errorId}):`, error);
      console.error(`Detalhes do erro (${errorId}):`, JSON.stringify(error, null, 2));
      
      // Force reload even on error to check current state
      try {
        await loadCategories();
      } catch (reloadError) {
        console.error(`❌ Erro ao recarregar dados após falha na exclusão:`, reloadError);
      }
      
      toast.error("Erro ao excluir categoria. Dados recarregados para verificar estado atual.", { id: errorId });
      return false;
    } finally {
      // Always reset operation state
      console.log(`🏁 Finalizando operação de exclusão para categoria ID: ${id}`);
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
