
import { supabase } from "@/integrations/supabase/client";

export const addPromptRating = async (promptId: string, rating: number) => {
  try {
    console.log('🌟 Adicionando avaliação:', { promptId, rating });
    
    // Inserir nova avaliação
    const { data, error } = await supabase
      .from('prompt_ratings')
      .insert({
        prompt_id: promptId,
        rating: rating,
        user_id: null // Para permitir avaliações anônimas
      });
    
    if (error) {
      console.error('❌ Erro ao inserir avaliação:', error);
      throw error;
    }

    console.log('✅ Avaliação inserida, recalculando média...');
    
    // Recalcular média usando a função do banco
    const { error: updateError } = await supabase.rpc('calculate_prompt_rating_average', {
      prompt_uuid: promptId
    });
    
    if (updateError) {
      console.error('❌ Erro ao recalcular média:', updateError);
      throw updateError;
    }

    console.log('✅ Média recalculada com sucesso');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro completo ao adicionar avaliação:', error);
    return { data: null, error };
  }
};

export const incrementCopyCount = async (promptId: string) => {
  try {
    console.log('📄 Incrementando contador de cópias para:', promptId);
    
    const { data, error } = await supabase.rpc('increment_copy_count', {
      prompt_uuid: promptId
    });
    
    if (error) {
      console.error('❌ Erro ao incrementar contador:', error);
      throw error;
    }

    console.log('✅ Contador de cópias incrementado');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erro ao incrementar contador de cópias:', error);
    return { data: null, error };
  }
};

export const getPromptStats = async (promptId: string) => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('rating_average, rating_count, copy_count, simple_id')
      .eq('id', promptId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do prompt:', error);
    return { data: null, error };
  }
};
