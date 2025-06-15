
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ratePrompt = async (promptId: string, rating: number, userId?: string) => {
  try {
    console.log(`🔄 Avaliando prompt ${promptId} com ${rating} estrelas`);
    
    // Verificar se já existe uma avaliação do usuário
    const { data: existingRating, error: fetchError } = await supabase
      .from('prompt_ratings')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', userId || 'anonymous')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingRating) {
      // Atualizar avaliação existente
      const { error } = await supabase
        .from('prompt_ratings')
        .update({ rating })
        .eq('id', existingRating.id);

      if (error) throw error;
    } else {
      // Criar nova avaliação
      const { error } = await supabase
        .from('prompt_ratings')
        .insert({
          prompt_id: promptId,
          user_id: userId || 'anonymous',
          rating
        });

      if (error) throw error;
    }

    // Recalcular média usando a função do banco
    const { error: calcError } = await supabase
      .rpc('calculate_prompt_rating_average', { prompt_uuid: promptId });

    if (calcError) {
      console.error('Erro ao recalcular média:', calcError);
      throw calcError;
    }

    toast.success('Avaliação salva com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao avaliar prompt:', error);
    toast.error('Erro ao salvar avaliação');
    throw error;
  }
};

export const getUserRating = async (promptId: string, userId?: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('prompt_ratings')
      .select('rating')
      .eq('prompt_id', promptId)
      .eq('user_id', userId || 'anonymous')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.rating || null;
  } catch (error) {
    console.error('Erro ao buscar avaliação do usuário:', error);
    return null;
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
      average: data.rating_average || 0,
      count: data.rating_count || 0,
      copyCount: data.copy_count || 0
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do prompt:', error);
    return { average: 0, count: 0, copyCount: 0 };
  }
};

export const incrementCopyCount = async (promptId: string) => {
  try {
    console.log(`🔄 Incrementando contador de cópias para prompt ${promptId}`);
    
    const { error } = await supabase
      .rpc('increment_copy_count', { prompt_uuid: promptId });

    if (error) {
      console.error('Erro ao incrementar contador:', error);
      throw error;
    }

    console.log('✅ Contador incrementado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao incrementar contador de cópias:', error);
    throw error;
  }
};
