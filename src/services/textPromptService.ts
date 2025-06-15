
import { supabase } from "@/integrations/supabase/client";
import type { TextPrompt, TextPromptInsert, TextPromptUpdate } from "@/types/textPrompt";

export const fetchTextPrompts = async (): Promise<TextPrompt[]> => {
  const { data, error } = await supabase
    .from('text_prompts' as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar prompts de texto:', error);
    throw new Error(`Erro ao buscar prompts de texto: ${error.message}`);
  }

  return (data as any) || [];
};

export const addTextPrompt = async (prompt: TextPromptInsert): Promise<TextPrompt> => {
  const { data, error } = await supabase
    .from('text_prompts' as any)
    .insert([prompt])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar prompt de texto:', error);
    throw new Error(`Erro ao adicionar prompt de texto: ${error.message}`);
  }

  return data as any;
};

export const updateTextPrompt = async (id: string, updates: TextPromptUpdate): Promise<TextPrompt> => {
  const { data, error } = await supabase
    .from('text_prompts' as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar prompt de texto:', error);
    throw new Error(`Erro ao atualizar prompt de texto: ${error.message}`);
  }

  return data as any;
};

export const deleteTextPrompt = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('text_prompts' as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar prompt de texto:', error);
    throw new Error(`Erro ao deletar prompt de texto: ${error.message}`);
  }
};
