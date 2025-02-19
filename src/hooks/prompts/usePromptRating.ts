
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

      // Agora o rating será 0 ou 1 (não marcado/marcado)
      const newRating = increment ? 1 : 0;

      const { error } = await supabase
        .from('prompts')
        .update({ 
          rating: newRating,
          background_color: prompt.backgroundColor // Salvando a cor de fundo
        })
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
            // Ordenar: marcados primeiro, depois por data de criação
            .sort((a, b) => {
              if (a.rating !== b.rating) return b.rating - a.rating;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }),
        }))
      );
    } catch (error) {
      console.error('Erro ao atualizar marcação:', error);
      toast.error('Erro ao atualizar marcação');
    }
  };

  return { ratePrompt };
};
