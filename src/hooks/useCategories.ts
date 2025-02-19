
import { useState, useCallback } from "react";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";
import { fetchCategories, fetchPrompts, fetchComments } from "@/services/categoryService";
import { buildCategoryTree } from "@/utils/categoryTreeUtils";
import { useCategoryMutations } from "./category/useCategoryMutations";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const { addCategory, editCategory, deleteCategory } = useCategoryMutations(categories, setCategories);

  const loadCategories = useCallback(async () => {
    if (initialized) return;
    
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      const [categoriesResult, promptsResult, commentsResult] = await Promise.all([
        fetchCategories(),
        fetchPrompts(),
        fetchComments()
      ]);

      if (categoriesResult.error) {
        console.error('Erro ao carregar categorias:', categoriesResult.error);
        toast.error('Erro ao carregar categorias');
        setCategories([]);
        return;
      }

      if (promptsResult.error || commentsResult.error) {
        console.error('Erro ao carregar dados:', promptsResult.error || commentsResult.error);
        toast.error('Erro ao carregar dados');
        setCategories([]);
        return;
      }

      const categoriesData = categoriesResult.data || [];
      const promptsData = promptsResult.data || [];
      const commentsData = commentsResult.data || [];

      console.log('Dados carregados com sucesso:', {
        categories: categoriesData.length,
        prompts: promptsData.length,
        comments: commentsData.length
      });

      const categoryTree = buildCategoryTree(categoriesData);

      const addPromptsToCategories = (categories: Category[], allPrompts: any[]) => {
        return categories.map(category => {
          const categoryPrompts = allPrompts
            .filter(prompt => prompt.category_id === category.id)
            .map(prompt => ({
              id: prompt.id,
              text: prompt.text,
              category: category.name,
              rating: prompt.rating,
              backgroundColor: prompt.background_color,
              comments: commentsData
                .filter(comment => comment.prompt_id === prompt.id)
                .map(comment => comment.text) || [],
              createdAt: new Date(prompt.created_at),
              selected: false
            }));

          return {
            ...category,
            prompts: categoryPrompts,
            subcategories: addPromptsToCategories(category.subcategories || [], allPrompts)
          };
        });
      };

      const categoriesWithPrompts = addPromptsToCategories(categoryTree, promptsData);
      setCategories(categoriesWithPrompts);
      
      if (!initialized) {
        toast.success('Dados carregados com sucesso!');
        setInitialized(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao conectar com o banco de dados');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  return {
    categories,
    setCategories,
    loading,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory
  };
};
