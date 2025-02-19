
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

export const deleteCategoryFromDb = async (id: string) => {
  return await supabase
    .from('categories')
    .delete()
    .eq('id', id);
};
