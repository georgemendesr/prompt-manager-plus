
import { supabase } from "@/integrations/supabase/client";
import type { ImageCategory } from "@/types/imageCategory";

export const fetchImageCategories = async (): Promise<ImageCategory[]> => {
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
