
import { supabase } from "../base/supabaseService";

// Improved implementation with simplified process and better error handling
export const forceDeleteCategoryById = async (id: string) => {
  console.log(`🔄 INICIANDO EXCLUSÃO FORÇADA DA CATEGORIA: ${id}`);
  
  try {
    // 1. Get category info for logging
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .maybeSingle();
      
    if (categoryError) {
      console.error('❌ Erro ao obter informações da categoria:', categoryError);
      return { success: false, error: categoryError };
    }
    
    console.log(`📌 Tentando excluir categoria: ${categoryData?.name || 'Desconhecida'} (ID: ${id})`);
    
    // 2. Get all subcategories recursively with depth information
    const subcategories = await getAllSubcategoriesRecursive(id);
    console.log(`🔍 Encontradas ${subcategories.length} subcategorias para excluir`);
    
    // All category IDs to process (main + subcategories)
    const allCategoryIds = [id, ...subcategories.map(c => c.id)];
    
    // 3. Find all prompts in these categories first - we need their IDs to delete comments
    console.log('🔍 Buscando todos os prompts nas categorias...');
    let allPromptIds: string[] = [];
    
    for (const categoryId of allCategoryIds) {
      const { data: prompts, error: promptsError } = await supabase
        .from('prompts')
        .select('id')
        .eq('category_id', categoryId);
        
      if (promptsError) {
        console.error(`❌ Erro ao buscar prompts da categoria ${categoryId}:`, promptsError);
        return { success: false, error: promptsError };
      }
      
      if (prompts && prompts.length > 0) {
        console.log(`📊 Encontrados ${prompts.length} prompts na categoria ${categoryId}`);
        allPromptIds = [...allPromptIds, ...prompts.map(p => p.id)];
      }
    }
    
    // 4. Delete all comments for all prompts in one operation if we have any
    if (allPromptIds.length > 0) {
      console.log(`🗑️ Excluindo todos os ${allPromptIds.length} comentários de prompts...`);
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('prompt_id', allPromptIds);
        
      if (commentsError) {
        console.error('❌ Erro ao excluir comentários:', commentsError);
        return { success: false, error: commentsError };
      }
      console.log('✅ Comentários excluídos com sucesso');
    }
    
    // 5. Delete all prompts in all categories in one operation
    console.log('🗑️ Excluindo todos os prompts das categorias...');
    for (const categoryId of allCategoryIds) {
      const { error: promptsError } = await supabase
        .from('prompts')
        .delete()
        .eq('category_id', categoryId);
        
      if (promptsError) {
        console.error(`❌ Erro ao excluir prompts da categoria ${categoryId}:`, promptsError);
        return { success: false, error: promptsError };
      }
    }
    console.log('✅ Prompts excluídos com sucesso');
    
    // 6. Delete subcategories from deepest to shallowest level
    if (subcategories.length > 0) {
      console.log('🗑️ Excluindo subcategorias do nível mais profundo para o mais raso...');
      // Sort by depth descending to delete deepest first
      const sortedSubcategories = [...subcategories].sort((a, b) => b.depth - a.depth);
      
      for (const subcat of sortedSubcategories) {
        console.log(`🗑️ Excluindo subcategoria: ${subcat.name} (ID: ${subcat.id}) no nível ${subcat.depth}`);
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', subcat.id);
          
        if (deleteError) {
          console.error(`❌ Erro ao excluir subcategoria ${subcat.id}:`, deleteError);
          return { success: false, error: deleteError };
        }
      }
      console.log('✅ Todas as subcategorias foram excluídas com sucesso');
    }
    
    // 7. Finally delete the main category
    console.log(`🗑️ Excluindo categoria principal: ${categoryData?.name} (ID: ${id})`);
    const { error: mainCategoryError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (mainCategoryError) {
      console.error('❌ Erro ao excluir categoria principal:', mainCategoryError);
      return { success: false, error: mainCategoryError };
    }
    
    console.log('✅ PROCESSO DE EXCLUSÃO CONCLUÍDO COM SUCESSO!');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ ERRO CRÍTICO durante a exclusão da categoria:', error);
    return { success: false, error };
  }
};

// Helper function to get all subcategories with depth information
async function getAllSubcategoriesRecursive(categoryId: string, depth = 0): Promise<Array<{id: string, name: string, depth: number}>> {
  const { data: subcategories, error } = await supabase
    .from('categories')
    .select('id, name, parent_id')
    .eq('parent_id', categoryId);
  
  if (error) {
    console.error('❌ Erro ao buscar subcategorias:', error);
    return [];
  }
  
  let allSubcategories = subcategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    depth: depth + 1
  }));
  
  // Recursively get subcategories of subcategories
  for (const subcategory of subcategories) {
    const children = await getAllSubcategoriesRecursive(subcategory.id, depth + 1);
    allSubcategories = [...allSubcategories, ...children];
  }
  
  return allSubcategories;
}

// Legacy function for backward compatibility
export const deleteCategoryFromDb = async (id: string) => {
  console.log('⚠️ Método legado chamado, redirecionando para exclusão forçada');
  const result = await forceDeleteCategoryById(id);
  return { 
    data: null, 
    error: result.error, 
    promptsCount: 0 
  };
};

// Helper for backward compatibility
export const getAllSubcategoriesIds = async (categoryId: string): Promise<string[]> => {
  const subcategories = await getAllSubcategoriesRecursive(categoryId);
  return subcategories.map(sub => sub.id);
};
