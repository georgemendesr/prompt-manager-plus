<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  fetchAllDataOptimized, 
  buildOptimizedCategoryTree, 
  updatePromptRatingOptimistic, 
  addCommentOptimistic,
  migratePromptIds 
} from '@/services/optimized/optimizedDataService';
import type { Category, Prompt } from '@/types/prompt';

// Interface para DatabasePrompt definida localmente
interface DatabasePrompt {
  id: string;
  text: string;
  category_id: string;
  rating: number;
  background_color?: string;
  tags?: string[];
  created_at: string;
  rating_average?: number;
  rating_count?: number;
  copy_count?: number;
  simple_id?: string;
  translated_text?: string | undefined; // Totalmente opcional
}

const QUERY_KEY = ['optimized-data'];

// Função para aplicar sobreposições do localStorage às categorias (mesma do useCategories)
const applyLocalStorageOverrides = (categories: Category[]): Category[] => {
  try {
    console.log('Aplicando sobreposições do localStorage (otimizado)...');
    
    // Função recursiva para aplicar sobreposições
    const applyOverrides = (cats: Category[]): Category[] => {
      return cats.map(category => {
        // Verificar se há uma sobreposição para esta categoria
        const overrideKey = `category_override_${category.id}`;
        const overrideJSON = localStorage.getItem(overrideKey);
        
        if (overrideJSON) {
          try {
            const override = JSON.parse(overrideJSON);
            console.log(`Aplicando sobreposição para categoria ${category.id}:`, override);
            
            // Criar uma nova categoria com os valores sobrepostos
            return {
              ...category,
              name: override.name || category.name,
              parentId: override.parentId !== undefined ? override.parentId : category.parentId,
              // Aplicar recursivamente às subcategorias
              subcategories: category.subcategories ? applyOverrides(category.subcategories) : []
            };
          } catch (parseError) {
            console.error(`Erro ao processar sobreposição para ${category.id}:`, parseError);
          }
        }
        
        // Se não há sobreposição ou houve erro, apenas processar subcategorias
        return {
          ...category,
          subcategories: category.subcategories ? applyOverrides(category.subcategories) : []
        };
      });
    };
    
    return applyOverrides(categories);
  } catch (error) {
    console.error('Erro ao aplicar sobreposições do localStorage:', error);
    return categories; // Retornar categorias originais em caso de erro
  }
};

// Mapeamento de dados do Supabase para o formato de Prompt
const mapDatabasePromptToPrompt = (dbPrompt: DatabasePrompt, commentData: any[]): Prompt => {
  // Extrair comentários ou usar array vazio
  const comments = commentData && Array.isArray(commentData) 
    ? commentData.map(c => c.text) 
    : [];
    
  // Extrair tags ou usar array vazio
  const tags = dbPrompt.tags && Array.isArray(dbPrompt.tags) 
    ? dbPrompt.tags 
    : [];
  
  return {
    id: dbPrompt.id,
    text: dbPrompt.text,
    category: "", // Será preenchido depois
    rating: dbPrompt.rating || 0,
    comments: comments,
    tags: tags,
    createdAt: new Date(dbPrompt.created_at),
    backgroundColor: dbPrompt.background_color || undefined,
    ratingAverage: dbPrompt.rating_average || 0,
    ratingCount: dbPrompt.rating_count || 0,
    copyCount: dbPrompt.copy_count || 0,
    uniqueId: dbPrompt.simple_id || "",
    // Removendo temporariamente o campo translatedText até que a coluna exista no banco
  };
};

// Lógica para converter categorias aninhadas
const processCategories = (
  dbCategories: any[], 
  dbPrompts: any[], 
  dbPromptComments: any[]
): Category[] => {
  // Criar um mapa para associar comentários a prompts
  const commentsByPromptId: Record<string, any[]> = {};
  dbPromptComments.forEach(comment => {
    if (!commentsByPromptId[comment.prompt_id]) {
      commentsByPromptId[comment.prompt_id] = [];
    }
    commentsByPromptId[comment.prompt_id].push(comment);
  });
  
  // Criar um mapa de prompts por categoria
  const promptsByCategoryId: Record<string, any[]> = {};
  dbPrompts.forEach(prompt => {
    if (!promptsByCategoryId[prompt.category_id]) {
      promptsByCategoryId[prompt.category_id] = [];
    }
    promptsByCategoryId[prompt.category_id].push(prompt);
  });
  
  // Função para processar uma categoria e suas subcategorias
  const processCategory = (category: any): Category => {
    // Obter os prompts desta categoria
    const categoryPrompts = promptsByCategoryId[category.id] || [];
    
    // Mapear prompts para o formato esperado
    const mappedPrompts = categoryPrompts.map(dbPrompt => {
      const comments = commentsByPromptId[dbPrompt.id] || [];
      return mapDatabasePromptToPrompt(dbPrompt, comments);
    });
    
    // Processar subcategorias, se houver
    const subcategories = dbCategories
      .filter(cat => cat.parent_id === category.id)
      .map(processCategory);
    
    return {
      id: category.id,
      name: category.name,
      prompts: mappedPrompts.map(p => ({ ...p, category: category.name })),
      subcategories
    };
  };
  
  // Processar apenas categorias de nível superior (sem parent_id)
  return dbCategories
    .filter(cat => !cat.parent_id)
    .map(processCategory);
};

export const useOptimizedData = (
  limit: number = 10, 
  offset: number = 0
) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Para compatibilidade com o código existente
  const [tries, setTries] = useState(0);
  const [useOptimizedMode, setUseOptimizedMode] = useState(true);
  
  const {
    data: fetchedCategories = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await fetchAllDataOptimized();
        
        if (response) {
          const { categories: dbCategories, promptsWithComments } = response;
          
          // Criar um array vazio de comentários como fallback
          const dbComments: any[] = [];
          
          // Extrair comentários de cada prompt, se existirem
          promptsWithComments.forEach(prompt => {
            if (prompt.comments && Array.isArray(prompt.comments)) {
              prompt.comments.forEach(comment => {
                dbComments.push({
                  ...comment,
                  prompt_id: prompt.id
                });
              });
            }
          });
          
          // Usar a função processCategories para transformar os dados
          return processCategories(dbCategories, promptsWithComments, dbComments);
        }
        
        return [];
      } catch (err) {
        console.error('Error loading optimized data:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Verificar se precisamos mudar para fallback
  useEffect(() => {
    if (tries >= 3 && fetchedCategories.length === 0) {
      if (useOptimizedMode) {
        console.warn('⚠️ [OPT] fallback ativado – dados otimizados vazios após 3 tentativas');
        setUseOptimizedMode(false);
      }
    }
  }, [tries, fetchedCategories.length, useOptimizedMode]);
  
  // Retornar ao modo otimizado quando os dados forem carregados com sucesso
  useEffect(() => {
    if (!useOptimizedMode && fetchedCategories.length > 0) {
      console.info('✅ [OPT] voltando para modo otimizado - dados carregados com sucesso');
      setUseOptimizedMode(true);
      setTries(0);
    }
  }, [useOptimizedMode, fetchedCategories.length]);
  
  // Aplicar sobreposições do localStorage
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    if (fetchedCategories.length > 0) {
      const overriddenCategories = applyLocalStorageOverrides(fetchedCategories);
      // Comparar se há diferenças reais antes de atualizar o estado
      const isEqual = JSON.stringify(categories) === JSON.stringify(overriddenCategories);
      if (!isEqual) {
        setCategories(overriddenCategories);
      }
    } else if (categories.length > 0) {
      // Só limpar se já tiver algo
      setCategories([]);
    }
  }, [fetchedCategories]);

=======


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

  // Query principal com fallback mais robusto
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
    staleTime: 2 * 60 * 1000, // 2 minutos - reduzido
    gcTime: 5 * 60 * 1000, // 5 minutos - reduzido
    retry: (failureCount, error) => {
      // Retry menos agressivo
      return failureCount < 1;
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
  // Mutation otimística para rating
  const ratingMutation = useMutation({
    mutationFn: ({ promptId, increment }: { promptId: string; increment: boolean }) =>
      updatePromptRatingOptimistic(promptId, increment),
    onMutate: async ({ promptId, increment }) => {
      // Cancel outgoing refetches
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<Category[]>(QUERY_KEY);
=======
      await queryClient.cancelQueries({ queryKey: currentQueryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<Category[]>(currentQueryKey);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

      // Optimistically update
      if (previousData) {
        const updatePromptInCategory = (categories: Category[]): Category[] => {
          return categories.map(category => ({
            ...category,
            prompts: category.prompts.map(prompt =>
              prompt.id === promptId
<<<<<<< HEAD
                ? { 
                    ...prompt, 
                    // Incrementar rating (para sistemas antigos) e também ratingAverage/ratingCount
                    rating: Math.max(0, prompt.rating + (increment ? 1 : -1)),
                    ratingAverage: prompt.ratingAverage || 0,
                    ratingCount: (prompt.ratingCount || 0) + 1
                  }
=======
                ? { ...prompt, rating: Math.max(0, prompt.rating + (increment ? 1 : -1)) }
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
                : prompt
            ),
            subcategories: category.subcategories ? updatePromptInCategory(category.subcategories) : []
          }));
        };

<<<<<<< HEAD
        queryClient.setQueryData(QUERY_KEY, updatePromptInCategory(previousData));
=======
        queryClient.setQueryData(currentQueryKey, updatePromptInCategory(previousData));
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
<<<<<<< HEAD
        queryClient.setQueryData(QUERY_KEY, context.previousData);
=======
        queryClient.setQueryData(currentQueryKey, context.previousData);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      }
      toast.error('Erro ao avaliar prompt');
    },
    onSuccess: () => {
      toast.success('Prompt avaliado!');
<<<<<<< HEAD
      // Recarregar após avaliação bem-sucedida para atualizar os dados
      setTimeout(() => {
        refetch();
      }, 1000);
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    }
  });

  // Mutation otimística para comentários
  const commentMutation = useMutation({
    mutationFn: ({ promptId, comment }: { promptId: string; comment: string }) =>
      addCommentOptimistic(promptId, comment),
    onMutate: async ({ promptId, comment }) => {
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousData = queryClient.getQueryData<Category[]>(QUERY_KEY);
=======
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      const previousData = queryClient.getQueryData<Category[]>(currentQueryKey);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

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

<<<<<<< HEAD
        queryClient.setQueryData(QUERY_KEY, updatePromptInCategory(previousData));
=======
        queryClient.setQueryData(currentQueryKey, updatePromptInCategory(previousData));
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
<<<<<<< HEAD
        queryClient.setQueryData(QUERY_KEY, context.previousData);
=======
        queryClient.setQueryData(currentQueryKey, context.previousData);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      }
      toast.error('Erro ao adicionar comentário');
    },
    onSuccess: () => {
      toast.success('Comentário adicionado!');
    }
  });

<<<<<<< HEAD
  // Função para atualizar uma categoria diretamente no cache
  const updateCategoryInCache = (categoryId: string, updates: Partial<Category>) => {
    // Obter dados atuais do cache
    const currentData = queryClient.getQueryData<Category[]>(QUERY_KEY);
    
    if (!currentData) {
      console.warn('Não foi possível atualizar o cache - dados não encontrados');
      return;
    }
    
    // Função recursiva para atualizar uma categoria em qualquer nível da árvore
    const updateCategoryRecursively = (categories: Category[]): Category[] => {
      return categories.map(category => {
        // Se for a categoria que estamos procurando
        if (category.id === categoryId) {
          // Aplicar atualizações, mantendo subcategorias e prompts
          return {
            ...category,
            ...updates,
            // Garantir que subcategorias e prompts não sejam sobrescritos
            subcategories: category.subcategories,
            prompts: category.prompts
          };
        }
        
        // Se tiver subcategorias, procurar recursivamente
        if (category.subcategories?.length) {
          return {
            ...category,
            subcategories: updateCategoryRecursively(category.subcategories)
          };
        }
        
        // Sem alterações para esta categoria
        return category;
      });
    };
    
    // Atualizar o cache com a nova árvore
    const updatedData = updateCategoryRecursively(currentData);
    queryClient.setQueryData(QUERY_KEY, updatedData);
    
    console.log(`✅ Cache atualizado para categoria ${categoryId}:`, updates);
  };

=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
    setCurrentPage(prev => prev + 1);
  };

  const previousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return {
    categories,
    loading,
=======
    setOffset(current => current + limit);
  };

  const previousPage = () => {
    setOffset(current => Math.max(current - limit, 0));
  };

  // Corrigir o cálculo da página atual para começar em 1
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    categories,
    loading: isLoading,
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    error: error?.message || null,
    refetch,
    ratePrompt,
    addComment,
    invalidateData,
<<<<<<< HEAD
    updateCategoryInCache,  // Nova função exposta
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
