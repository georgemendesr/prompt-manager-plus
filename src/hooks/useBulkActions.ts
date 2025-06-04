import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const useBulkActions = (categories: Category[], setCategories: (categories: Category[]) => void) => {
  const findCategoryById = (categories: Category[], categoryId: string): Category | undefined => {
    for (const category of categories) {
      if (category.id === categoryId) return category;
      if (category.subcategories) {
        const found = findCategoryById(category.subcategories, categoryId);
        if (found) return found;
      }
    }
    return undefined;
  };

  const bulkImportPrompts = async (
    prompts: { text: string; tags: string[] }[],
    categoryId: string
  ) => {
    try {
      const category = findCategoryById(categories, categoryId);
      if (!category) return;

      const newPrompts = prompts.map(p => ({
        text: p.text,
        tags: p.tags,
        category_id: categoryId,
        rating: 0,
      }));

      const { data, error } = await supabase
        .from('prompts')
        .insert(newPrompts)
        .select();

      if (error) throw error;

      const updateCategoriesRecursively = (cats: Category[]): Category[] => {
        return cats.map(c => {
          if (c.id === categoryId) {
            return {
              ...c,
              prompts: [
                ...c.prompts,
                ...data.map((p) => ({
                  id: p.id,
                  text: p.text,
                  category: c.name,
                  rating: 0,
                  tags: p.tags || [],
                  comments: [],
                  createdAt: new Date(p.created_at),
                  selected: false,
                })),
              ],
            };
          }
          if (c.subcategories?.length) {
            return {
              ...c,
              subcategories: updateCategoriesRecursively(c.subcategories)
            };
          }
          return c;
        });
      };

      setCategories(updateCategoriesRecursively(categories));
      toast.success('Prompts importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar prompts:', error);
      toast.error('Erro ao importar prompts');
    }
  };

  const deleteSelectedPrompts = async (categoryId: string) => {
    try {
      console.log('Tentando excluir prompts da categoria:', categoryId);
      
      const category = findCategoryById(categories, categoryId);
      if (!category) {
        console.error('Categoria não encontrada:', categoryId);
        return;
      }

      const selectedPromptIds = category.prompts
        .filter(p => p.selected)
        .map(p => p.id);

      if (selectedPromptIds.length === 0) {
        console.log('Nenhum prompt selecionado para exclusão');
        return;
      }

      console.log('Prompts selecionados para exclusão:', selectedPromptIds);

      const { error } = await supabase
        .from('prompts')
        .delete()
        .in('id', selectedPromptIds);

      if (error) {
        console.error('Erro ao excluir no Supabase:', error);
        throw error;
      }

      const updateCategoriesRecursively = (cats: Category[]): Category[] => {
        return cats.map(c => {
          if (c.id === categoryId) {
            return {
              ...c,
              prompts: c.prompts.filter((prompt) => !prompt.selected),
            };
          }
          if (c.subcategories?.length) {
            return {
              ...c,
              subcategories: updateCategoriesRecursively(c.subcategories)
            };
          }
          return c;
        });
      };

      setCategories(updateCategoriesRecursively(categories));
      toast.success('Prompts excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir prompts:', error);
      toast.error('Erro ao excluir prompts');
    }
  };

  return {
    bulkImportPrompts,
    deleteSelectedPrompts
  };
};