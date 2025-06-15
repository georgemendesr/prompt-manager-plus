import { supabase } from "@/integrations/supabase/client";

// Tipo para os dados do prompt com estatísticas
export type PromptStat = {
  id: string;
  uniqueId?: string;
  text: string;
  category_id: string;
  category_name?: string;
  rating_average: number;
  rating_count: number;
  copy_count: number;
  created_at: string;
  performance_score: number;
};

export type CategoryStat = {
  id: string;
  name: string;
  promptCount: number;
  avgRating: number;
  engagement: number; // rating_count + copy_count
};

// Função para calcular o score de desempenho
export const calculatePerformanceScore = (
  ratingAverage: number, 
  ratingCount: number, 
  copyCount: number
): number => {
  return ratingAverage * ratingCount * copyCount;
};

// Buscar estatísticas dos prompts
export const fetchPromptStats = async (): Promise<PromptStat[]> => {
  try {
    // Buscar prompts com suas estatísticas
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select(`
        id,
        text,
        category_id,
        categories(name),
        rating_average,
        rating_count,
        copy_count,
        created_at,
        simple_id
      `)
      .order('rating_average', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Processar os dados recebidos
    const processedPrompts: PromptStat[] = prompts.map(p => {
      // Calcular performance_score = rating_average × rating_count × copy_count
      const ratingAvg = p.rating_average || 0;
      const ratingCount = p.rating_count || 0;
      const copyCount = p.copy_count || 0;
      const performanceScore = calculatePerformanceScore(ratingAvg, ratingCount, copyCount);
      
      return {
        id: p.id,
        uniqueId: p.simple_id || p.id.substring(0, 8),
        text: p.text,
        category_id: p.category_id,
        category_name: p.categories?.name,
        rating_average: ratingAvg,
        rating_count: ratingCount,
        copy_count: copyCount,
        created_at: p.created_at,
        performance_score: performanceScore
      };
    });
    
    return processedPrompts;
  } catch (error) {
    console.error('Erro ao buscar estatísticas de prompts:', error);
    throw error;
  }
};

// Buscar prompts por termo de pesquisa
export const searchPromptsByTerm = async (searchTerm: string): Promise<PromptStat[]> => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const term = searchTerm.trim();

    // Buscar prompts que contenham o termo no texto
    // Simplificamos a consulta para evitar problemas de sintaxe
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        id,
        text,
        category_id,
        categories(name),
        rating_average,
        rating_count,
        copy_count,
        created_at,
        simple_id
      `)
      .textSearch('text', term);
    
    if (error) {
      console.error('Erro ao buscar prompts:', error);
      throw error;
    }
    
    // Se não encontrou resultados com pesquisa de texto, tentar com ilike
    if (!data || data.length === 0) {
      const { data: ilikeData, error: ilikeError } = await supabase
        .from('prompts')
        .select(`
          id,
          text,
          category_id,
          categories(name),
          rating_average,
          rating_count,
          copy_count,
          created_at,
          simple_id
        `)
        .ilike('text', `%${term}%`);
      
      if (ilikeError) {
        console.error('Erro ao buscar prompts com ilike:', ilikeError);
        throw ilikeError;
      }
      
      // Processar os dados recebidos
      const processedPrompts: PromptStat[] = (ilikeData || []).map(p => {
        // Calcular performance_score = rating_average × rating_count × copy_count
        const ratingAvg = p.rating_average || 0;
        const ratingCount = p.rating_count || 0;
        const copyCount = p.copy_count || 0;
        const performanceScore = calculatePerformanceScore(ratingAvg, ratingCount, copyCount);
        
        return {
          id: p.id,
          uniqueId: p.simple_id || p.id.substring(0, 8),
          text: p.text,
          category_id: p.category_id,
          category_name: p.categories?.name,
          rating_average: ratingAvg,
          rating_count: ratingCount,
          copy_count: copyCount,
          created_at: p.created_at,
          performance_score: performanceScore
        };
      });
      
      // Ordenar por score de desempenho
      processedPrompts.sort((a, b) => b.performance_score - a.performance_score);
      
      return processedPrompts;
    }
    
    // Processar os dados recebidos da consulta textSearch
    const processedPrompts: PromptStat[] = (data || []).map(p => {
      // Calcular performance_score = rating_average × rating_count × copy_count
      const ratingAvg = p.rating_average || 0;
      const ratingCount = p.rating_count || 0;
      const copyCount = p.copy_count || 0;
      const performanceScore = calculatePerformanceScore(ratingAvg, ratingCount, copyCount);
      
      return {
        id: p.id,
        uniqueId: p.simple_id || p.id.substring(0, 8),
        text: p.text,
        category_id: p.category_id,
        category_name: p.categories?.name,
        rating_average: ratingAvg,
        rating_count: ratingCount,
        copy_count: copyCount,
        created_at: p.created_at,
        performance_score: performanceScore
      };
    });
    
    // Ordenar por score de desempenho
    processedPrompts.sort((a, b) => b.performance_score - a.performance_score);
    
    return processedPrompts;
  } catch (error) {
    console.error('Erro ao buscar prompts por termo:', error);
    throw error;
  }
};

// Buscar lista de categorias
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

// Calcular estatísticas por categoria
export const calculateCategoryStats = (prompts: PromptStat[]): CategoryStat[] => {
  const statsByCategory = new Map<string, {
    id: string,
    name: string,
    promptCount: number,
    totalRating: number,
    ratingCount: number,
    copyCount: number
  }>();
  
  // Agrupar prompts por categoria
  prompts.forEach(prompt => {
    if (!prompt.category_id || !prompt.category_name) return;
    
    const stats = statsByCategory.get(prompt.category_id) || {
      id: prompt.category_id,
      name: prompt.category_name,
      promptCount: 0,
      totalRating: 0,
      ratingCount: 0,
      copyCount: 0
    };
    
    stats.promptCount += 1;
    stats.totalRating += prompt.rating_average || 0;
    stats.ratingCount += prompt.rating_count || 0;
    stats.copyCount += prompt.copy_count || 0;
    
    statsByCategory.set(prompt.category_id, stats);
  });
  
  // Converter Map para array e calcular média
  const categoryStatsArray = Array.from(statsByCategory.values()).map(stat => ({
    id: stat.id,
    name: stat.name,
    promptCount: stat.promptCount,
    avgRating: stat.promptCount > 0 ? stat.totalRating / stat.promptCount : 0,
    engagement: stat.ratingCount + stat.copyCount
  }));
  
  // Ordenar por engajamento
  categoryStatsArray.sort((a, b) => b.engagement - a.engagement);
  
  return categoryStatsArray;
}; 