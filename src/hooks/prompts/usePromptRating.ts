
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

      // Define o novo rating como 0 ou 1 baseado no increment
      const newRating = increment ? 1 : 0;

      console.log('Atualizando rating:', { promptId, newRating });

      // Atualiza no Supabase primeiro
      const { error } = await supabase
        .from('prompts')
        .update({ rating: newRating })
        .eq('id', promptId);

      if (error) {
        console.error('Erro ao atualizar rating:', error);
        toast.error('Erro ao atualizar marcação');
        return;
      }

      // Se sucesso no Supabase, atualiza o estado local recursivamente
      const updateCategoriesRecursively = (cats: Category[]): Category[] => {
        return cats.map((cat) => ({
          ...cat,
          prompts: cat.prompts.map((p) =>
            p.id === promptId ? { ...p, rating: newRating } : p
          ),
          subcategories: cat.subcategories 
            ? updateCategoriesRecursively(cat.subcategories)
            : []
        }));
      };

      setCategories(updateCategoriesRecursively(categories));
      toast.success(increment ? 'Prompt favoritado!' : 'Prompt desfavoritado!');
    } catch (error) {
      console.error('Erro ao atualizar marcação:', error);
      toast.error('Erro ao atualizar marcação');
    }
  };

  return { ratePrompt };
};
