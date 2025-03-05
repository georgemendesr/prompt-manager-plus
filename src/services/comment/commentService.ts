
import { supabase } from "../base/supabaseService";

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

export const addCommentToDb = async (promptId: string, text: string) => {
  try {
    // Se for uma alteração de cor, atualizar também na tabela de prompts
    if (text.startsWith('[color:')) {
      const backgroundColor = text.replace('[color:', '').replace(']', '');
      const { error: promptError } = await supabase
        .from('prompts')
        .update({ background_color: backgroundColor })
        .eq('id', promptId);

      if (promptError) throw promptError;
    }

    return await supabase
      .from('comments')
      .insert([{ prompt_id: promptId, text }])
      .select()
      .single();
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return { data: null, error };
  }
};

export const deleteCommentsForPrompt = async (promptId: string) => {
  try {
    return await supabase
      .from('comments')
      .delete()
      .eq('prompt_id', promptId);
  } catch (error) {
    console.error('Erro ao deletar comentários:', error);
    return { data: null, error };
  }
};

export const deleteCommentsForPrompts = async (promptIds: string[]) => {
  if (promptIds.length === 0) return { error: null };
  
  try {
    return await supabase
      .from('comments')
      .delete()
      .in('prompt_id', promptIds);
  } catch (error) {
    console.error('Erro ao deletar comentários em massa:', error);
    return { error };
  }
};
