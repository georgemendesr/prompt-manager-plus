<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import { supabase } from "@/integrations/supabase/client";
import type { ImageCategory } from "@/types/imageCategory";

export const fetchImageCategories = async (): Promise<ImageCategory[]> => {
<<<<<<< HEAD
  try {
    // Tentar primeiro usando o endpoint normal
    const { data, error } = await (supabase as any)
      .from('image_categories')
      .select('*')
      .order('name');
    
    if (!error) {
      return buildImageCategoryTree(data || []);
    }
    
    // Se falhar, tentar com tabela legada ou outro schema
    console.log('Tentando endpoints alternativos para categorias de imagem');
    
    // Tentar com categories de legado, filtrando apenas para o tipo 'image'
    const { data: legacyData, error: legacyError } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('type', 'image')
      .order('name');
    
    if (!legacyError && legacyData?.length > 0) {
      console.log('Usando tabela legada categories (filtradas para imagem)');
      return buildImageCategoryTree(legacyData || []);
    }
    
    // Se não houver dados, retornar array vazio
    console.log('Nenhum dado encontrado, retornando array vazio');
    return [];
  } catch (err) {
    console.error('Erro ao buscar categorias de imagem:', err);
    return [];
  }
};

export const addImageCategory = async (name: string, parentId?: string) => {
  try {
    // Tentar primeiro na tabela correta
    const { data, error } = await (supabase as any)
      .from('image_categories')
      .insert({
        name,
        parent_id: parentId || null,
        type: 'image'
      })
      .select()
      .single();

    if (!error) {
      return data;
    }

    // Se falhar, tentar com tabela legada
    console.log('Tentando adicionar à tabela legada categories');
    const { data: legacyData, error: legacyError } = await (supabase as any)
      .from('categories')
      .insert({
        name,
        parent_id: parentId || null,
        type: 'image'
      })
      .select()
      .single();

    if (!legacyError) {
      return legacyData;
    }

    throw error || legacyError;
  } catch (err) {
    console.error('Erro ao adicionar categoria de imagem:', err);
    throw err;
  }
=======
  const { data, error } = await (supabase as any)
    .from('image_categories')
    .select('*')
    .order('name');

  if (error) throw error;

  return buildImageCategoryTree(data || []);
};

export const addImageCategory = async (name: string, parentId?: string) => {
  const { data, error } = await (supabase as any)
    .from('image_categories')
    .insert({
      name,
      parent_id: parentId || null,
      type: 'image'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
};

export const updateImageCategory = async (id: string, name: string, parentId?: string) => {
  const { data, error } = await (supabase as any)
    .from('image_categories')
    .update({
      name,
      parent_id: parentId || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteImageCategory = async (id: string) => {
  const { error } = await (supabase as any)
    .from('image_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const buildImageCategoryTree = (categories: any[], parentId: string | null = null): ImageCategory[] => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      id: category.id,
      name: category.name,
      parentId: category.parent_id,
      type: 'image' as const,
      created_at: category.created_at,
      subcategories: buildImageCategoryTree(categories, category.id)
    }));
};
