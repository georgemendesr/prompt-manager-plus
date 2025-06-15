import { supabase } from "../base/supabaseService";
import type { RawCategory } from "@/types/rawCategory";

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
  try {
    console.log('Iniciando atualização de categoria com valores:', { id, name, parentId });
    
    // Verificar se a categoria existe antes de tentar atualizar
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      console.error('Erro ao verificar categoria existente:', checkError);
      return { error: checkError };
    }
    
    console.log('Categoria atual no banco:', existingCategory);
    
    // Preparar os dados da atualização
    const updateData: any = {};
    
    // Adicionar campos apenas se forem diferentes dos valores atuais
    if (name && name.trim() !== existingCategory.name) {
      updateData.name = name.trim();
    }
    
    // Verificar se parentId é diferente do atual
    const currentParentId = existingCategory.parent_id;
    if (parentId !== undefined && parentId !== currentParentId) {
      updateData.parent_id = parentId;
    }
    
    // Se não há mudanças, retornar sucesso imediatamente
    if (Object.keys(updateData).length === 0) {
      console.log('Nenhuma mudança detectada, retornando sucesso');
      return { error: null };
    }
    
    console.log('Atualizando categoria com dados:', updateData);
    
    // Executar a atualização
    const result = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id);
      
    if (result.error) {
      console.error('Erro ao atualizar categoria:', result.error);
      
      // Tentar atualizar só o nome como último recurso
      if (updateData.name) {
        console.log('Tentando atualizar apenas o nome como último recurso');
        const nameOnlyResult = await supabase
          .from('categories')
          .update({ name: updateData.name })
          .eq('id', id);
          
        if (nameOnlyResult.error) {
          console.error('Erro ao atualizar apenas o nome:', nameOnlyResult.error);
          return { error: result.error };
        } else {
          console.log('✅ Atualização do nome bem-sucedida!');
          return { error: null };
        }
      }
      
      return { error: result.error };
    }
    
    console.log('✅ Atualização bem-sucedida!');
    return { error: null };
  } catch (error) {
    console.error('Erro crítico ao atualizar categoria:', error);
    return { data: null, error };
  }
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

// Função de diagnóstico para examinar a estrutura da tabela
export const diagnoseCategories = async () => {
  try {
    console.log('🔍 Iniciando diagnóstico da tabela de categorias...');
    
    // Buscar uma categoria qualquer para analisar sua estrutura
    const { data: sampleCategory, error: sampleError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)
      .single();
      
    if (sampleError) {
      console.error('Erro ao buscar categoria de exemplo:', sampleError);
    } else {
      console.log('Estrutura de uma categoria:', sampleCategory);
      console.log('Chaves disponíveis:', Object.keys(sampleCategory));
    }
    
    // Tentar uma operação simples de atualização
    const testId = 'diagnose-test-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('categories')
      .insert({ name: 'Teste Diagnóstico', id: testId })
      .select();
      
    if (insertError) {
      console.error('Erro ao inserir categoria de teste:', insertError);
    } else {
      console.log('Categoria de teste criada:', insertData);
      
      // Tentar atualizar
      const { error: updateError } = await supabase
        .from('categories')
        .update({ name: 'Teste Atualizado' })
        .eq('id', testId);
        
      if (updateError) {
        console.error('Erro ao atualizar categoria de teste:', updateError);
      } else {
        console.log('✅ Atualização de teste bem-sucedida!');
        
        // Limpar
        await supabase.from('categories').delete().eq('id', testId);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    return false;
  }
};
