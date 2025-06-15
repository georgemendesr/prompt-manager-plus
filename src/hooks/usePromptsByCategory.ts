import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Category, Prompt } from '@/types/prompt';

interface UsePromptsByCategoryResult {
  prompts: Prompt[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  selectedPrompts: string[];
  togglePromptSelection: (id: string, selected: boolean) => void;
  toggleSelectAll: (categoryName: string, selected: boolean) => void;
  deleteSelectedPrompts: (categoryName: string) => Promise<void>;
  movePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  updatePrompt: (promptId: string, updates: Partial<Prompt>) => void;
}

export function usePromptsByCategory(
  categoryId: string | null,
  searchTerm = '',
  sortOption = 'rating'
): UsePromptsByCategoryResult {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);

  const fetchPrompts = useCallback(async () => {
    if (!categoryId) {
      setPrompts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('prompts').select('*');

      // Filtrar por categoria
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Filtrar por termo de busca se fornecido
      if (searchTerm) {
        query = query.ilike('text', `%${searchTerm}%`);
      }

      // Ordenar resultados
      switch (sortOption) {
        case 'rating':
          query = query.order('rating_average', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('copy_count', { ascending: false });
          break;
        default:
          query = query.order('rating_average', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Converter dados para o formato correto
      const formattedPrompts: Prompt[] = (data || []).map(prompt => ({
        id: prompt.id,
        uniqueId: prompt.unique_id || prompt.id,
        text: prompt.text,
        categoryId: prompt.category_id,
        createdAt: new Date(prompt.created_at),
        updatedAt: prompt.updated_at ? new Date(prompt.updated_at) : undefined,
        comments: prompt.comments || [],
        tags: prompt.tags || [],
        ratingAverage: prompt.rating_average || 0,
        ratingCount: prompt.rating_count || 0,
        copyCount: prompt.copy_count || 0,
      }));

      setPrompts(formattedPrompts);
    } catch (err) {
      console.error('Erro ao buscar prompts:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar prompts'));
    } finally {
      setLoading(false);
    }
  }, [categoryId, searchTerm, sortOption]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Lógica para seleção de prompts
  const togglePromptSelection = useCallback((id: string, selected: boolean) => {
    setSelectedPrompts(prev => {
      if (selected) {
        return [...prev, id];
      } else {
        return prev.filter(promptId => promptId !== id);
      }
    });
  }, []);

  const toggleSelectAll = useCallback((categoryName: string, selected: boolean) => {
    if (selected) {
      // Selecionar todos os prompts da categoria atual
      const promptIdsInCategory = prompts.map(prompt => prompt.id);
      setSelectedPrompts(promptIdsInCategory);
    } else {
      // Desmarcar todos
      setSelectedPrompts([]);
    }
  }, [prompts]);

  const deleteSelectedPrompts = useCallback(async (categoryName: string) => {
    if (selectedPrompts.length === 0) return;

    try {
      setLoading(true);
      
      // Excluir prompts selecionados
      const { error: deleteError } = await supabase
        .from('prompts')
        .delete()
        .in('id', selectedPrompts);

      if (deleteError) {
        throw deleteError;
      }

      // Recarregar dados
      await fetchPrompts();
      
      // Limpar seleção
      setSelectedPrompts([]);
    } catch (err) {
      console.error('Erro ao excluir prompts:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao excluir prompts'));
    } finally {
      setLoading(false);
    }
  }, [selectedPrompts, fetchPrompts]);

  const movePrompt = useCallback(async (promptId: string, targetCategoryId: string) => {
    try {
      setLoading(true);
      
      // Atualizar categoria do prompt
      const { error: updateError } = await supabase
        .from('prompts')
        .update({ category_id: targetCategoryId })
        .eq('id', promptId);

      if (updateError) {
        throw updateError;
      }

      // Recarregar dados
      await fetchPrompts();
    } catch (err) {
      console.error('Erro ao mover prompt:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao mover prompt'));
    } finally {
      setLoading(false);
    }
  }, [fetchPrompts]);

  // Função para atualizar um prompt no estado local
  const updatePrompt = useCallback((promptId: string, updates: Partial<Prompt>) => {
    setPrompts(currentPrompts => 
      currentPrompts.map(prompt => 
        prompt.id === promptId 
          ? { ...prompt, ...updates } 
          : prompt
      )
    );
    console.log(`[PROMPT] Prompt ${promptId} atualizado no estado local:`, updates);
  }, []);

  return {
    prompts,
    loading,
    error,
    refetch: fetchPrompts,
    selectedPrompts,
    togglePromptSelection,
    toggleSelectAll,
    deleteSelectedPrompts,
    movePrompt,
    updatePrompt,
  };
} 