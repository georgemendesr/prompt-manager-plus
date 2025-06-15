
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ImageCategory } from '@/types/imageCategory';

export const fetchImageCategories = async (): Promise<ImageCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      parentId: cat.parent_id || undefined,
      subcategories: []
    }));
  } catch (error) {
    console.error('Erro ao carregar categorias de imagem:', error);
    throw error;
  }
};

export const createImageCategory = async (name: string, parentId?: string): Promise<ImageCategory> => {
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

    toast.success('Categoria criada com sucesso!');
    
    return {
      id: data.id,
      name: data.name,
      parentId: data.parent_id || undefined,
      subcategories: []
    };
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    toast.error('Erro ao criar categoria');
    throw error;
  }
};

export const updateImageCategory = async (id: string, name: string, parentId?: string): Promise<ImageCategory> => {
  try {
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
    
    return {
      id: data.id,
      name: data.name,
      parentId: data.parent_id || undefined,
      subcategories: []
    };
  } catch (error) {
    console.error('Erro ao editar categoria:', error);
    toast.error('Erro ao editar categoria');
    throw error;
  }
};

export const deleteImageCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('Categoria removida com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    toast.error('Erro ao deletar categoria');
    throw error;
  }
};
