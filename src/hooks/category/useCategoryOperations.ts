import { useCallback, useState } from "react";
import { toast } from "sonner";
import { wouldCreateCycle } from "@/utils/categoryTreeUtils";
import type { Category } from "@/types/prompt";

interface UseCategoryOperationsProps {
  originalAddCategory: (name: string, parentId?: string) => Promise<boolean>;
  originalEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  originalDeleteCategory: (id: string) => Promise<boolean>;
  loadCategories: () => Promise<void>;
  forceReload: () => void;
  categories: Category[];
  updateCategoryCache?: (categoryId: string, updates: Partial<Category>) => void;
}

export const useCategoryOperations = ({
  originalAddCategory,
  originalEditCategory,
  originalDeleteCategory,
  loadCategories,
  forceReload,
  categories,
  updateCategoryCache
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

  /**
   * Editar categoria existente com validações melhoradas
   */
  const editCategory = useCallback(async (id: string, newName: string, newParentId?: string) => {
    // Validações preliminares
    if (!newName.trim()) {
      toast.error("O nome da categoria não pode estar vazio");
      return false;
    }
    
    // Verificar se a edição criaria um ciclo na hierarquia
    if (newParentId && newParentId !== "root") {
      const wouldCreateCycleResult = wouldCreateCycle(categories, id, newParentId);
      if (wouldCreateCycleResult) {
        toast.error("Esta edição criaria um ciclo na hierarquia de categorias");
        return false;
      }
    }
    
    if (operationInProgress) {
      toast.error("Operação em andamento, aguarde");
      return false;
    }

    try {
      setOperationInProgress(true);
      console.log("🏗️ Iniciando edição de categoria:", { id, newName, newParentId });
      
      // Preparar o parentId corretamente (null se for "root")
      const processedParentId = newParentId === "root" ? undefined : newParentId;
      
      // Atualizar o cache diretamente para nome da categoria
      if (updateCategoryCache) {
        console.log("🔄 Atualizando cache diretamente para categoria:", id);
        updateCategoryCache(id, { name: newName });
      }
      
      // Chamar a função original de edição
      const result = await originalEditCategory(id, newName, processedParentId);
      
      if (result) {
        console.log("✅ Categoria editada com sucesso!");
        // Não forçar reload completo para permitir que a atualização otimista funcione
        // Somente forçar reload se houver mudança de parentId, pois isso afeta a estrutura
        const isStructuralChange = newParentId !== undefined && newParentId !== "root";
        if (isStructuralChange) {
          console.log("🔄 Mudança de estrutura detectada - forçando reload");
          forceReload();
        }
      } else {
        toast.error("Não foi possível atualizar a categoria");
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("❌ Erro ao editar categoria:", error);
      toast.error(`Erro ao editar categoria: ${errorMessage}`);
      return false;
    } finally {
      setOperationInProgress(false);
    }
  }, [operationInProgress, originalEditCategory, categories, forceReload, updateCategoryCache]);

  const deleteCategory = useCallback(async (id: string) => {
    if (operationInProgress) {
      toast.error("Operação em andamento, aguarde");
      return false;
    }

    try {
      setOperationInProgress(true);
      toast.loading("Excluindo categoria...");
      
      const result = await originalDeleteCategory(id);
      
      if (result) {
        forceReload();
        toast.success("Categoria excluída com sucesso!");
      } else {
        toast.error("Não foi possível excluir a categoria");
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("❌ Erro ao excluir categoria:", error);
      toast.error(`Erro ao excluir categoria: ${errorMessage}`);
      return false;
    } finally {
      setOperationInProgress(false);
    }
  }, [operationInProgress, originalDeleteCategory, forceReload]);

  return {
    addCategory,
    editCategory,
    deleteCategory,
    operationInProgress
  };
};
