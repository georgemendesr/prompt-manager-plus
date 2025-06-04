
import { supabase } from "../base/supabaseService";
import type { RawCategory } from "@/types/rawCategory";

export const fetchCategories = async () => {
  try {
    return await supabase
      .from('categories')
      .select('id, name, parent_id, created_at');
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return { data: null, error };
  }
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
  try {
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
  } catch (error) {
    console.error('Erro ao obter subcategorias:', error);
    return [];
  }
};
