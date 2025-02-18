
import { Category } from "@/types/prompt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePromptRating = (
  categories: Category[],
  setCategories: (categories: Category[]) => void
) => {
  const ratePrompt = async (promptId: string, increment: boolean) => {
    try {
      const prompt = categories
        .flatMap(c => c.prompts)
        .find(p => p.id === promptId);

      if (!prompt) return;

      const newRating = prompt.rating + (increment ? 1 : -1);

      const { error } = await supabase
        .from('prompts')
        .update({ rating: newRating })
        .eq('id', promptId);

      if (error) throw error;

      setCategories(
        categories.map((category) => ({
          ...category,
          prompts: category.prompts
            .map((p) =>
              p.id === promptId
                ? { ...p, rating: newRating }
                : p
            )
            .sort((a, b) => b.rating - a.rating),
        }))
      );
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      toast.error('Erro ao atualizar avaliação');
    }
  };

  return { ratePrompt };
};
