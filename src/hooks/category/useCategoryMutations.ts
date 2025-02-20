
import { Category } from "@/types/prompt";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; 
import { addCategoryToDb, updateCategoryInDb, deleteCategoryFromDb } from "@/services/categoryService";
import { buildCategoryTree, updateTreeWithPrompts, removeCategoryFromTree } from "@/utils/categoryTreeUtils";

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
      
      const parentId = newParentId === "root" ? null : newParentId;
      const { error } = await updateCategoryInDb(id, newName, parentId);

      if (error) throw error;

      const { data: updatedCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const categoryTree = buildCategoryTree(updatedCategories);
      const updatedTree = updateTreeWithPrompts(categoryTree, categories);
      setCategories(updatedTree);
      
      toast.success('Categoria atualizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      toast.error('Erro ao editar categoria');
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Função auxiliar para verificar recursivamente se há prompts
      const hasPromptsInCategory = (category: Category): boolean => {
        if (category.prompts.length > 0) return true;
        return category.subcategories?.some(hasPromptsInCategory) || false;
      };

      // Encontra a categoria a ser deletada
      const findCategory = (categories: Category[], targetId: string): Category | null => {
        for (const category of categories) {
          if (category.id === targetId) return category;
          if (category.subcategories) {
            const found = findCategory(category.subcategories, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const categoryToDelete = findCategory(categories, id);
      if (!categoryToDelete) {
        toast.error('Categoria não encontrada');
        return false;
      }

      if (hasPromptsInCategory(categoryToDelete)) {
        toast.error('Não é possível deletar uma categoria que contém prompts');
        return false;
      }

      console.log('Deletando categoria:', id);
      const { error } = await deleteCategoryFromDb(id);

      if (error) {
        console.error('Erro ao deletar categoria no banco:', error);
        throw error;
      }

      // Atualiza o estado local
      setCategories(prev => removeCategoryFromTree(prev, id));
      
      console.log('Categoria deletada com sucesso');
      toast.success('Categoria removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast.error('Erro ao deletar categoria');
      return false;
    }
  };

  return {
    addCategory,
    editCategory,
    deleteCategory
  };
};
