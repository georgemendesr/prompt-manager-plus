<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { fetchAllDataOptimized, buildOptimizedCategoryTree } from '@/services/optimized/optimizedDataService';
import type { Category } from '@/types/prompt';
import { addPromptRating } from '@/services/rating/ratingService';

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
<<<<<<< HEAD
      try {
        // Tentar carregar dados otimizados primeiro
        console.log('🔄 [OPT] Carregando dados otimizados...');
        const { categories, promptsWithComments } = await fetchAllDataOptimized();
        
        // Construir a árvore de categorias
        const categoryTree = await buildOptimizedCategoryTree(categories, promptsWithComments);
        
        // Aplicar paginação na árvore de categorias - apenas para debugging
        console.log(`✅ [OPT] Árvore construída com ${categoryTree.length} categorias principais, paginação: offset=${offset}, limit=${limit}`);
        
        return categoryTree;
      } catch (error) {
        console.log(`❌ [OPT] erro na consulta`, error);
        throw error;
      }
=======
      const { categories, promptsWithComments } = await fetchAllDataOptimized(limit, offset);
      return buildOptimizedCategoryTree(categories, promptsWithComments);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: false
  });

  // Mutation otimística para rating (sistema de estrelas)
  const ratingMutation = useMutation({
    mutationFn: async ({ promptId, rating }: { promptId: string; rating: number }) => {
      const { error } = await addPromptRating(promptId, rating);
      if (error) throw error;
      return true;
    },
    onMutate: async ({ promptId, rating }) => {
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
                    ratingAverage: rating,
                    ratingCount: (prompt.ratingCount || 0) + 1
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
      toast.error('Erro ao avaliar prompt');
    },
    onSuccess: () => {
      toast.success('Avaliação registrada!');
      // Recarregar dados para garantir sincronização
      refetch();
    }
  });

  // Função para invalidar cache quando necessário
  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  // Função otimizada para rating com estrelas
  const ratePrompt = (promptId: string, rating: number) => {
    ratingMutation.mutate({ promptId, rating });
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
    invalidateData,
    nextPage,
    previousPage,
    currentPage,
    limit,
    offset,
    isRatingPrompt: ratingMutation.isPending
  };
};
