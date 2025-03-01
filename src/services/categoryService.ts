import { supabase } from "@/integrations/supabase/client";

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

export const fetchPrompts = async () => {
  try {
    return await supabase
      .from('prompts')
      .select('id, text, category_id, rating, background_color, created_at');
  } catch (error) {
    console.error('Erro ao buscar prompts:', error);
    return { data: null, error };
  }
};

export const fetchComments = async () => {
  try {
    return await supabase
      .from('comments')
      .select('id, prompt_id, text, created_at');
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
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

export const getPromptsInCategories = async (categoryIds: string[]): Promise<number> => {
  if (categoryIds.length === 0) return 0;
  
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('id', { count: 'exact' })
      .in('category_id', categoryIds);
      
    if (error) throw error;
    
    return data?.length || 0;
  } catch (error) {
    console.error('Erro ao verificar prompts nas categorias:', error);
    return 0;
  }
};

export const deletePromptsInCategories = async (categoryIds: string[]): Promise<{error: any | null}> => {
  if (categoryIds.length === 0) return { error: null };
  
  try {
    // Get all prompts in these categories
    const { data: prompts, error: fetchError } = await supabase
      .from('prompts')
      .select('id')
      .in('category_id', categoryIds);
      
    if (fetchError) throw fetchError;
    
    if (prompts && prompts.length > 0) {
      // Delete all comments for these prompts first
      const promptIds = prompts.map(p => p.id);
      
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('prompt_id', promptIds);
        
      if (commentsError) throw commentsError;
      
      // Then delete the prompts
      const { error: promptsError } = await supabase
        .from('prompts')
        .delete()
        .in('category_id', categoryIds);
        
      if (promptsError) throw promptsError;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Erro ao deletar prompts nas categorias:', error);
    return { error };
  }
};

export const deleteCategoryFromDb = async (id: string) => {
  try {
    // Primeiro, obtém todos os IDs das subcategorias recursivamente
    const subcategoryIds = await getAllSubcategoriesIds(id);
    
    // Adiciona o ID da categoria atual
    const allCategoryIds = [...subcategoryIds, id];
    
    console.log('Tentando deletar categorias:', allCategoryIds);
    
    // Verifica quantos prompts estão nas categorias
    const promptsCount = await getPromptsInCategories(allCategoryIds);
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
    // Obter todas as subcategorias
    const subcategoryIds = await getAllSubcategoriesIds(id);
    const allCategoryIds = [...subcategoryIds, id];
    console.log('Força bruta: Tentando deletar categorias:', allCategoryIds);

    // 1. Primeiro remover todos os comentários de prompts nestas categorias
    const { data: prompts } = await supabase
      .from('prompts')
      .select('id')
      .in('category_id', allCategoryIds);

    if (prompts && prompts.length > 0) {
      const promptIds = prompts.map(p => p.id);
      console.log('Força bruta: Removendo comentários para prompts:', promptIds);

      // Remover comentários primeiro
      await supabase
        .from('comments')
        .delete()
        .in('prompt_id', promptIds);
    }

    // 2. Remover todos os prompts
    console.log('Força bruta: Removendo prompts das categorias');
    await supabase
      .from('prompts')
      .delete()
      .in('category_id', allCategoryIds);

    // 3. Remover as subcategorias de baixo para cima
    for (const subId of subcategoryIds.reverse()) {
      console.log('Força bruta: Removendo subcategoria:', subId);
      await supabase
        .from('categories')
        .delete()
        .eq('id', subId);
    }

    // 4. Finalmente remover a categoria principal
    console.log('Força bruta: Removendo categoria principal:', id);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Erro na remoção força bruta:', error);
    return { data: null, error };
  }
};

export const deletePromptFromDb = async (id: string) => {
  try {
    // Primeiro deletamos todos os comentários associados ao prompt
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('prompt_id', id);
    
    if (commentsError) {
      console.error('Erro ao deletar comentários:', commentsError);
      throw commentsError;
    }
    
    // Depois deletamos o prompt
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao deletar prompt:', error);
      throw error;
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Erro ao deletar prompt:', error);
    return { data: null, error };
  }
};

export const updatePromptInDb = async (id: string, text: string) => {
  try {
    const { error } = await supabase
      .from('prompts')
      .update({ text: text.trim() })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar prompt:', error);
      throw error;
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Erro ao atualizar prompt:', error);
    return { data: null, error };
  }
};
