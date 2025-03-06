
import { supabase } from "../base/supabaseService";

// Simple direct approach for category deletion with explicit steps
export const forceDeleteCategoryById = async (id: string) => {
  try {
    console.log('Starting force delete process for category:', id);
    
    // Step 1: Get all subcategories recursively
    const subcategories = await getAllSubcategoriesRecursive(id);
    const allCategoryIds = [id, ...subcategories.map(c => c.id)];
    
    console.log(`Found ${allCategoryIds.length} categories to delete (including subcategories)`);
    
    // Step 2: Find all prompts in these categories to delete their comments
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id')
      .in('category_id', allCategoryIds);
    
    if (promptsError) {
      console.error('Error fetching prompts:', promptsError);
      throw promptsError;
    }
    
    const promptIds = prompts?.map(p => p.id) || [];
    console.log(`Found ${promptIds.length} prompts to delete`);
    
    // Step 3: Delete comments first (no foreign key constraints, so this should work)
    if (promptIds.length > 0) {
      console.log('Deleting comments for all prompts...');
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('prompt_id', promptIds);
      
      if (commentsError) {
        console.error('Error deleting comments:', commentsError);
        throw commentsError;
      }
    }
    
    // Step 4: Delete all prompts
    if (allCategoryIds.length > 0) {
      console.log('Deleting all prompts in categories...');
      const { error: promptsDeleteError } = await supabase
        .from('prompts')
        .delete()
        .in('category_id', allCategoryIds);
      
      if (promptsDeleteError) {
        console.error('Error deleting prompts:', promptsDeleteError);
        throw promptsDeleteError;
      }
    }
    
    // Step 5: Delete subcategories from bottom up (leaf nodes first)
    // Sort subcategories by depth level (deeper levels first)
    const sortedSubcategories = subcategories.sort((a, b) => b.depth - a.depth);
    
    for (const category of sortedSubcategories) {
      console.log(`Deleting subcategory: ${category.id} (level ${category.depth})`);
      const { error: subDeleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);
      
      if (subDeleteError) {
        console.error(`Error deleting subcategory ${category.id}:`, subDeleteError);
        throw subDeleteError;
      }
    }
    
    // Step 6: Finally delete the main category
    console.log('Deleting main category:', id);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting main category:', error);
      throw error;
    }
    
    console.log('Category deletion completed successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Critical error during category deletion:', error);
    return { success: false, error };
  }
};

// Helper function to get all subcategories with depth information
async function getAllSubcategoriesRecursive(categoryId: string, depth = 0) {
  try {
    const { data: subcategories, error } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .eq('parent_id', categoryId);
    
    if (error) throw error;
    
    let allSubcategories = subcategories.map(cat => ({...cat, depth: depth + 1}));
    
    for (const sub of subcategories) {
      const children = await getAllSubcategoriesRecursive(sub.id, depth + 1);
      allSubcategories = [...allSubcategories, ...children];
    }
    
    return allSubcategories;
  } catch (error) {
    console.error('Error getting subcategories:', error);
    return [];
  }
}

// Legacy function for backward compatibility
export const deleteCategoryFromDb = async (id: string) => {
  console.log('Legacy delete method called, redirecting to force delete');
  const result = await forceDeleteCategoryById(id);
  return { 
    data: null, 
    error: result.error, 
    promptsCount: 0 
  };
};

// Helper to get subcategory IDs (kept for backward compatibility)
export const getAllSubcategoriesIds = async (categoryId: string): Promise<string[]> => {
  const subcategories = await getAllSubcategoriesRecursive(categoryId);
  return subcategories.map(sub => sub.id);
};
