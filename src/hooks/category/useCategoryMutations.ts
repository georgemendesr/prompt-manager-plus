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
      
      // Use ID único para o toast para não haver duplicação
      toast.loading("Excluindo categoria e seus dados...", { id: "delete-category-toast" });
      
      console.log('🔄 Chamando forceDeleteCategoryById para ID:', id);
      const result = await forceDeleteCategoryById(id);
      
      if (!result.success) {
        console.error('❌ Falha retornada por forceDeleteCategoryById:', result.error);
        throw result.error;
      }

      console.log('✅ Categoria excluída com sucesso, recarregando dados...');
      
      try {
        const [categoriesResult, promptsResult, commentsResult] = await Promise.all([
          fetchCategories(),
          fetchPrompts(),
          fetchComments()
        ]);

        if (categoriesResult.error) {
          console.error('❌ Erro ao recarregar categorias:', categoriesResult.error);
          throw categoriesResult.error;
        }
        
        if (promptsResult.error) {
          console.error('❌ Erro ao recarregar prompts:', promptsResult.error);
          throw promptsResult.error;
        }
        
        if (commentsResult.error) {
          console.error('❌ Erro ao recarregar comentários:', commentsResult.error);
          throw commentsResult.error;
        }

        const categoryTree = buildCategoryTree(categoriesResult.data || []);
        console.log('✅ Árvore de categorias reconstruída com sucesso');

        const addPromptsToCategories = (categories: Category[]) => {
          return categories.map(category => {
            const categoryPrompts = (promptsResult.data || [])
              .filter(prompt => prompt.category_id === category.id)
              .map(prompt => ({
                id: prompt.id,
                text: prompt.text,
                category: category.name,
                rating: prompt.rating,
                backgroundColor: prompt.background_color,
                comments: (commentsResult.data || [])
                  .filter(comment => comment.prompt_id === prompt.id)
                  .map(comment => comment.text),
                createdAt: new Date(prompt.created_at),
                selected: false
              }));

            return {
              ...category,
              prompts: categoryPrompts,
              subcategories: category.subcategories ? addPromptsToCategories(category.subcategories) : []
            };
          });
        };

        const categoriesWithPrompts = addPromptsToCategories(categoryTree);
        setCategories(categoriesWithPrompts);
        
        console.log('✅ Dados recarregados com sucesso após exclusão');
        toast.dismiss("delete-category-toast");
        toast.success('Categoria removida com sucesso!');
        return true;
      } catch (reloadError) {
        console.error('❌ Erro ao recarregar dados após exclusão:', reloadError);
        toast.dismiss("delete-category-toast");
        toast.error('Categoria foi excluída, mas houve um erro ao atualizar a interface. Por favor, atualize a página.');
        return true; // Retorna true porque a categoria foi excluída, apenas a atualização da UI falhou
      }
    } catch (error) {
      console.error('❌ Erro ao excluir categoria:', error);
      toast.dismiss("delete-category-toast");
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
