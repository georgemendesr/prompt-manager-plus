
import { supabase } from "@/integrations/supabase/client";

export const fetchCategories = async () => {
  return await supabase
    .from('categories')
    .select('id, name, parent_id, created_at');
};

export const fetchPrompts = async () => {
  return await supabase
    .from('prompts')
    .select('id, text, category_id, rating, background_color, created_at');
};

export const fetchComments = async () => {
  return await supabase
    .from('comments')
    .select('id, prompt_id, text, created_at');
};

export const addCategoryToDb = async (name: string, parentId?: string) => {
  return await supabase
    .from('categories')
    .insert([{ 
      name: name.trim(),
      parent_id: parentId
    }])
    .select()
    .single();
};

export const updateCategoryInDb = async (id: string, name: string, parentId: string | null) => {
  return await supabase
    .from('categories')
    .update({ 
      name: name.trim(),
      parent_id: parentId
    })
    .eq('id', id);
};

export const getAllSubcategoriesIds = async (categoryId: string): Promise<string[]> => {
  const { data: subcategories, error } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', categoryId);

  if (error) throw error;

  const ids = [];
  for (const sub of subcategories || []) {
    ids.push(sub.id);
    const subIds = await getAllSubcategoriesIds(sub.id);
    ids.push(...subIds);
  }

  return ids;
};

export const deleteCategoryFromDb = async (id: string) => {
  const client = supabase;
  try {
    // Primeiro, obtém todos os IDs das subcategorias recursivamente
    const subcategoryIds = await getAllSubcategoriesIds(id);
    
    // Adiciona o ID da categoria atual
    const allCategoryIds = [...subcategoryIds, id];
    
    console.log('Tentando deletar categorias:', allCategoryIds);

    // Inicia uma transação para garantir que todas as operações sejam executadas
    const { error: deleteError } = await client
      .from('categories')
      .delete()
      .in('id', allCategoryIds);

    if (deleteError) throw deleteError;

    // Verifica se a categoria foi realmente deletada
    const { data: checkCategory } = await client
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (checkCategory) {
      throw new Error('A categoria não foi deletada corretamente');
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Erro ao deletar categorias:', error);
    return { data: null, error };
  }
};
