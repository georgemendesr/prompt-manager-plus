
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { fetchCategories, fetchPrompts, fetchComments } from "@/services/categoryService";
import { buildCategoryTree } from "@/utils/categoryTreeUtils";
import type { Category } from "@/types/prompt";

export const useCategoryFetcher = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      console.log('Iniciando carregamento de dados...');
      
      const [categoriesResult, promptsResult, commentsResult] = await Promise.all([
        fetchCategories(),
        fetchPrompts(),
        fetchComments()
      ]);

      if (categoriesResult.error) {
        console.error('Erro ao carregar categorias:', categoriesResult.error);
        setLoadError(categoriesResult.error.message || 'Erro ao carregar categorias');
        if (!initialized) {
          toast.error('Erro ao carregar categorias');
        }
        setLoading(false);
        return null;
      }

      if (promptsResult.error || commentsResult.error) {
        console.error('Erro ao carregar dados:', promptsResult.error || commentsResult.error);
        setLoadError((promptsResult.error || commentsResult.error)?.message || 'Erro ao carregar dados');
        if (!initialized) {
          toast.error('Erro ao carregar dados');
        }
        setLoading(false);
        return null;
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
              tags: prompt.tags || [],
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
      
      if (!initialized) {
        toast.success('Dados carregados com sucesso!');
        setInitialized(true);
      }
      
      setLoading(false);
      return categoriesWithPrompts;
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setLoadError(error?.message || 'Erro de conexão com o banco de dados');
      
      // Only show toast on first error
      if (!initialized) {
        toast.error('Erro ao conectar com o banco de dados');
      }
      
      setLoading(false);
      return null;
    }
  }, [initialized]);

  return {
    loading,
    loadError,
    loadCategories
  };
};
