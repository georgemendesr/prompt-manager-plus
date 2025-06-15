
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCategoryMutations = () => {
  const [loading, setLoading] = useState(false);

  const addCategory = async (name: string, parentId?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: name.trim(),
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Categoria criada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editCategory = async (id: string, name: string, parentId?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: name.trim(),
          parent_id: parentId || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Categoria atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      toast.error('Erro ao editar categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Categoria removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast.error('Erro ao deletar categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addCategory,
    editCategory,
    deleteCategory,
    loading
  };
};
