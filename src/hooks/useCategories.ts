
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
        supabase.from('prompts').select('id, text, category_id, rating, background_color, created_at'),
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

  const editCategory = async (id: string, newName: string, newParentId?: string) => {
    try {
      console.log('Editando categoria:', { id, newName, newParentId });
      
      // Se newParentId for "root", definimos como null para categoria raiz
      const parentId = newParentId === "root" ? null : newParentId;

      const { error } = await supabase
        .from('categories')
        .update({ 
          name: newName.trim(),
          parent_id: parentId
        })
        .eq('id', id);

      if (error) throw error;

      // Recarrega as categorias para garantir que a estrutura esteja correta
      const { data: updatedCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const categoryTree = buildCategoryTree(updatedCategories);
      
      // Mantém os prompts existentes ao atualizar a árvore
      const updateTreeWithPrompts = (newTree: Category[], oldCategories: Category[]): Category[] => {
        return newTree.map(category => {
          const oldCategory = oldCategories.find(c => c.id === category.id);
          return {
            ...category,
            prompts: oldCategory?.prompts || [],
            subcategories: category.subcategories ? 
              updateTreeWithPrompts(category.subcategories, oldCategories.flatMap(c => c.subcategories || [])) : 
              []
          };
        });
      };

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
      // Verificar se a categoria tem prompts
      const hasPrompts = categories.some(category => {
        const checkPrompts = (cat: Category): boolean => {
          if (cat.id === id && cat.prompts.length > 0) return true;
          return cat.subcategories?.some(checkPrompts) || false;
        };
        return checkPrompts(category);
      });

      if (hasPrompts) {
        toast.error('Não é possível deletar uma categoria que contém prompts');
        return false;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const removeCategoryFromTree = (categories: Category[]): Category[] => {
        return categories.filter(category => {
          if (category.id === id) return false;
          if (category.subcategories?.length) {
            category.subcategories = removeCategoryFromTree(category.subcategories);
          }
          return true;
        });
      };

      setCategories(prev => removeCategoryFromTree(prev));
      toast.success('Categoria removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast.error('Erro ao deletar categoria');
      return false;
    }
  };

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
