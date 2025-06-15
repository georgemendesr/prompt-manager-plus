import { supabase } from "@/integrations/supabase/client";
import type { TextPromptInsert } from "@/types/textPrompt";

export const addTextPrompt = async (prompt: TextPromptInsert) => {
  try {
    console.log('Adicionando prompt de texto:', prompt);
    
    // Confirmar que o category_id não está vazio
    if (!prompt.category_id) {
      throw new Error('ID da categoria é obrigatório');
    }
    
    // Usar exclusivamente a tabela text_prompts para os novos prompts
    const { data, error } = await supabase
      .from('text_prompts')
      .insert({
        category_id: prompt.category_id,
        title: prompt.title || 'Sem título',
        blocks: prompt.blocks // Esta tabela aceita blocos como JSON
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar prompt de texto:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('Prompt adicionado com sucesso:', data);
    return data;
  } catch (err) {
    console.error('Erro ao adicionar prompt de texto:', err instanceof Object ? JSON.stringify(err, null, 2) : err);
    throw err;
  }
};

export const fetchTextPrompts = async () => {
  try {
    // Buscar da tabela text_prompts
    const { data, error } = await supabase
      .from('text_prompts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar prompts de texto:', JSON.stringify(error, null, 2));
      
      // Se der erro 404, a tabela pode não existir ainda
      if (error.code === '42P01' || error.status === 404) {
        console.log('Tabela text_prompts não encontrada, retornando lista vazia');
        return [];
      }
      
      throw error;
    }
    
    console.log('Dados encontrados na tabela text_prompts:', data?.length || 0);
    
    // Converter do formato text_prompts para o formato esperado pela UI
    const formattedData = data?.map(item => ({
      id: item.id,
      title: item.title || '',
      category_id: item.category_id,
      blocks: Array.isArray(item.blocks) ? item.blocks : [],
      created_at: item.created_at
    })) || [];
    
    return formattedData;
  } catch (err) {
    console.error('Erro ao buscar prompts de texto:', err instanceof Object ? JSON.stringify(err, null, 2) : err);
    // Retornar lista vazia em caso de erro para não quebrar a UI
    return [];
  }
};

// Verificar tabela
export const createTextPromptsTable = async () => {
  try {
    console.log('Verificando tabela text_prompts...');
    const { error } = await supabase
      .from('text_prompts')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('Tabela text_prompts existe e está funcionando');
      return { success: true, message: 'Usando tabela text_prompts' };
    }
    
    console.log('Tabela text_prompts não encontrada ou erro de acesso:', JSON.stringify(error, null, 2));
    return { success: false, message: 'Tabela text_prompts não encontrada' };
  } catch (err) {
    console.error('Erro ao verificar tabela:', err instanceof Object ? JSON.stringify(err, null, 2) : err);
    return { success: false, message: 'Erro ao verificar tabela' };
  }
}; 