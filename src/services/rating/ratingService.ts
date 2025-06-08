
import { supabase } from "@/integrations/supabase/client";

export const addPromptRating = async (promptId: string, rating: number) => {
  try {
    const { data, error } = await supabase
      .from('prompt_ratings')
      .insert({
        prompt_id: promptId,
        rating: rating,
        user_id: null // Para permitir avaliações anônimas
      });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    return { data: null, error };
  }
};

export const incrementCopyCount = async (promptId: string) => {
  try {
    const { data, error } = await supabase.rpc('increment_copy_count', {
      prompt_uuid: promptId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao incrementar contador de cópias:', error);
    return { data: null, error };
  }
};

export const getPromptStats = async (promptId: string) => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('rating_average, rating_count, copy_count')
      .eq('id', promptId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do prompt:', error);
    return { data: null, error };
  }
};
