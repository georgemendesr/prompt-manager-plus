
import { supabase } from "@/integrations/supabase/client";
import type { TextCategory } from "@/types/textCategory";

export const fetchTextCategories = async (): Promise<TextCategory[]> => {
  const { data, error } = await (supabase as any)
    .from('text_categories')
    .select('*')
    .order('name');

  if (error) throw error;

  return buildTextCategoryTree(data || []);
};

export const addTextCategory = async (name: string, parentId?: string) => {
  const { data, error } = await (supabase as any)
    .from('text_categories')
    .insert({
      name,
      parent_id: parentId || null,
      type: 'text'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTextCategory = async (id: string, name: string, parentId?: string) => {
  const { data, error } = await (supabase as any)
    .from('text_categories')
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

export const deleteTextCategory = async (id: string) => {
  const { error } = await (supabase as any)
    .from('text_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

const buildTextCategoryTree = (categories: any[], parentId: string | null = null): TextCategory[] => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      id: category.id,
      name: category.name,
      parentId: category.parent_id,
      type: 'text' as const,
      created_at: category.created_at,
      subcategories: buildTextCategoryTree(categories, category.id)
    }));
};
