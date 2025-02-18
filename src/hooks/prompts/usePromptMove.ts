
import { Category } from "@/types/prompt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePromptMove = (
  categories: Category[],
  setCategories: (categories: Category[]) => void
) => {
  const movePrompt = async (promptId: string, targetCategoryId: string) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ category_id: targetCategoryId })
        .eq('id', promptId);

      if (error) throw error;

      const targetCategory = categories.find(c => c.id === targetCategoryId);
      if (!targetCategory) return;

      setCategories(
        categories.map((category) => {
          if (category.id === targetCategoryId) {
            const prompt = categories
              .flatMap(c => c.prompts)
              .find(p => p.id === promptId);
            if (!prompt) return category;
            return {
              ...category,
              prompts: [...category.prompts, { ...prompt, category: category.name }]
            };
          }
          return {
            ...category,
            prompts: category.prompts.filter(p => p.id !== promptId)
          };
        })
      );

      toast.success('Prompt movido com sucesso!');
    } catch (error) {
      console.error('Erro ao mover prompt:', error);
      toast.error('Erro ao mover prompt');
    }
  };

  return { movePrompt };
};
