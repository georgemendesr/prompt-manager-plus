
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const buildCategoryTree = (categories: any[], parentId: string | null = null): Category[] => {
    return categories
      .filter(category => category.parent_id === parentId)
      .map(category => ({
        id: category.id,
        name: category.name,
        parentId: category.parent_id,
        prompts: [],
        subcategories: buildCategoryTree(categories, category.id)
      }));
  };

  const loadCategories = useCallback(async () => {
    if (initialized) return;
    
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      const [categoriesResult, promptsResult, commentsResult] = await Promise.all([
        supabase.from('categories').select('id, name, parent_id, created_at'),
        supabase.from('prompts').select('id, text, category_id, rating, created_at'),
        supabase.from('comments').select('id, prompt_id, text, created_at')
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

      // Construir árvore de categorias
      const categoryTree = buildCategoryTree(categoriesData);

      // Função recursiva para adicionar prompts às categorias
      const addPromptsToCategories = (categories: Category[]) => {
        return categories.map(category => ({
          ...category,
          prompts: promptsData
            .filter(prompt => prompt.category_id === category.id)
            .map(prompt => ({
              id: prompt.id,
              text: prompt.text,
              category: category.name,
              rating: prompt.rating,
              comments: commentsData
                .filter(comment => comment.prompt_id === prompt.id)
                .map(comment => comment.text) || [],
              createdAt: new Date(prompt.created_at),
              selected: false
            })),
          subcategories: addPromptsToCategories(category.subcategories || [])
        }));
      };

      const categoriesWithPrompts = addPromptsToCategories(categoryTree);
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

  const addCategory = async (name: string, parentId?: string) => {
    try {
      console.log('Adicionando nova categoria:', { name, parentId });
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          name: name.trim(),
          parent_id: parentId
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Categoria adicionada com sucesso:', data);
      
      // Atualizar estado de forma recursiva
      const updateCategoriesTree = (categories: Category[]): Category[] => {
        if (parentId) {
          return categories.map(category => {
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
        
        return [...categories, {
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

  return {
    categories,
    setCategories,
    loading,
    loadCategories,
    addCategory
  };
};
