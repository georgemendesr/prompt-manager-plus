
import { supabase } from "../base/supabaseService";

// Implementação simplificada e robusta para excluir categorias
export const forceDeleteCategoryById = async (id: string) => {
  console.log(`🔄 INICIANDO EXCLUSÃO FORÇADA DA CATEGORIA: ${id}`);
  
  try {
    // 1. Obter informações da categoria para log
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .single();
      
    if (categoryError) {
      console.error('❌ Erro ao obter informações da categoria:', categoryError);
    } else {
      console.log(`📌 Excluindo categoria: ${categoryData?.name} (ID: ${id})`);
    }
    
    // 2. Obter todas as subcategorias recursivamente
    const subcategories = await getAllSubcategoriesRecursive(id);
    console.log(`🔍 Encontradas ${subcategories.length} subcategorias para excluir`);
    
    // Adicionar a categoria principal à lista completa de categorias a excluir
    const allCategoryIds = [id, ...subcategories.map(c => c.id)];
    
    // 3. Excluir comentários de todos os prompts nestas categorias
    console.log('🔄 Excluindo comentários...');
    for (const categoryId of allCategoryIds) {
      const { data: prompts } = await supabase
        .from('prompts')
        .select('id')
        .eq('category_id', categoryId);
      
      if (prompts && prompts.length > 0) {
        const promptIds = prompts.map(p => p.id);
        console.log(`📊 Excluindo comentários de ${promptIds.length} prompts na categoria ${categoryId}`);
        
        const { error: commentsError } = await supabase
          .from('comments')
          .delete()
          .in('prompt_id', promptIds);
        
        if (commentsError) {
          console.error(`❌ Erro ao excluir comentários da categoria ${categoryId}:`, commentsError);
        }
      }
    }
    
    // 4. Excluir prompts em todas as categorias
    console.log('🔄 Excluindo prompts...');
    for (const categoryId of allCategoryIds) {
      const { error: promptsError } = await supabase
        .from('prompts')
        .delete()
        .eq('category_id', categoryId);
      
      if (promptsError) {
        console.error(`❌ Erro ao excluir prompts da categoria ${categoryId}:`, promptsError);
      }
    }
    
    // 5. Excluir categorias - começando pelas subcategorias mais profundas
    console.log('🔄 Excluindo subcategorias...');
    const sortedSubcategories = [...subcategories].sort((a, b) => b.depth - a.depth);
    
    for (const category of sortedSubcategories) {
      console.log(`🗑️ Excluindo subcategoria: ${category.name} (${category.id}) - nível ${category.depth}`);
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);
      
      if (deleteError) {
        console.error(`❌ Erro ao excluir subcategoria ${category.id}:`, deleteError);
      }
    }
    
    // 6. Finalmente, excluir a categoria principal
    console.log(`🔄 Excluindo categoria principal: ${id}`);
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

// Função auxiliar para obter todas as subcategorias com informações de profundidade
async function getAllSubcategoriesRecursive(categoryId: string, depth = 0) {
  const { data: subcategories, error } = await supabase
    .from('categories')
    .select('id, name, parent_id')
    .eq('parent_id', categoryId);
  
  if (error) {
    console.error('❌ Erro ao buscar subcategorias:', error);
    return [];
  }
  
  let allSubcategories = subcategories.map(cat => ({...cat, depth: depth + 1}));
  
  for (const subcategory of subcategories) {
    const children = await getAllSubcategoriesRecursive(subcategory.id, depth + 1);
    allSubcategories = [...allSubcategories, ...children];
  }
  
  return allSubcategories;
}

// Função legada para compatibilidade
export const deleteCategoryFromDb = async (id: string) => {
  console.log('⚠️ Método legado chamado, redirecionando para exclusão forçada');
  const result = await forceDeleteCategoryById(id);
  return { 
    data: null, 
    error: result.error, 
    promptsCount: 0 
  };
};

// Auxiliar para compatibilidade
export const getAllSubcategoriesIds = async (categoryId: string): Promise<string[]> => {
  const subcategories = await getAllSubcategoriesRecursive(categoryId);
  return subcategories.map(sub => sub.id);
};
