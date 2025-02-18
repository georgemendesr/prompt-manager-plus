
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const usePromptManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, created_at');

      if (categoriesError) throw categoriesError;

      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('id, text, category_id, rating, created_at');

      if (promptsError) throw promptsError;

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, prompt_id, text, created_at');

      if (commentsError) throw commentsError;

      const formattedCategories = categoriesData.map(category => ({
        id: category.id,
        name: category.name,
        prompts: promptsData
          ?.filter(prompt => prompt.category_id === category.id)
          .map(prompt => ({
            id: prompt.id,
            text: prompt.text,
            category: category.name,
            rating: prompt.rating,
            comments: commentsData
              ?.filter(comment => comment.prompt_id === prompt.id)
              .map(comment => comment.text) || [],
            createdAt: new Date(prompt.created_at),
            selected: false
          })) || []
      }));

      setCategories(formattedCategories);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, {
        id: data.id,
        name: data.name,
        prompts: []
      }]);

      toast.success('Categoria adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
      return false;
    }
  };

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

      setCategories(prev =>
        prev.map((category) => ({
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
      const { data, error } = await supabase
        .from('comments')
        .insert([{ prompt_id: promptId, text: comment }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev =>
        prev.map((category) => ({
          ...category,
          prompts: category.prompts.map((prompt) =>
            prompt.id === promptId
              ? { ...prompt, comments: [...prompt.comments, comment] }
              : prompt
          ),
        }))
      );

      toast.success('Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

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

      setCategories(prev =>
        prev.map((c) =>
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

      setCategories(prev =>
        prev.map((c) =>
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

  const togglePromptSelection = (promptId: string, selected: boolean) => {
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        prompts: category.prompts.map((prompt) =>
          prompt.id === promptId ? { ...prompt, selected } : prompt
        ),
      }))
    );
  };

  const toggleSelectAll = (categoryName: string, selected: boolean) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              prompts: category.prompts.map((prompt) => ({
                ...prompt,
                selected,
              })),
            }
          : category
      )
    );
  };

  return {
    categories,
    loading,
    loadCategories,
    addCategory,
    ratePrompt,
    addComment,
    bulkImportPrompts,
    deleteSelectedPrompts,
    togglePromptSelection,
    toggleSelectAll
  };
};
