
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { fetchAllDataOptimized, buildOptimizedCategoryTree, updatePromptRatingOptimistic, addCommentOptimistic } from '@/services/optimized/optimizedDataService';
import type { Category } from '@/types/prompt';

const QUERY_KEY = ['optimized-data'];

export const useOptimizedData = (
  initialLimit: number = 10,
  initialOffset: number = 0
) => {
  const [limit] = useState(initialLimit);
  const [offset, setOffset] = useState(initialOffset);
  const queryClient = useQueryClient();

  const currentQueryKey = [...QUERY_KEY, limit, offset];

  // Query principal com cache
  const {
    data: categories = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: currentQueryKey,
    queryFn: async () => {
      const { categories, promptsWithComments } = await fetchAllDataOptimized(limit, offset);
      return buildOptimizedCategoryTree(categories, promptsWithComments);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (nova API)
    retry: 1, // Reduzir tentativas de retry
    retryDelay: 2000,
    refetchOnWindowFocus: false
  });

  // Mutation otimística para rating
  const ratingMutation = useMutation({
    mutationFn: ({ promptId, increment }: { promptId: string; increment: boolean }) =>
      updatePromptRatingOptimistic(promptId, increment),
    onMutate: async ({ promptId, increment }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: currentQueryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<Category[]>(currentQueryKey);

      // Optimistically update
      if (previousData) {
        const updatePromptInCategory = (categories: Category[]): Category[] => {
          return categories.map(category => ({
            ...category,
            prompts: category.prompts.map(prompt =>
              prompt.id === promptId
                ? { ...prompt, rating: prompt.rating + (increment ? 1 : -1) }
                : prompt
            ),
            subcategories: category.subcategories ? updatePromptInCategory(category.subcategories) : []
          }));
        };

        queryClient.setQueryData(currentQueryKey, updatePromptInCategory(previousData));
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error('Erro ao avaliar prompt');
    },
    onSuccess: () => {
      toast.success('Prompt avaliado!');
    }
  });

  // Mutation otimística para comentários
  const commentMutation = useMutation({
    mutationFn: ({ promptId, comment }: { promptId: string; comment: string }) =>
      addCommentOptimistic(promptId, comment),
    onMutate: async ({ promptId, comment }) => {
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      const previousData = queryClient.getQueryData<Category[]>(currentQueryKey);

      if (previousData) {
        const updatePromptInCategory = (categories: Category[]): Category[] => {
          return categories.map(category => ({
            ...category,
            prompts: category.prompts.map(prompt =>
              prompt.id === promptId
                ? {
                    ...prompt,
                    comments: [...prompt.comments, comment],
                    tags: comment.startsWith('#')
                      ? [...(prompt.tags || []), comment.replace('#', '').trim()]
                      : prompt.tags,
                  }
              : prompt
            ),
            subcategories: category.subcategories ? updatePromptInCategory(category.subcategories) : []
          }));
        };

        queryClient.setQueryData(currentQueryKey, updatePromptInCategory(previousData));
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
      toast.error('Erro ao adicionar comentário');
    },
    onSuccess: () => {
      toast.success('Comentário adicionado!');
    }
  });

  // Função para invalidar cache quando necessário
  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  // Funções otimizadas
  const ratePrompt = (promptId: string, increment: boolean) => {
    ratingMutation.mutate({ promptId, increment });
  };

  const addComment = (promptId: string, comment: string) => {
    commentMutation.mutate({ promptId, comment });
  };

  const nextPage = () => {
    setOffset(current => current + limit);
  };

  const previousPage = () => {
    setOffset(current => Math.max(current - limit, 0));
  };

  const currentPage = Math.floor(offset / limit) + 1;

  return {
    categories,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    ratePrompt,
    addComment,
    invalidateData,
    nextPage,
    previousPage,
    currentPage,
    limit,
    offset,
    // Estados das mutations
    isRatingPrompt: ratingMutation.isPending,
    isAddingComment: commentMutation.isPending
  };
};
