
import { supabase } from "@/integrations/supabase/client";
import type { ImagePrompt, ImagePromptInsert, ImagePromptUpdate } from "@/types/imagePrompt";

export const fetchImagePrompts = async (): Promise<ImagePrompt[]> => {
  const { data, error } = await supabase
    .from('image_prompts' as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar prompts de imagem:', error);
    throw new Error(`Erro ao buscar prompts de imagem: ${error.message}`);
  }

  return (data as any) || [];
};

export const addImagePrompt = async (prompt: ImagePromptInsert): Promise<ImagePrompt> => {
  const { data, error } = await supabase
    .from('image_prompts' as any)
    .insert([prompt])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar prompt de imagem:', error);
    throw new Error(`Erro ao adicionar prompt de imagem: ${error.message}`);
  }

  return data as any;
};

export const updateImagePrompt = async (id: string, updates: ImagePromptUpdate): Promise<ImagePrompt> => {
  const { data, error } = await supabase
    .from('image_prompts' as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar prompt de imagem:', error);
    throw new Error(`Erro ao atualizar prompt de imagem: ${error.message}`);
  }

  return data as any;
};

export const deleteImagePrompt = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('image_prompts' as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar prompt de imagem:', error);
    throw new Error(`Erro ao deletar prompt de imagem: ${error.message}`);
  }
};
