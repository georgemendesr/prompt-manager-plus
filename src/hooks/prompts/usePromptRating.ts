
import { Category } from "@/types/prompt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePromptRating = (
  categories: Category[],
  setCategories: (categories: Category[]) => void
) => {
  const findPromptInCategories = (promptId: string, categories: Category[]): { prompt: any, category: Category } | null => {
    for (const category of categories) {
      const prompt = category.prompts.find(p => p.id === promptId);
      if (prompt) {
        return { prompt, category };
      }
      
      // Procura em subcategorias recursivamente
      if (category.subcategories) {
        const result = findPromptInCategories(promptId, category.subcategories);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  const ratePrompt = async (promptId: string, increment: boolean) => {
    try {
      console.log('Procurando prompt:', promptId);
      console.log('Categories:', categories);

      const result = findPromptInCategories(promptId, categories);

      if (!result) {
        console.error('Prompt não encontrado:', promptId);
        toast.error('Erro: Prompt não encontrado');
        return;
      }

      const { prompt, category } = result;
      console.log('Prompt encontrado:', prompt);
      console.log('Na categoria:', category.name);

      // Calcula a nova pontuação baseado no increment (true = +1, false = -1)
      const changeAmount = increment ? 1 : -1;
      const newRating = (prompt.rating || 0) + changeAmount;

      console.log('Atualizando rating:', { promptId, newRating });

      // Atualiza no Supabase primeiro
      const { error } = await supabase
        .from('prompts')
        .update({ rating: newRating })
        .eq('id', promptId);

      if (error) {
        console.error('Erro ao atualizar rating:', error);
        toast.error('Erro ao atualizar pontuação');
        return;
      }

      // Se sucesso no Supabase, atualiza o estado local recursivamente
      const updateCategoriesRecursively = (cats: Category[]): Category[] => {
        return cats.map((cat) => {
          // Primeiro, atualizamos o rating do prompt
          const updatedPrompts = cat.prompts.map((p) =>
            p.id === promptId ? { ...p, rating: newRating } : p
          );

          // Ordenamos os prompts por pontuação, do maior para o menor
          const sortedPrompts = [...updatedPrompts].sort((a, b) => (b.rating || 0) - (a.rating || 0));

          return {
            ...cat,
            prompts: sortedPrompts,
            subcategories: cat.subcategories 
              ? updateCategoriesRecursively(cat.subcategories)
              : []
          };
        });
      };

      setCategories(updateCategoriesRecursively(categories));
      toast.success(increment ? 'Voto positivo registrado!' : 'Voto negativo registrado!');
    } catch (error) {
      console.error('Erro ao atualizar pontuação:', error);
      toast.error('Erro ao atualizar pontuação');
    }
  };

  return { ratePrompt };
};
