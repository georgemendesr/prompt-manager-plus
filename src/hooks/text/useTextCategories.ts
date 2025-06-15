
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TextCategory } from '@/types/textCategory';

export const useTextCategories = () => {
  const [categories, setCategories] = useState<TextCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      setCategories((data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        parentId: cat.parent_id || undefined,
        subcategories: []
      })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias';
      setError(errorMessage);
      console.error('Erro ao carregar categorias de texto:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, parentId?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: name.trim(),
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: TextCategory = {
        id: data.id,
        name: data.name,
        parentId: data.parent_id || undefined,
        subcategories: []
      };

      setCategories(prev => [...prev, newCategory]);
      toast.success('Categoria criada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
      return false;
    }
  };

  const editCategory = async (id: string, newName: string, newParentId?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: newName.trim(),
          parent_id: newParentId || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(cat => 
        cat.id === id 
          ? { ...cat, name: data.name, parentId: data.parent_id || undefined }
          : cat
      ));
      
      toast.success('Categoria atualizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      toast.error('Erro ao editar categoria');
      return false;
    }
  };

  const removeCategory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Categoria removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast.error('Erro ao deletar categoria');
      return false;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    setCategories,
    loading,
    error,
    loadCategories,
    createCategory,
    editCategory,
    removeCategory
  };
};
