
import { supabase } from "../base/supabaseService";

export const forceDeleteCategoryById = async (id: string) => {
  const operationId = Date.now().toString();
  console.log(`🔄 [${operationId}] INICIANDO EXCLUSÃO FORÇADA DA CATEGORIA: ${id}`);
  
  try {
    // 1. First get information about the category for better logging
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .maybeSingle();
      
    if (categoryError) {
      console.error(`❌ [${operationId}] Erro ao obter informações da categoria:`, categoryError);
      return { success: false, error: categoryError };
    }
    
    if (!categoryData) {
      console.log(`⚠️ [${operationId}] Categoria não encontrada (pode já ter sido excluída): ${id}`);
      return { success: true, error: null }; // Consider it successful if already deleted
    }
    
    const categoryName = categoryData.name;
    console.log(`📌 [${operationId}] Tentando excluir categoria: ${categoryName} (ID: ${id})`);
    
    // 2. Find all subcategories with their depth information (for proper deletion order)
    const subcategories = await getAllSubcategoriesRecursive(id);
    console.log(`🔍 [${operationId}] Encontradas ${subcategories.length} subcategorias para excluir`);
    
    // 3. Gather all category IDs (main + subcategories)
    const allCategoryIds = [id, ...subcategories.map(c => c.id)];
    console.log(`📋 [${operationId}] Total de categorias a processar: ${allCategoryIds.length}`);
    
    // 4. Collect all prompts from all categories (needed for comment deletion)
    let allPromptIds: string[] = [];
    
    for (const categoryId of allCategoryIds) {
      try {
        const { data: prompts, error: promptsError } = await supabase
          .from('prompts')
          .select('id')
          .eq('category_id', categoryId);
          
        if (promptsError) {
          console.error(`❌ [${operationId}] Erro ao buscar prompts da categoria ${categoryId}:`, promptsError);
          continue; // Continue with other categories even if one fails
        }
        
        if (prompts && prompts.length > 0) {
          console.log(`📊 [${operationId}] Encontrados ${prompts.length} prompts na categoria ${categoryId}`);
          allPromptIds = [...allPromptIds, ...prompts.map(p => p.id)];
        }
      } catch (promptError) {
        console.error(`❌ [${operationId}] Erro ao processar prompts da categoria ${categoryId}:`, promptError);
        // Continue with other categories
      }
    }
    
    console.log(`📊 [${operationId}] Total de prompts a processar: ${allPromptIds.length}`);
    
    // 5. Process in correct order: comments first, then prompts, then subcategories (deepest first), finally main category
    
    // 5.1 Delete all comments for all prompts (if any)
    if (allPromptIds.length > 0) {
      console.log(`🗑️ [${operationId}] Excluindo comentários de ${allPromptIds.length} prompts...`);
      
      // Process in smaller batches to avoid query limitations
      const BATCH_SIZE = 50;
      for (let i = 0; i < allPromptIds.length; i += BATCH_SIZE) {
        const batch = allPromptIds.slice(i, i + BATCH_SIZE);
        try {
          const { error: commentsDeleteError } = await supabase
            .from('comments')
            .delete()
            .in('prompt_id', batch);
            
          if (commentsDeleteError) {
            console.error(`❌ [${operationId}] Erro ao excluir comentários (batch ${i}/${allPromptIds.length}):`, commentsDeleteError);
            // Continue with next batch
          }
        } catch (batchError) {
          console.error(`❌ [${operationId}] Erro no processamento do batch de comentários:`, batchError);
          // Continue with next batch
        }
      }
      console.log(`✅ [${operationId}] Processamento de comentários concluído`);
    }
    
    // 5.2 Delete all prompts from all categories
    console.log(`🗑️ [${operationId}] Excluindo prompts de todas as categorias...`);
    for (const categoryId of allCategoryIds) {
      try {
        const { error: promptsDeleteError } = await supabase
          .from('prompts')
          .delete()
          .eq('category_id', categoryId);
          
        if (promptsDeleteError) {
          console.error(`❌ [${operationId}] Erro ao excluir prompts da categoria ${categoryId}:`, promptsDeleteError);
          // Continue with other categories
        }
      } catch (deleteError) {
        console.error(`❌ [${operationId}] Erro ao processar exclusão de prompts para categoria ${categoryId}:`, deleteError);
        // Continue with other categories
      }
    }
    console.log(`✅ [${operationId}] Processamento de prompts concluído`);
    
    // 5.3 Delete subcategories from deepest to shallowest level
    if (subcategories.length > 0) {
      console.log(`🗑️ [${operationId}] Excluindo subcategorias do nível mais profundo para o mais raso...`);
      
      // Sort by depth descending (deepest first)
      const sortedSubcategories = [...subcategories].sort((a, b) => b.depth - a.depth);
      
      // Track successfully deleted subcategories
      const deletedSubcategoryIds: string[] = [];
      
      for (const subcat of sortedSubcategories) {
        try {
          console.log(`🗑️ [${operationId}] Excluindo subcategoria: ${subcat.name} (ID: ${subcat.id}, nível: ${subcat.depth})`);
          
          const { error: subcatDeleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', subcat.id);
            
          if (subcatDeleteError) {
            console.error(`❌ [${operationId}] Erro ao excluir subcategoria ${subcat.id}:`, subcatDeleteError);
            // Continue with other subcategories
          } else {
            deletedSubcategoryIds.push(subcat.id);
          }
        } catch (deleteError) {
          console.error(`❌ [${operationId}] Erro ao processar exclusão da subcategoria ${subcat.id}:`, deleteError);
          // Continue with other subcategories
        }
      }
      
      console.log(`✅ [${operationId}] Subcategorias excluídas com sucesso: ${deletedSubcategoryIds.length}/${subcategories.length}`);
    }
    
    // 5.4 Finally delete the main category with additional verification
    console.log(`🗑️ [${operationId}] Excluindo categoria principal: ${categoryName} (ID: ${id})`);
    
    // First, verify the category still exists before attempting deletion
    const { data: categoryExists } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (!categoryExists) {
      console.log(`✅ [${operationId}] Categoria já foi excluída durante o processo`);
      return { success: true, error: null };
    }
    
    const { error: mainCategoryDeleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (mainCategoryDeleteError) {
      console.error(`❌ [${operationId}] Erro ao excluir categoria principal:`, mainCategoryDeleteError);
      return { success: false, error: mainCategoryDeleteError };
    }
    
    // 5.5 Final verification that the category was actually deleted
    const { data: verifyDeletion } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (verifyDeletion) {
      console.error(`❌ [${operationId}] FALHA: Categoria ainda existe após tentativa de exclusão!`);
      return { success: false, error: new Error('Category still exists after deletion attempt') };
    }
    
    console.log(`✅ [${operationId}] PROCESSO DE EXCLUSÃO CONCLUÍDO COM SUCESSO! Categoria verificadamente removida.`);
    return { success: true, error: null };
  } catch (error) {
    console.error(`❌ [${operationId}] ERRO CRÍTICO durante a exclusão da categoria:`, error);
    return { success: false, error };
  }
};

// Helper function to get all subcategories with depth information
async function getAllSubcategoriesRecursive(categoryId: string, depth = 0): Promise<Array<{id: string, name: string, depth: number}>> {
  try {
    const { data: subcategories, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('parent_id', categoryId);
    
    if (error) {
      console.error('❌ Erro ao buscar subcategorias:', error);
      return [];
    }
    
    if (!subcategories || subcategories.length === 0) {
      return [];
    }
    
    let allSubcategories = subcategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      depth: depth + 1
    }));
    
    // Process each subcategory's children
    for (const subcategory of subcategories) {
      try {
        const children = await getAllSubcategoriesRecursive(subcategory.id, depth + 1);
        if (children.length > 0) {
          allSubcategories = [...allSubcategories, ...children];
        }
      } catch (error) {
        console.error(`❌ Erro ao processar subcategorias filhas de ${subcategory.id}:`, error);
        // Continue with other subcategories
      }
    }
    
    return allSubcategories;
  } catch (error) {
    console.error(`❌ Erro não esperado em getAllSubcategoriesRecursive:`, error);
    return [];
  }
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
