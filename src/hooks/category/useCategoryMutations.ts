import { Category } from "@/types/prompt";
import { toast } from "sonner";
import { 
  addCategoryToDb, 
  updateCategoryInDb, 
  fetchCategories, 
  fetchPrompts, 
  fetchComments,
  forceDeleteCategoryById
} from "@/services/categoryService";
import { buildCategoryTree } from "@/utils/categoryTreeUtils";

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

      const { data: updatedCategories, error: fetchError } = await fetchCategories();
      if (fetchError) throw fetchError;

      const categoryTree = buildCategoryTree(updatedCategories || []);
      setCategories(categoryTree);
      
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
      console.log('🔄 Iniciando processo de exclusão da categoria ID:', id);
      
      const toastId = `delete-category-${id}`;
      toast.loading("Excluindo categoria e seus dados...", { id: toastId });
      
      console.log('🔄 Chamando forceDeleteCategoryById para ID:', id);
      const result = await forceDeleteCategoryById(id);
      
      if (!result.success) {
        console.error('❌ Falha retornada por forceDeleteCategoryById:', result.error);
        toast.error("Falha ao excluir categoria. Por favor, tente novamente.", { id: toastId });
        return false;
      }

      console.log('✅ Categoria excluída com sucesso, recarregando dados...');
      
      const [categoriesResult, promptsResult, commentsResult] = await Promise.all([
        fetchCategories(),
        fetchPrompts(),
        fetchComments()
      ]);
      
      if (categoriesResult.error) {
        console.error('❌ Erro ao recarregar categorias:', categoriesResult.error);
        toast.error("Categoria excluída, mas houve um erro ao atualizar os dados.", { id: toastId });
        return true;
      }
      
      const categoryTree = buildCategoryTree(categoriesResult.data || []);
      
      const categoriesWithData = categoryTree.map(category => {
        const categoryPrompts = (promptsResult.data || [])
          .filter(prompt => prompt.category_id === category.id)
          .map(prompt => {
            const promptComments = (commentsResult.data || [])
              .filter(comment => comment.prompt_id === prompt.id)
              .map(comment => comment.text);
            
            return {
              id: prompt.id,
              text: prompt.text,
              category: category.name,
              rating: prompt.rating,
              backgroundColor: prompt.background_color,
              comments: promptComments,
              createdAt: new Date(prompt.created_at),
              selected: false
            };
          });
        
        const processSubcategories = (subcats: Category[]) => {
          return subcats.map(subcat => {
            const subcatPrompts = (promptsResult.data || [])
              .filter(prompt => prompt.category_id === subcat.id)
              .map(prompt => {
                const promptComments = (commentsResult.data || [])
                  .filter(comment => comment.prompt_id === prompt.id)
                  .map(comment => comment.text);
                
                return {
                  id: prompt.id,
                  text: prompt.text,
                  category: subcat.name,
                  rating: prompt.rating,
                  backgroundColor: prompt.background_color,
                  comments: promptComments,
                  createdAt: new Date(prompt.created_at),
                  selected: false
                };
              });
            
            return {
              ...subcat,
              prompts: subcatPrompts,
              subcategories: subcat.subcategories ? processSubcategories(subcat.subcategories) : []
            };
          });
        };
        
        return {
          ...category,
          prompts: categoryPrompts,
          subcategories: category.subcategories ? processSubcategories(category.subcategories) : []
        };
      });
      
      setCategories(categoriesWithData);
      toast.success('Categoria removida com sucesso!', { id: toastId });
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria. Tente novamente.');
      return false;
    }
  };

  return {
    addCategory,
    editCategory,
    deleteCategory
  };
};
