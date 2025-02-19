
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

      // Define o novo rating como 0 ou 1
      const newRating = increment ? 1 : 0;

      const { error } = await supabase
        .from('prompts')
        .update({ 
          rating: newRating,
          background_color: prompt.backgroundColor 
        })
        .eq('id', promptId);

      if (error) {
        console.error('Erro ao atualizar rating:', error);
        throw error;
      }

      // Atualiza o estado local
      setCategories(
        categories.map((category) => ({
          ...category,
          prompts: category.prompts.map((p) =>
            p.id === promptId ? { ...p, rating: newRating } : p
          ),
        }))
      );

      toast.success(increment ? 'Prompt favoritado!' : 'Prompt desfavoritado!');
    } catch (error) {
      console.error('Erro ao atualizar marcação:', error);
      toast.error('Erro ao atualizar marcação');
    }
  };

  return { ratePrompt };
};
