<<<<<<< HEAD
import { supabase } from "@/integrations/supabase/client";
import type { TextCategory } from "@/types/textCategory";

// Função para organizar categorias em hierarquia
const buildTextCategoryTree = (categories: any[]): TextCategory[] => {
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    parentId: cat.parent_id,
    type: 'text',
    created_at: cat.created_at,
  }));
};

// Cache para armazenar IDs já processados
const processedIds = new Set<string>();

export const fetchTextCategories = async (): Promise<TextCategory[]> => {
  try {
    // Limpar o cache antes de cada busca
    processedIds.clear();
    
    // Tentar primeiro usando o endpoint normal
    const { data, error } = await (supabase as any)
      .from('text_categories')
      .select('*')
      .order('name');
    
    if (!error && data?.length > 0) {
      // Armazenar IDs no cache
      data.forEach((cat: any) => processedIds.add(cat.id));
      console.log(`Encontradas ${data.length} categorias na tabela text_categories`);
      return buildTextCategoryTree(data);
    }
    
    console.log('Tentando endpoints alternativos para categorias de texto');
    
    // Tentar com categories de legado, filtrando para tipos específicos
    // Primeiro tentar categorias de tipo 'text'
    const { data: textData, error: textError } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('type', 'text')
      .order('name');
    
    // Depois tentar categorias sem tipo definido
    const { data: nullData, error: nullError } = await (supabase as any)
      .from('categories')
      .select('*')
      .is('type', null)
      .order('name');
    
    // Combinar os resultados, filtrando categorias já existentes
    if ((!textError || !nullError) && (textData?.length > 0 || nullData?.length > 0)) {
      console.log('Usando tabela legada categories (filtradas para texto)');
      
      // Filtrar para remover categorias já processadas
      const filteredTextData = textData?.filter((cat: any) => !processedIds.has(cat.id)) || [];
      const filteredNullData = nullData?.filter((cat: any) => !processedIds.has(cat.id)) || [];
      
      // Combinar os resultados
      const combinedData = [...filteredTextData, ...filteredNullData];
      
      // Remover duplicatas por ID
      const uniqueData = combinedData.reduce((acc: any[], current: any) => {
        if (!acc.some(item => item.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      console.log(`Adicionadas ${uniqueData.length} categorias da tabela legada`);
      return buildTextCategoryTree(uniqueData);
    }
    
    // Se não houver dados, retornar array vazio
    console.log('Nenhum dado encontrado, retornando array vazio');
    return [];
  } catch (err) {
    console.error('Erro ao buscar categorias de texto:', err);
    return [];
  }
};

export const addTextCategory = async (name: string, parentId?: string) => {
  try {
    // Tentar primeiro na tabela correta
    const { data, error } = await (supabase as any)
      .from('text_categories')
      .insert({
        name,
        parent_id: parentId || null,
        type: 'text'
      })
      .select()
      .single();

    if (!error) {
      return data;
    }

    // Se falhar, tentar com tabela legada - vamos tentar sem o campo type
    console.log('Tentando adicionar à tabela legada categories (sem type)');
    const { data: legacyData, error: legacyError } = await (supabase as any)
      .from('categories')
      .insert({
        name,
        parent_id: parentId || null
      })
      .select()
      .single();

    if (!legacyError) {
      return legacyData;
    }

    throw error || legacyError;
  } catch (err) {
    console.error('Erro ao adicionar categoria de texto:', err);
    throw err;
  }
=======

import { supabase } from "@/integrations/supabase/client";
import type { TextCategory } from "@/types/textCategory";

export const fetchTextCategories = async (): Promise<TextCategory[]> => {
  const { data, error } = await (supabase as any)
    .from('text_categories')
    .select('*')
    .order('name');

  if (error) throw error;

  return buildTextCategoryTree(data || []);
};

export const addTextCategory = async (name: string, parentId?: string) => {
  const { data, error } = await (supabase as any)
    .from('text_categories')
    .insert({
      name,
      parent_id: parentId || null,
      type: 'text'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
};

export const updateTextCategory = async (id: string, name: string, parentId?: string) => {
  const { data, error } = await (supabase as any)
    .from('text_categories')
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

export const deleteTextCategory = async (id: string) => {
  const { error } = await (supabase as any)
    .from('text_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
<<<<<<< HEAD
=======

const buildTextCategoryTree = (categories: any[], parentId: string | null = null): TextCategory[] => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      id: category.id,
      name: category.name,
      parentId: category.parent_id,
      type: 'text' as const,
      created_at: category.created_at,
      subcategories: buildTextCategoryTree(categories, category.id)
    }));
};
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
