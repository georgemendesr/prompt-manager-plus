
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const useBulkActions = (categories: Category[], setCategories: (categories: Category[]) => void) => {
  const bulkImportPrompts = async (prompts: string[], categoryName: string) => {
    try {
      const category = categories.find(c => c.name === categoryName);
      if (!category) return;

      const newPrompts = prompts.map(text => ({
        text,
        category_id: category.id,
        rating: 0
      }));

      const { data, error } = await supabase
        .from('prompts')
        .insert(newPrompts)
        .select();

      if (error) throw error;

      setCategories(
        categories.map((c) =>
          c.name === categoryName
            ? {
                ...c,
                prompts: [
                  ...c.prompts,
                  ...data.map((p) => ({
                    id: p.id,
                    text: p.text,
                    category: categoryName,
                    rating: 0,
                    comments: [],
                    createdAt: new Date(p.created_at),
                    selected: false,
                  })),
                ],
              }
            : c
        )
      );

      toast.success('Prompts importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar prompts:', error);
      toast.error('Erro ao importar prompts');
    }
  };

  const deleteSelectedPrompts = async (categoryName: string) => {
    try {
      const category = categories.find(c => c.name === categoryName);
      if (!category) return;

      const selectedPromptIds = category.prompts
        .filter(p => p.selected)
        .map(p => p.id);

      if (selectedPromptIds.length === 0) return;

      const { error } = await supabase
        .from('prompts')
        .delete()
        .in('id', selectedPromptIds);

      if (error) throw error;

      setCategories(
        categories.map((c) =>
          c.name === categoryName
            ? {
                ...c,
                prompts: c.prompts.filter((prompt) => !prompt.selected),
              }
            : c
        )
      );

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
