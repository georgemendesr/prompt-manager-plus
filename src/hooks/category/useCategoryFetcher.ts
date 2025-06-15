
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types/prompt';

export const useCategoryFetcher = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          prompts (*)
        `)
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
