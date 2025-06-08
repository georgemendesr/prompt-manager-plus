import { supabase } from "../base/supabaseService";
import type { DatabaseError } from "@/types/database";

export const fetchPrompts = async () => {
  try {
    return await supabase
      .from('prompts')
      .select('id, text, category_id, rating, background_color, tags, created_at, rating_average, rating_count, copy_count');
  } catch (error) {
    console.error('Erro ao buscar prompts:', error);
    return { data: null, error };
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

export const deletePromptsInCategories = async (
  categoryIds: string[]
): Promise<{ error: DatabaseError | null }> => {
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
  } catch (error: unknown) {
    console.error('Erro ao deletar prompts nas categorias:', error);
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : String(error);
    return { error: { message } };
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

// Função para converter prompts para formato CSV
export const convertPromptsToCSV = (prompts: Array<{
  text: string;
  category: string;
  rating: number;
  comments: string[];
  tags: string[];
  createdAt: string;
}>): string => {
  // Headers
  let csv = "Texto,Categoria,Avaliação,Comentários,Tags,Data de Criação\n";
  
  // Adicionar cada linha
  prompts.forEach(prompt => {
    // Escapar aspas nos campos de texto e comentários
    const escapedText = prompt.text.replace(/"/g, '""');
    const escapedComments = prompt.comments.join(" | ").replace(/"/g, '""');
    const escapedTags = prompt.tags.join(', ').replace(/"/g, '""');

    csv += `"${escapedText}","${prompt.category}",${prompt.rating},"${escapedComments}","${escapedTags}","${prompt.createdAt}"\n`;
  });
  
  return csv;
};
