import { supabase } from "@/integrations/supabase/client";

export const addPromptRating = async (promptId: string, rating: number) => {
  try {
    console.log(`[STAR] Adicionando avaliação ${rating} para prompt ${promptId}`);
    
    // Usando método direto sem RPC já que a função add_rating parece não estar disponível
    // 1. Primeiro, inserir a avaliação
    const { error: insertError } = await supabase
      .from('prompt_ratings')
      .insert({
        prompt_id: promptId,
        rating: rating,
        user_id: null // Permitir avaliações anônimas
      });
    
    if (insertError) {
      console.error('[STAR] Erro ao inserir avaliação:', insertError);
      throw insertError;
    }
    
    // 2. Consultar todas as avaliações para este prompt
    const { data: ratings, error: ratingsError } = await supabase
      .from('prompt_ratings')
      .select('rating')
      .eq('prompt_id', promptId);
    
    if (ratingsError) {
      console.error('[STAR] Erro ao buscar avaliações:', ratingsError);
      throw ratingsError;
    }
    
    // 3. Calcular a média e contagem
    const count = ratings?.length || 0;
    const sum = ratings?.reduce((acc, curr) => acc + curr.rating, 0) || 0;
    const average = count > 0 ? sum / count : 0;
    
    console.log(`[STAR] Calculado: média ${average.toFixed(2)}, contagem ${count}`);
    
    // 4. Atualizar o prompt com os novos valores
    const { data: updatedPrompt, error: updateError } = await supabase
      .from('prompts')
      .update({
        rating_average: average,
        rating_count: count
      })
      .eq('id', promptId)
      .select('rating_average, rating_count')
      .single();
    
    if (updateError) {
      console.error('[STAR] Erro ao atualizar prompt:', updateError);
      throw updateError;
    }
    
    console.log('[STAR] Prompt atualizado com sucesso:', updatedPrompt);
    
    return { 
      data: updatedPrompt, 
      error: null 
    };
  } catch (error) {
    console.error('[STAR] Erro ao adicionar avaliação:', error);
    return { data: null, error };
  }
};

export const incrementCopyCount = async (promptId: string) => {
  try {
    console.log(`[COPY] Incrementando cópia para prompt ${promptId}`);
    
    // 1. Primeiro, obter o valor atual do contador
    const { data: currentData, error: getError } = await supabase
      .from('prompts')
      .select('copy_count')
      .eq('id', promptId)
      .single();
    
    if (getError) {
      console.error('[COPY] Erro ao buscar contador atual:', getError);
      throw getError;
    }
    
    // 2. Incrementar o contador usando o valor atual
    const currentCount = currentData?.copy_count || 0;
    const newCount = currentCount + 1;
    
    // 3. Atualizar o prompt com o novo contador
    const { data, error: updateError } = await supabase
      .from('prompts')
      .update({
        copy_count: newCount
      })
      .eq('id', promptId)
      .select('copy_count')
      .single();
    
    if (updateError) {
      console.error('[COPY] Erro ao incrementar contador:', updateError);
      throw updateError;
    }
    
    console.log(`[COPY] Contador incrementado: ${currentCount} → ${data?.copy_count}`);
    return { data, error: null };
  } catch (error) {
    console.error('[COPY] Erro ao incrementar contador:', error);
    return { error };
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
    
    return { 
      data, 
      error: null 
    };
  } catch (error) {
    console.error('[STATS] Erro ao buscar estatísticas:', error);
    return { data: null, error };
  }
};
