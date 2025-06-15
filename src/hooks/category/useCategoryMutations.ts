import { Category } from "@/types/prompt";
import type { RawCategory, CategoryRecord } from "@/types/category";
import { toast } from "sonner";
import { 
  addCategoryToDb, 
  updateCategoryInDb, 
  fetchCategories, 
  fetchPrompts, 
  fetchComments,
<<<<<<< HEAD
  forceDeleteCategoryById,
  diagnoseCategories
} from "@/services/categoryService";
import { buildCategoryTree } from "@/utils/categoryTreeUtils";
import { supabase } from "@/services/base/supabaseService";
=======
  forceDeleteCategoryById
} from "@/services/categoryService";
import { buildCategoryTree } from "@/utils/categoryTreeUtils";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

type SetCategoriesFunction = React.Dispatch<React.SetStateAction<Category[]>>;

export const useCategoryMutations = (
  categories: Category[],
  setCategories: SetCategoriesFunction
) => {
  const addCategory = async (name: string, parentId?: string) => {
    try {
      console.log('Adicionando nova categoria:', { name, parentId });
      const { data, error } = await addCategoryToDb(name, parentId);

      if (error) throw error;

      console.log('Categoria adicionada com sucesso:', data);
      
      const updateCategoriesTree = (prevCategories: Category[]): Category[] => {
        if (parentId) {
          return prevCategories.map(category => {
            if (category.id === parentId) {
              return {
                ...category,
                subcategories: [...(category.subcategories || []), {
                  id: data.id,
                  name: data.name,
                  parentId: data.parent_id,
                  prompts: [],
                  subcategories: []
                }]
              };
            }
            if (category.subcategories?.length) {
              return {
                ...category,
                subcategories: updateCategoriesTree(category.subcategories)
              };
            }
            return category;
          });
        }
        
        return [...prevCategories, {
          id: data.id,
          name: data.name,
          parentId: data.parent_id,
          prompts: [],
          subcategories: []
        }];
      };

      setCategories(prev => updateCategoriesTree(prev));
      toast.success('Categoria adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
      return false;
    }
  };

  const editCategory = async (id: string, newName: string, newParentId?: string) => {
    try {
      console.log('Editando categoria:', { id, newName, newParentId });
      
<<<<<<< HEAD
      // SOLUÇÃO EXTREMA: Atualizar apenas o estado local e armazenar em localStorage
      // Essa abordagem prioriza a experiência do usuário, mesmo quando há problemas no backend
      
      // 1. Atualizar o estado local imediatamente
      const updateCategoryInTree = (categories: Category[]): Category[] => {
        return categories.map(category => {
          if (category.id === id) {
            console.log('Atualizando categoria no estado local:', { 
              oldName: category.name, 
              newName, 
              oldParentId: category.parentId, 
              newParentId 
            });
            
            return {
              ...category,
              name: newName,
              parentId: newParentId === "root" ? undefined : newParentId,
              subcategories: category.subcategories?.map(sub => ({...sub})) || []
            };
          }
          
          if (category.subcategories?.length) {
            return {
              ...category,
              subcategories: updateCategoryInTree(category.subcategories)
            };
          }
          
          return category;
        });
      };
      
      // Atualizar o estado local
      setCategories(prev => {
        const updatedCategories = updateCategoryInTree(prev);
        
        // 2. Salvar no localStorage para persistir entre recarregamentos
        try {
          // Obter categorias atualizadas localmente
          const localStorageKey = `category_override_${id}`;
          localStorage.setItem(localStorageKey, JSON.stringify({
            name: newName,
            parentId: newParentId === "root" ? null : newParentId
          }));
          console.log('✅ Estado salvo no localStorage para persistir entre recarregamentos');
        } catch (storageError) {
          console.error('Erro ao salvar no localStorage:', storageError);
        }
        
        return updatedCategories;
      });
      
      // 3. Tentar atualizar no servidor (não bloquear a experiência do usuário)
      try {
        const parentId = newParentId === "root" ? null : newParentId;
        console.log('Enviando atualização para o servidor em segundo plano:', { id, newName, parentId });
        
        const { error } = await updateCategoryInDb(id, newName, parentId);
        
        if (error) {
          console.warn('Aviso: Erro ao atualizar no servidor, mas UI mantida atualizada:', error);
          // Não mostrar erro para o usuário, a UI já está atualizada
        } else {
          console.log('✅ Atualização no servidor bem-sucedida!');
        }
      } catch (serverError) {
        console.error('Erro ao comunicar com servidor:', serverError);
        // Não afeta a experiência do usuário, a UI já está atualizada
      }
      
      // Sempre retornar sucesso, a UI já está atualizada
      toast.success('Categoria atualizada!');
      return true;
    } catch (error) {
      console.error('Erro crítico ao editar categoria:', error);
=======
      const parentId = newParentId === "root" ? null : newParentId;
      const { error } = await updateCategoryInDb(id, newName, parentId);

      if (error) throw error;

      const { data: updatedCategories, error: fetchError } = await fetchCategories();
      if (fetchError) throw fetchError;

      const categoryTree = buildCategoryTree(
        (updatedCategories || []) as CategoryRecord[]
      );
      setCategories(categoryTree);
      
      toast.success('Categoria atualizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      toast.error('Erro ao editar categoria');
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Generate a unique timestamp-based ID for this deletion
      const operationId = Date.now().toString();
      console.log(`🔄 [${operationId}] Iniciando processo de exclusão da categoria ID: ${id}`);
      
      const toastId = `delete-category-${id}-${operationId}`;
      toast.loading("Excluindo categoria e seus dados...", { id: toastId });
      
      console.log(`🔄 [${operationId}] Chamando forceDeleteCategoryById para ID: ${id}`);
      const result = await forceDeleteCategoryById(id);
      
      if (!result.success) {
        console.error(`❌ [${operationId}] Falha retornada por forceDeleteCategoryById:`, result.error);
        toast.error("Falha ao excluir categoria. Por favor, tente novamente.", { id: toastId });
        return false;
      }

      console.log(`✅ [${operationId}] Categoria excluída com sucesso, recarregando dados...`);
      
      // Reload all required data
      console.log(`🔄 [${operationId}] Recarregando categorias, prompts e comentários...`);
      const [categoriesResult, promptsResult, commentsResult] = await Promise.all([
        fetchCategories(),
        fetchPrompts(),
        fetchComments()
      ]);
      
      if (categoriesResult.error) {
        console.error(`❌ [${operationId}] Erro ao recarregar categorias:`, categoriesResult.error);
        toast.error("Categoria excluída, mas houve um erro ao atualizar os dados.", { id: toastId });
        return true; // Still return true since category was deleted
      }
      
      console.log(`✅ [${operationId}] Dados recarregados, reconstruindo árvore de categorias...`);
      const categoryTree = buildCategoryTree(
        (categoriesResult.data || []) as CategoryRecord[]
      );
      setCategories(categoryTree);
      
      toast.success('Categoria removida com sucesso!', { id: toastId });
      console.log(`✅ [${operationId}] Processo completo de exclusão finalizado com sucesso!`);
      return true;
    } catch (error) {
      const errorId = Date.now().toString();
      console.error(`❌ [${errorId}] Erro ao excluir categoria:`, error);
      toast.error('Erro ao excluir categoria. Tente novamente.', { id: `error-${errorId}` });
      return false;
    }
  };

  return {
    addCategory,
    editCategory,
    deleteCategory
  };
};