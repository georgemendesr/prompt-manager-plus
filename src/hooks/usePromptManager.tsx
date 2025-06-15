import { useQueryClient } from '@tanstack/react-query';

export const usePromptManager = (): PromptManager => {
  const queryClient = useQueryClient();

  const {
    invalidateData: invalidateOptimizedData,
    refetch: optimizedRefetch,
  } = useOptimizedData();

  const {
    loadCategories: async () => {
      console.log("🔄 Invalidando e recarregando categorias...");
      
      invalidateOptimizedData(); 

      await queryClient.refetchQueries({ queryKey: ['optimized-data'] });
      
      console.log("✅ Recarregamento de categorias finalizado.");
    }
  };

  // ... resto do código ...
}; 