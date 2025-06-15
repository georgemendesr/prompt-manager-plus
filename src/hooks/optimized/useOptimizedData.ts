
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOptimizedData } from '@/services/optimized/optimizedDataService';
import { toast } from 'sonner';
import type { Category } from '@/types/prompt';

export const useOptimizedData = (limit: number = 20, offset: number = 0) => {
  const [currentPage, setCurrentPage] = useState(0);
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['optimized-data', limit, offset + currentPage * limit],
    queryFn: () => fetchOptimizedData(limit, offset + currentPage * limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['optimized-data'] });
  };

  const ratePrompt = async (promptId: string, increment: boolean) => {
    // Implementation for rating prompts
    console.log('Rating prompt:', promptId, increment);
  };

  const addComment = async (promptId: string, comment: string) => {
    // Implementation for adding comments
    console.log('Adding comment:', promptId, comment);
  };

  const nextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const previousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const updateCategoryInCache = (categoryId: string, updates: Partial<Category>) => {
    queryClient.setQueryData(['optimized-data', limit, offset + currentPage * limit], (oldData: Category[]) => {
      if (!oldData) return oldData;
      return oldData.map(category => 
        category.id === categoryId ? { ...category, ...updates } : category
      );
    });
  };

  return {
    categories,
    loading,
    error: error ? String(error) : null,
    refetch,
    invalidateData,
    ratePrompt,
    addComment,
    nextPage,
    previousPage,
    currentPage,
    updateCategoryInCache
  };
};
