
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
