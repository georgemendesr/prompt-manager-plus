import { useState, useEffect } from "react";
import { useOptimizedData } from "./optimized/useOptimizedData";
import { useBulkActions } from "./useBulkActions";
import { useSelection } from "./useSelection";
import { useCategoryOperations } from "./category/useCategoryOperations";
import { useCategories } from "./useCategories";
import { usePrompts } from "./usePrompts";
import { useQueryClient } from "@tanstack/react-query";
import type { Category } from "@/types/prompt";
import { getPromptStats } from '@/services/rating/ratingService';

export interface PromptManager {
  categories: Category[];
  loading: boolean;
  loadError: string | null;
  loadCategories: () => Promise<void>;
  addCategory: (name: string, parentId?: string) => Promise<boolean>;
  editCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  ratePrompt: (promptId: string, increment: boolean) => Promise<void>;
  addComment: (promptId: string, comment: string) => Promise<void>;
  movePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  bulkImportPrompts: (prompts: { text: string; tags: string[] }[], categoryName: string) => Promise<void>;
  deleteSelectedPrompts: (categoryName: string) => Promise<void>;
  togglePromptSelection: (promptId: string, selected: boolean) => void;
  toggleSelectAll: (categoryName: string, selected: boolean) => void;
  exportPrompts: () => void;
  nextPage: () => void;
  previousPage: () => void;
  currentPage: number;
  updateCategoryCache: (categoryId: string, updates: Partial<Category>) => void;
  setUseOptimized: (value: boolean) => void;
}

export const usePromptManager = (): PromptManager => {
  // Estado para controlar o modo de dados (otimizado vs fallback)
  const [useOptimized, setUseOptimized] = useState(true);
  const [fallbackActivated, setFallbackActivated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Try optimized data first
  const {
    categories: optimizedCategories,
    loading: optimizedLoading,
    error: optimizedError,
    refetch: optimizedRefetch,
    ratePrompt: optimizedRatePrompt,
    addComment: optimizedAddComment,
    invalidateData: optimizedInvalidateData,
    nextPage: optimizedNextPage,
    previousPage: optimizedPreviousPage,
    currentPage: optimizedCurrentPage,
    updateCategoryInCache
  } = useOptimizedData(20, 0); // Increased limit and start from 0

  // Fallback to original hooks
  const {
    categories: fallbackCategories,
    setCategories,
    loading: fallbackLoading,
    loadCategories: fallbackLoadCategories,
    addCategory: fallbackAddCategory,
    editCategory: fallbackEditCategory,
    deleteCategory: fallbackDeleteCategory
  } = useCategories();

  const {
    ratePrompt: fallbackRatePrompt,
    addComment: fallbackAddComment,
    movePrompt: fallbackMovePrompt
  } = usePrompts(fallbackCategories, setCategories);

  // Track local state for UI-only changes (selections, etc.)
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render counter

  const queryClient = useQueryClient();

  // Adicionar listener global para atualizações de prompts
  useEffect(() => {
    const handlePromptsUpdated = () => {
      console.log('🔄 Evento promptsUpdated recebido no usePromptManager, atualizando dados...');
      // Recarregar dados
      if (useOptimized && !fallbackActivated) {
        optimizedInvalidateData();
        optimizedRefetch();
      } else {
        fallbackLoadCategories();
      }
    };
    
    // Registrar listener
    window.addEventListener('promptsUpdated', handlePromptsUpdated);
    
    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('promptsUpdated', handlePromptsUpdated);
    };
  }, [useOptimized, optimizedInvalidateData, optimizedRefetch, fallbackLoadCategories, fallbackActivated]);

  // Use local state if we have local changes, otherwise use optimized data
  const currentCategories = hasLocalChanges ? localCategories : (useOptimized ? optimizedCategories : fallbackCategories);

  // Função para atualizar diretamente o cache de categoria - MOVIDA PARA ANTES DE SER USADA
  const updateCategoryCache = (categoryId: string, updates: Partial<Category>) => {
    if (useOptimized && optimizedCategories.length > 0) {
      updateCategoryInCache(categoryId, updates);
    }
  };

  // Category operations with cache invalidation
  const {
    addCategory: categoryAddCategory,
    editCategory: categoryEditCategory,
    deleteCategory: categoryDeleteCategory
  } = useCategoryOperations({
    originalAddCategory: fallbackAddCategory,
    originalEditCategory: fallbackEditCategory,
    originalDeleteCategory: fallbackDeleteCategory,
    categories: currentCategories,
    updateCategoryCache,
    loadCategories: async () => {
      console.log("🔄 Forçando reload completo após operação de categoria");
      // Reset local changes and reload from server for structural changes
      setHasLocalChanges(false);
      setLocalCategories([]); // Clear local cache completely
      
      if (useOptimized) {
        optimizedInvalidateData();
        await optimizedRefetch();
        // Force update local categories with fresh data after data loads
        const syncInterval = setInterval(() => {
          if (optimizedCategories.length > 0 && !optimizedLoading) {
            console.log("🔄 Sincronizando estado local com dados otimizados");
            setLocalCategories([...optimizedCategories]); // Force new array reference
            setHasLocalChanges(false);
            clearInterval(syncInterval);
            console.log("✅ Estado local sincronizado!");
            
            // Force React re-render by updating a counter
            setForceUpdate(prev => prev + 1);
            window.dispatchEvent(new CustomEvent('categoryUpdate'));
          }
        }, 50);
        
        // Cleanup after 3 seconds
        setTimeout(() => {
          clearInterval(syncInterval);
        }, 3000);
      } else {
        await fallbackLoadCategories();
      }
      
      console.log("✅ Reload completo finalizado");
    },
    forceReload: async () => {
      // Função simplificada para forçar reload sem reiniciar a página
      console.log("🔄 Forçando reload após edição de categoria");
      setHasLocalChanges(false);
      
      if (useOptimized) {
        optimizedInvalidateData();
        await optimizedRefetch();
      } else {
        await fallbackLoadCategories();
      }
      
      // Notificar que houve uma atualização
      window.dispatchEvent(new CustomEvent('categoryUpdate'));
      console.log("✅ Reload após edição finalizado");
    }
  });

  // Update local categories when optimized data changes
  useEffect(() => {
    // Não atualizar se já estamos em fallback para evitar loops
    if (fallbackActivated) return;
    
    // Só atualizar quando temos dados otimizados e não há mudanças locais
    if (!hasLocalChanges && optimizedCategories.length > 0) {
      console.log("🔄 [OPT] Atualizando local categories com dados otimizados");
      setLocalCategories(optimizedCategories);
    }
  }, [optimizedCategories, hasLocalChanges, fallbackActivated]);

  // Force sync when optimized data changes after editing
  useEffect(() => {
    // Não sincronizar se estamos em fallback para evitar loops
    if (fallbackActivated) return;
    
    if (optimizedCategories.length > 0) {
      console.log("🔄 [OPT] Forçando sincronização após mudança de dados otimizados");
      // Copiar o array para garantir nova referência
      setLocalCategories([...optimizedCategories]);
    }
  }, [optimizedCategories, fallbackActivated]);

  // Verificar se o modo otimizado está funcionando
  useEffect(() => {
    // IMPORTANTE: Não executar este useEffect se estamos em fallback
    // Isso evita o loop infinito de logs
    if (fallbackActivated) {
      return;
    }

    const checkOptimized = () => {
      // Log com controle de frequência para evitar spam
      if (retryCount <= 3) {
        console.log('🔍 [OPT] Verificando dados otimizados:', {
          optimizedCategories: optimizedCategories.length,
          optimizedError: optimizedError ? 'Error' : 'None',
          optimizedLoading,
          useOptimized,
          retryCount
        });
      }

      // Se não há dados após certo tempo e não estamos carregando, tentar novamente ou mudar para fallback
      if (!optimizedLoading && optimizedCategories.length === 0) {
        // Incrementar contador de tentativas
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        // Log apenas a cada tentativa, não a cada renderização
        console.warn(`⚠️ [OPT] Dados vazios, tentativa ${newRetryCount}/3`);
        
        // Se tiver tentado 3 vezes sem sucesso, mudar para fallback
        if (newRetryCount >= 3) {
          console.error('❌ [OPT] fallback ativado após 3 tentativas sem dados');
          setUseOptimized(false);
          setFallbackActivated(true);
          fallbackLoadCategories().then(() => {
            console.info('✅ [OPT] fallback carregado com sucesso');
          });
          return;
        }
        
        // Tentar novamente em 1 segundo
        setTimeout(() => {
          console.log(`🔄 [OPT] Tentando novamente (${newRetryCount}/3)...`);
          optimizedRefetch();
        }, 1000);
      } else if (optimizedCategories.length > 0) {
        // Resetar contador de tentativas quando temos dados
        setRetryCount(0);
      }
    };

    // Executar a verificação apenas uma vez, não a cada renderização
    // Isso evita o loop infinito de logs
    const timeout = setTimeout(checkOptimized, 100);
    return () => clearTimeout(timeout);
  }, []);  // Esvaziando o array de dependências para executar apenas uma vez

  // Use local categories if we have local changes, otherwise use optimized data
  const categories = currentCategories;
  const loading = useOptimized ? optimizedLoading : fallbackLoading;
  const loadError = useOptimized ? optimizedError : null;

  // Log apenas uma vez ou quando o status mudar, não em cada renderização
  useEffect(() => {
    // Evitar logs excessivos usando um débounce
    const timeout = setTimeout(() => {
      // Log apenas a cada 5 segundos para evitar spam
      console.log('📊 [OPT] Estado atual:', {
        useOptimized,
        categoriesCount: categories.length,
        loading,
        loadError: loadError ? 'Error' : 'None',
        totalPrompts: categories.reduce((acc, cat) => acc + cat.prompts.length, 0),
        fallbackActivated
      });
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [useOptimized, categories.length, loading, loadError, fallbackActivated]);

  // Create a unified setter that handles local vs remote changes
  const unifiedSetCategories = (updatedCategories: Category[] | ((prev: Category[]) => Category[])) => {
    console.log("📝 UnifiedSetCategories called with:", updatedCategories);
    
    const newCategories = typeof updatedCategories === 'function' 
      ? updatedCategories(currentCategories) 
      : updatedCategories;
    
    // Always update local state immediately for UI responsiveness
    setLocalCategories(newCategories);
    setHasLocalChanges(true);
    console.log("✅ Local state updated immediately");
    
    // For fallback mode, also update the original setter
    if (!useOptimized || optimizedCategories.length === 0) {
      console.log("🔄 Using fallback setCategories");
      setCategories(updatedCategories);
    }
  };

  // Existing hooks with unified setter
  const {
    bulkImportPrompts,
    deleteSelectedPrompts
  } = useBulkActions(currentCategories, unifiedSetCategories);

  const {
    togglePromptSelection,
    toggleSelectAll
  } = useSelection(currentCategories, unifiedSetCategories);

  // Optimized functions with fallback
  const ratePrompt = async (promptId: string, increment: boolean) => {
    console.log(`[STAR] usePromptManager.ratePrompt(${promptId}, ${increment})`);
    try {
      if (useOptimized && optimizedCategories.length > 0 && !fallbackActivated) {
        await optimizedRatePrompt(promptId, increment);
      } else {
        await fallbackRatePrompt(promptId, increment);
      }
      
      // Invalidar dados para forçar recarregamento
      if (!fallbackActivated) {
        setTimeout(() => {
          console.log('[STAR] Atualizando UI após avaliação');
          // Buscar os dados atualizados do prompt
          getPromptStats(promptId).then(({ data }) => {
            if (data) {
              console.log(`[STAR] Dados atualizados: avg=${data.rating_average}, count=${data.rating_count}`);
              
              // Atualizar o estado local com os dados recebidos do servidor
              setLocalCategories(prevCategories => {
                return prevCategories.map(category => ({
                  ...category,
                  prompts: category.prompts.map(prompt => 
                    prompt.id === promptId
                      ? {
                          ...prompt,
                          ratingAverage: data.rating_average,
                          ratingCount: data.rating_count
                        }
                      : prompt
                  ),
                  subcategories: category.subcategories
                    ? category.subcategories.map(subcat => ({
                        ...subcat,
                        prompts: subcat.prompts.map(prompt =>
                          prompt.id === promptId
                            ? {
                                ...prompt,
                                ratingAverage: data.rating_average,
                                ratingCount: data.rating_count
                              }
                            : prompt
                        )
                      }))
                    : []
                }));
              });
            }
          });
        }, 500);
      }
    } catch (error) {
      console.error('[STAR] Erro ao avaliar prompt:', error);
    }
  };

  const addComment = async (promptId: string, comment: string) => {
    if (useOptimized && optimizedCategories.length > 0) {
      optimizedAddComment(promptId, comment);
    } else {
      await fallbackAddComment(promptId, comment);
    }
  };

  // NO duplicate movePrompt function - using fallbackMovePrompt directly - FIXED ✅

  const loadCategories = async () => {
    console.log('🔄 [OPT] Carregando categorias...');
    
    // Tentar carregamento otimizado primeiro
    if (useOptimized && !fallbackActivated) {
      try {
        console.log('🔄 [OPT] Tentando carregar via modo otimizado...');
        await optimizedRefetch();
        
        // Verificar se temos dados
        if (optimizedCategories.length === 0) {
          console.warn('⚠️ [OPT] Otimizado retornou 0 categorias, tentando fallback...');
          setUseOptimized(false);
          await fallbackLoadCategories();
        } else {
          console.info(`✅ [OPT] carregados ${optimizedCategories.length} categorias`);
        }
      } catch (error) {
        console.error('❌ [OPT] Erro no carregamento otimizado:', error);
        console.warn('⚠️ [OPT] Mudando para fallback devido a erro');
        setUseOptimized(false);
        await fallbackLoadCategories();
      }
    } else {
      // Se já estamos em fallback, usar diretamente
      console.log('🔄 [OPT] Carregando via fallback...');
      await fallbackLoadCategories();
    }
    
    // Notificar que categorias foram carregadas
    window.dispatchEvent(new CustomEvent('categoriesLoaded'));
    console.log(`✅ [OPT] Carregamento concluído: ${currentCategories.length} categorias`);
  };

  // Page navigation - only use optimized if working
  const nextPage = () => {
    if (useOptimized && optimizedCategories.length > 0) {
      optimizedNextPage();
    }
  };

  const previousPage = () => {
    if (useOptimized && optimizedCategories.length > 0) {
      optimizedPreviousPage();
    }
  };

  const currentPage = useOptimized && optimizedCategories.length > 0 ? optimizedCurrentPage : 1;

  // Export functionality
  const exportPrompts = () => {
    try {
      const allPrompts: Array<{
        text: string;
        category: string;
        rating: number;
        comments: string[];
        tags: string[];
        createdAt: string;
      }> = [];
      
      const collectPromptsRecursive = (cats: Category[], parentPath: string = "") => {
        cats.forEach(category => {
          const categoryPath = parentPath ? `${parentPath} > ${category.name}` : category.name;
          
          category.prompts.forEach(prompt => {
            allPrompts.push({
              text: prompt.text,
              category: categoryPath,
              rating: prompt.rating,
              comments: prompt.comments,
              tags: prompt.tags,
              createdAt: prompt.createdAt.toISOString(),
            });
          });
          
          if (category.subcategories && category.subcategories.length > 0) {
            collectPromptsRecursive(category.subcategories, categoryPath);
          }
        });
      };
      
      collectPromptsRecursive(categories);
      
      const csvContent = [
        ['Text', 'Category', 'Rating', 'Comments', 'Tags', 'Created At'].join(','),
        ...allPrompts.map(prompt => [
          `"${prompt.text.replace(/"/g, '""')}"`,
          `"${prompt.category}"`,
          prompt.rating,
          `"${prompt.comments.join('; ').replace(/"/g, '""')}"`,
          `"${prompt.tags.join('; ')}"`,
          prompt.createdAt
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `prompts_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting prompts:', error);
    }
  };

  // Função para invalidar cache quando necessário
  const invalidateData = () => {
    // Evitar invalidação em modo fallback
    if (fallbackActivated) {
      console.log("⚠️ [OPT] Ignorando invalidação no modo fallback");
      return;
    }
    
    console.log("🔄 [OPT] Invalidando cache de dados");
    if (useOptimized) {
      optimizedInvalidateData();
    }
  };

  return {
    categories,
    loading,
    loadError,
    loadCategories,
    addCategory: categoryAddCategory,
    editCategory: categoryEditCategory,
    deleteCategory: categoryDeleteCategory,
    ratePrompt,
    addComment,
    movePrompt: fallbackMovePrompt,
    bulkImportPrompts,
    deleteSelectedPrompts,
    togglePromptSelection,
    toggleSelectAll,
    exportPrompts,
    nextPage,
    previousPage,
    currentPage,
    updateCategoryCache,
    setUseOptimized
  };
};