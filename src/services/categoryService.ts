// Este arquivo serve como agregador de funcionalidades de serviço de categoria
// para manter compatibilidade com código existente

import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Serviço unificado de categorias por seção
export async function addCategory(section: 'text'|'image'|'music', name: string, parentId?: string) {
  try {
    const table = `${section}_categories`;
    const { data, error } = await supabase
      .from(table)
      .insert([{ 
        name, 
        parent_id: parentId ?? null 
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao adicionar categoria de ${section}:`, error);
    return { data: null, error };
  }
}

export const fetchCategories = async (type: 'text' | 'image' | 'music') => {
  try {
    // Determinar a tabela correta com base no tipo
    const table = `${type}_categories`;
    
    // Buscar da tabela específica
    const { data, error } = await supabase
      .from(table as any)
      .select('*')
      .order('name');
    
    // Verificar erros e registros duplicados
    if (error) {
      console.error(`Erro ao buscar categorias de ${type}:`, error);
      return { data: [], error };
    }
    
    // Deduplicar por ID
    if (data && data.length > 0) {
      console.log(`Encontradas ${data.length} categorias em ${table}`);
      
      // Usar um Map para garantir unicidade por ID
      const uniqueCategories = new Map();
      data.forEach(cat => {
        if (!uniqueCategories.has(cat.id)) {
          uniqueCategories.set(cat.id, cat);
        }
      });
      
      return { 
        data: Array.from(uniqueCategories.values()), 
        error: null 
      };
    }
    
    return { data, error };
  } catch (err) {
    console.error(`Erro ao buscar categorias de ${type}:`, err);
    return { data: [], error: err as any };
  }
};

export async function updateCategory(section: 'text'|'image'|'music', id: string, name: string, parentId?: string) {
  try {
    const table = `${section}_categories`;
    const { data, error } = await supabase
      .from(table)
      .update({ 
        name, 
        parent_id: parentId ?? null 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar categoria de ${section}:`, error);
    return { data: null, error };
  }
}

export async function deleteCategory(section: 'text'|'image'|'music', id: string) {
  try {
    const table = `${section}_categories`;
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Erro ao excluir categoria de ${section}:`, error);
    return { error };
  }
}

// Funções de compatibilidade para código legado
export { 
  fetchCategories as fetchLegacyCategories,
  addCategoryToDb,
  updateCategoryInDb,
  getAllSubcategoriesIds,
  diagnoseCategories
} from './category/categoryFetchService';

export {
  deleteCategoryFromDb,
  forceDeleteCategoryById
} from './category/categoryDeleteService';

export {
  fetchPrompts,
  getPromptsInCategories,
  deletePromptsInCategories,
  deletePromptFromDb,
  updatePromptInDb
} from './prompt/promptService';

export {
  fetchComments
} from './comment/commentService';
