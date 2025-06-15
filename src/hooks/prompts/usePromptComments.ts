
import { Category } from "@/types/prompt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePromptComments = (
  categories: Category[],
  setCategories: (categories: Category[]) => void
) => {
  const addComment = async (promptId: string, comment: string) => {
    try {
      // Se for uma alteração de cor, atualizar também na tabela de prompts
      if (comment.startsWith('[color:')) {
        const backgroundColor = comment.replace('[color:', '').replace(']', '');
        const { error: promptError } = await supabase
          .from('prompts')
          .update({ background_color: backgroundColor })
          .eq('id', promptId);

        if (promptError) throw promptError;
      }

      if (comment.startsWith('#')) {
        const { data: promptData, error: fetchError } = await supabase
          .from('prompts')
          .select('tags')
          .eq('id', promptId)
          .single();
        if (fetchError) throw fetchError;
        const newTag = comment.replace('#', '').trim();
        const { error: tagError } = await supabase
          .from('prompts')
          .update({ tags: [...(promptData?.tags || []), newTag] })
          .eq('id', promptId);
        if (tagError) throw tagError;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([{ prompt_id: promptId, text: comment }])
        .select()
        .single();

      if (error) throw error;

      setCategories(
        categories.map((category) => ({
          ...category,
          prompts: category.prompts.map((prompt) => {
            if (prompt.id === promptId) {
              if (comment.startsWith('[color:')) {
                return {
                  ...prompt,
                  comments: [...prompt.comments, comment],
                  backgroundColor: comment.replace('[color:', '').replace(']', '')
                };
              }
              return {
                ...prompt,
                comments: [...prompt.comments, comment],
                tags: comment.startsWith('#')
                  ? [...(prompt.tags || []), comment.replace('#', '').trim()]
                  : prompt.tags,
              };
            }
            return prompt;
          }),
        }))
      );

      toast.success('Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  return { addComment };
};
