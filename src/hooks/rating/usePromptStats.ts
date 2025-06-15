
import { useState, useCallback } from 'react';
import { getPromptStats } from '@/services/rating/ratingService';

export const usePromptStats = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePromptStats = useCallback(async (promptId: string) => {
    setIsUpdating(true);
    try {
      const { data, error } = await getPromptStats(promptId);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updatePromptStats,
    isUpdating
  };
};
