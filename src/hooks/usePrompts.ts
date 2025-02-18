
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const usePrompts = (categories: Category[], setCategories: (categories: Category[]) => void) => {
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
              return { ...prompt, comments: [...prompt.comments, comment] };
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

  return {
    ratePrompt,
    addComment,
    movePrompt
  };
};
