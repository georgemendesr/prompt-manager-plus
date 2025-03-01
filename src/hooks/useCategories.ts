
import { useState, useCallback, useEffect } from "react";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";
import { fetchCategories, fetchPrompts, fetchComments } from "@/services/categoryService";
import { buildCategoryTree } from "@/utils/categoryTreeUtils";
import { useCategoryMutations } from "./category/useCategoryMutations";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { addCategory, editCategory, deleteCategory } = useCategoryMutations(categories, setCategories);

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
        return;
      }

      if (promptsResult.error || commentsResult.error) {
        console.error('Erro ao carregar dados:', promptsResult.error || commentsResult.error);
        setLoadError((promptsResult.error || commentsResult.error)?.message || 'Erro ao carregar dados');
        if (!initialized) {
          toast.error('Erro ao carregar dados');
        }
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
      
      // Reset retry count on successful load
      setRetryCount(0);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setLoadError(error?.message || 'Erro de conexão com o banco de dados');
      
      // Only show toast on first error
      if (!loadError) {
        toast.error('Erro ao conectar com o banco de dados');
      }
    } finally {
      setLoading(false);
    }
  }, [initialized, loadError]);

  // Auto-retry mechanism
  useEffect(() => {
    if (loadError && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Tentativa ${retryCount + 1} de recarregar categorias...`);
        setRetryCount(prev => prev + 1);
        loadCategories();
      }, 3000 * (retryCount + 1)); // Backoff exponential
      
      return () => clearTimeout(timer);
    }
  }, [loadError, retryCount, loadCategories]);

  return {
    categories,
    setCategories,
    loading,
    loadError,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory
  };
};
