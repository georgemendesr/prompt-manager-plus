
import { supabase } from "../base/supabaseService";

// Implementação simplificada com estratégia clara e logs detalhados
export const forceDeleteCategoryById = async (id: string) => {
  console.log('🔄 INICIANDO EXCLUSÃO FORÇADA DA CATEGORIA:', id);
  
  try {
    // 1. Obter informações da categoria e suas subcategorias para registro
    console.log('📋 Obtendo informações da categoria e subcategorias...');
    const { data: categoryInfo, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .single();
      
    if (categoryError) {
      console.error('❌ Erro ao obter informações da categoria:', categoryError);
    } else {
      console.log(`📌 Tentando excluir categoria: ${categoryInfo?.name} (ID: ${id})`);
    }
    
    // 2. Identificar todas as subcategorias recursivamente
    const subcategories = await getAllSubcategoriesRecursive(id);
    const allCategoryIds = [id, ...subcategories.map(c => c.id)];
    
    console.log(`🔍 Encontradas ${allCategoryIds.length} categorias para excluir (incluindo subcategorias)`);
    if (subcategories.length > 0) {
      console.log('📑 Subcategorias encontradas:', subcategories.map(s => `${s.name} (${s.id})`));
    }
    
    // 3. Identificar todos os prompts nestas categorias para excluir seus comentários
    console.log('🔍 Buscando prompts nas categorias...');
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id')
      .in('category_id', allCategoryIds);
    
    if (promptsError) {
      console.error('❌ Erro ao buscar prompts:', promptsError);
      throw promptsError;
    }
    
    const promptIds = prompts?.map(p => p.id) || [];
    console.log(`📊 Encontrados ${promptIds.length} prompts para excluir`);
    
    // 4. Excluir comentários primeiro (sem chaves estrangeiras, então deve funcionar)
    if (promptIds.length > 0) {
      console.log('🗑️ Excluindo comentários de todos os prompts...');
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('prompt_id', promptIds);
      
      if (commentsError) {
        console.error('❌ Erro ao excluir comentários:', commentsError);
        throw commentsError;
      }
      console.log('✅ Comentários excluídos com sucesso!');
    }
    
    // 5. Excluir todos os prompts
    if (allCategoryIds.length > 0) {
      console.log('🗑️ Excluindo todos os prompts das categorias...');
      const { error: promptsDeleteError } = await supabase
        .from('prompts')
        .delete()
        .in('category_id', allCategoryIds);
      
      if (promptsDeleteError) {
        console.error('❌ Erro ao excluir prompts:', promptsDeleteError);
        throw promptsDeleteError;
      }
      console.log('✅ Prompts excluídos com sucesso!');
    }
    
    // 6. Excluir subcategorias de baixo para cima (nós folha primeiro)
    // Ordenar subcategorias por nível de profundidade (níveis mais profundos primeiro)
    const sortedSubcategories = subcategories.sort((a, b) => b.depth - a.depth);
    
    if (sortedSubcategories.length > 0) {
      console.log('🗑️ Excluindo subcategorias na ordem correta (de baixo para cima)...');
      
      for (const category of sortedSubcategories) {
        console.log(`🔄 Excluindo subcategoria: ${category.name} (${category.id}) - nível ${category.depth}`);
        const { error: subDeleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', category.id);
        
        if (subDeleteError) {
          console.error(`❌ Erro ao excluir subcategoria ${category.id}:`, subDeleteError);
          throw subDeleteError;
        }
        console.log(`✅ Subcategoria ${category.name} excluída com sucesso!`);
      }
    }
    
    // 7. Finalmente excluir a categoria principal
    console.log('🗑️ Excluindo categoria principal:', id);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao excluir categoria principal:', error);
      throw error;
    }
    
    console.log('✅ PROCESSO DE EXCLUSÃO CONCLUÍDO COM SUCESSO!');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ ERRO CRÍTICO durante a exclusão da categoria:', error);
    return { success: false, error };
  }
};

// Função auxiliar para obter todas as subcategorias com informações de profundidade e nome
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
    console.error('❌ Erro ao obter subcategorias:', error);
    return [];
  }
}

// Função legada para compatibilidade com o código existente
export const deleteCategoryFromDb = async (id: string) => {
  console.log('⚠️ Método legado chamado, redirecionando para exclusão forçada');
  const result = await forceDeleteCategoryById(id);
  return { 
    data: null, 
    error: result.error, 
    promptsCount: 0 
  };
};

// Auxiliar para obter IDs de subcategorias (mantido para compatibilidade)
export const getAllSubcategoriesIds = async (categoryId: string): Promise<string[]> => {
  const subcategories = await getAllSubcategoriesRecursive(categoryId);
  return subcategories.map(sub => sub.id);
};
