import { supabase } from "@/integrations/supabase/client";
import type { MusicCategory } from "@/types/musicCategory";

export const fetchMusicCategories = async (): Promise<MusicCategory[]> => {
  try {
    // Buscar categorias da tabela music_categories
    const { data, error } = await (supabase as any)
      .from('music_categories')
      .select('*')
      .order('name');
    
    if (!error) {
      return buildMusicCategoryTree(data || []);
    }
    
    // Se falhar, tentar com tabela legada ou outro schema
    console.log('Tentando endpoints alternativos para categorias de música');
    
    // Tentar com categories de legado, filtrando apenas para o tipo 'music'
    const { data: legacyData, error: legacyError } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('type', 'music')
      .order('name');
    
    if (!legacyError && legacyData?.length > 0) {
      console.log('Usando tabela legada categories (filtradas para música)');
      return buildMusicCategoryTree(legacyData || []);
    }
    
    // Se não houver dados, retornar array vazio
    console.log('Nenhum dado encontrado, retornando array vazio');
    return [];
  } catch (err) {
    console.error('Erro ao buscar categorias de música:', err);
    return [];
  }
};

export const addMusicCategory = async (name: string, parentId?: string) => {
  try {
    // Tentar primeiro na tabela correta
    const { data, error } = await (supabase as any)
      .from('music_categories')
      .insert({
        name,
        parent_id: parentId || null,
        type: 'music'
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
        type: 'music'
      })
      .select()
      .single();

    if (!legacyError) {
      return legacyData;
    }

    throw error || legacyError;
  } catch (err) {
    console.error('Erro ao adicionar categoria de música:', err);
    throw err;
  }
};

export const updateMusicCategory = async (id: string, name: string, parentId?: string) => {
  const { data, error } = await (supabase as any)
    .from('music_categories')
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

export const deleteMusicCategory = async (id: string) => {
  const { error } = await (supabase as any)
    .from('music_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const buildMusicCategoryTree = (categories: any[], parentId: string | null = null): MusicCategory[] => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      id: category.id,
      name: category.name,
      parentId: category.parent_id,
      type: 'music' as const,
      created_at: category.created_at,
      subcategories: buildMusicCategoryTree(categories, category.id)
    }));
}; 