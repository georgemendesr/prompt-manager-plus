
import { supabase } from "../base/supabaseService";
import { getAllSubcategoriesIds } from "./categoryFetchService";
import { deletePromptsInCategories } from "../prompt/promptService";

export const deleteCategoryFromDb = async (id: string) => {
  try {
    // Primeiro, obtém todos os IDs das subcategorias recursivamente
    const subcategoryIds = await getAllSubcategoriesIds(id);
    
    // Adiciona o ID da categoria atual
    const allCategoryIds = [...subcategoryIds, id];
    
    console.log('Tentando deletar categorias:', allCategoryIds);
    
    // Verifica quantos prompts estão nas categorias
    const { data: promptsData, error: promptCountError } = await supabase
      .from('prompts')
      .select('id')
      .in('category_id', allCategoryIds);
      
    if (promptCountError) throw promptCountError;
    
    const promptsCount = promptsData?.length || 0;
    console.log(`Encontrados ${promptsCount} prompts nas categorias a serem deletadas`);
    
    // Se houver prompts, deleta-os primeiro
    if (promptsCount > 0) {
      const { error: deletePromptsError } = await deletePromptsInCategories(allCategoryIds);
      if (deletePromptsError) {
        console.error('Erro ao deletar prompts:', deletePromptsError);
        throw deletePromptsError;
      }
      console.log(`${promptsCount} prompts deletados com sucesso`);
    }

    // Agora deleta a categoria e todas as suas subcategorias
    const { error } = await supabase
      .from('categories')
      .delete()
      .in('id', allCategoryIds);

    if (error) {
      console.error('Erro do Supabase ao deletar categorias:', error);
      throw error;
    }

    return { data: null, error: null, promptsCount };
  } catch (error) {
    console.error('Erro ao deletar categorias:', error);
    return { data: null, error, promptsCount: 0 };
  }
};

export const forceDeleteCategoryById = async (id: string) => {
  try {
    // 1. Find all subcategories recursively
    const subcategoryIds = await getAllSubcategoriesIds(id);
    const allCategoryIds = [id, ...subcategoryIds];
    
    console.log('Força bruta: Tentando deletar categorias:', allCategoryIds);

    // 2. Find all prompts in these categories
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, category_id')
      .in('category_id', allCategoryIds);
    
    if (promptsError) {
      console.error('Erro ao buscar prompts para deleção:', promptsError);
    }
    
    const promptIds = prompts ? prompts.map(p => p.id) : [];
    console.log(`Força bruta: Encontrados ${promptIds.length} prompts para remoção`);

    // 3. Delete all comments for these prompts
    if (promptIds.length > 0) {
      console.log('Força bruta: Removendo comentários para prompts');
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('prompt_id', promptIds);
      
      if (commentsError) {
        console.error('Erro ao deletar comentários:', commentsError);
      }
      
      // 4. Delete the prompts themselves
      console.log('Força bruta: Removendo prompts');
      const { error: promptsDeleteError } = await supabase
        .from('prompts')
        .delete()
        .in('id', promptIds);
        
      if (promptsDeleteError) {
        console.error('Erro ao deletar prompts:', promptsDeleteError);
      }
    }

    // 5. Delete subcategories from bottom up (children first)
    for (const subId of subcategoryIds.reverse()) {
      console.log('Força bruta: Removendo subcategoria:', subId);
      const { error: subDeleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', subId);
        
      if (subDeleteError) {
        console.error(`Erro ao deletar subcategoria ${subId}:`, subDeleteError);
      }
      
      // Give a small delay between operations to avoid race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 6. Finally delete the main category
    console.log('Força bruta: Removendo categoria principal:', id);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar categoria principal:', error);
      throw error;
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Erro crítico na remoção força bruta:', error);
    return { data: null, error };
  }
};
