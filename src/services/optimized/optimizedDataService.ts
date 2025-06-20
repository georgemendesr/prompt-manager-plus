
import { supabase } from "../base/supabaseService";
import type { Category } from "@/types/prompt";
import type { RawCategory } from "@/types/rawCategory";

// Interface para os dados consolidados do banco
interface DatabasePrompt {
  id: string;
  text: string;
  category_id: string;
  rating: number;
  tags: string[] | null;
  background_color?: string;
  created_at: string;
  rating_average?: number;
  rating_count?: number;
  copy_count?: number;
  simple_id?: string;
  comments: Array<{
    id: string;
    text: string;
    created_at: string;
  }> | null;
  translated_text?: string;
}

// Função otimizada que faz uma única consulta com JOINs
export const fetchAllDataOptimized = async (
  limit: number = 20,
  offset: number = 0
) => {
  try {
    console.log(`🔄 Carregando dados otimizados... (limit: ${limit}, offset: ${offset})`);
    
    // Query única para buscar categorias, prompts e comentários
    const [categoriesResult, promptsWithCommentsResult] = await Promise.all([
      // Buscar todas as categorias (sem limite)
      supabase
        .from('categories')
        .select('id, name, parent_id, created_at')
        .order('created_at', { ascending: true }),
      
      // Buscar prompts ordenados por rating_average (média de estrelas)
      supabase
        .from('prompts')
        .select(`
          id,
          text,
          category_id,
          rating,
          tags,
          background_color,
          created_at,
          rating_average,
          rating_count,
          copy_count,
          simple_id,
          comments:comments(id, text, created_at)
        `)
        .order('rating_average', { ascending: false, nullsFirst: false })
        .order('rating_count', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    ]);

    if (categoriesResult.error) {
      console.error('❌ Erro ao carregar categorias:', categoriesResult.error);
      throw new Error(`Erro ao carregar categorias: ${categoriesResult.error.message}`);
    }
    
    if (promptsWithCommentsResult.error) {
      console.error('❌ Erro ao carregar prompts:', promptsWithCommentsResult.error);
      throw new Error(`Erro ao carregar prompts: ${promptsWithCommentsResult.error.message}`);
    }

    const categories: RawCategory[] = categoriesResult.data || [];
    const promptsWithComments = promptsWithCommentsResult.data || [];

    console.log(`✅ Dados carregados: ${categories.length} categorias, ${promptsWithComments.length} prompts (ordenados por rating)`);

    return { categories, promptsWithComments };
  } catch (error) {
    console.error('❌ Erro ao carregar dados otimizados:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch') || 
          error.message.includes('network') || 
          error.message.includes('Failed to connect') ||
          error.message.includes('Failed to fetch')) {
        throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      }
      if (error.message.includes('timeout') || error.message.includes('Connection timeout')) {
        throw new Error('Timeout na conexão. O servidor pode estar sobrecarregado.');
      }
      throw error;
    }
    
    throw new Error('Erro desconhecido ao carregar dados');
  }
};

// Função para gerar ID único para prompts no formato CAT-SUB-###
const generateUniquePromptId = (prompt: DatabasePrompt, categoryName: string, subcategoryName: string | null, index: number): string => {
  // Se já tem um simple_id salvo, usar ele
  if (prompt.simple_id) {
    return prompt.simple_id;
  }
  
  // Gerar novo ID baseado na categoria e subcategoria
  const catCode = categoryName.substring(0, 3).toUpperCase();
  const subCode = subcategoryName ? subcategoryName.substring(0, 3).toUpperCase() : 'GEN';
  const promptNumber = String(index + 1).padStart(3, '0');
  return `${catCode}-${subCode}-${promptNumber}`;
};

// Função para construir a árvore de categorias com prompts
export const buildOptimizedCategoryTree = (
  categories: RawCategory[],
  promptsWithComments: DatabasePrompt[]
): Category[] => {
  console.log('🏗️ Construindo árvore de categorias...');
  
  // Agrupar prompts por categoria
  const promptsByCategory = new Map<string, DatabasePrompt[]>();
  promptsWithComments.forEach(prompt => {
    if (!promptsByCategory.has(prompt.category_id)) {
      promptsByCategory.set(prompt.category_id, []);
    }
    promptsByCategory.get(prompt.category_id)!.push(prompt);
  });

  // Construir árvore recursivamente
  const buildTree = (parentId: string | null = null): Category[] => {
    const categoriesAtLevel = categories.filter(cat => cat.parent_id === parentId);
    
    return categoriesAtLevel.map(category => {
      const categoryPrompts = promptsByCategory.get(category.id) || [];
      
      // Ordenar prompts por rating_average (maiores primeiro)
      const sortedPrompts = [...categoryPrompts].sort((a, b) => {
        const ratingA = a.rating_average || 0;
        const ratingB = b.rating_average || 0;
        if (ratingA !== ratingB) return ratingB - ratingA;
        
        const countA = a.rating_count || 0;
        const countB = b.rating_count || 0;
        return countB - countA;
      });

      // Encontrar categoria pai para gerar IDs corretos
      const parentCategory = categories.find(cat => cat.id === category.parent_id);
      const subcategoryName = parentCategory ? category.name : null;
      const mainCategoryName = parentCategory ? parentCategory.name : category.name;
      
      const builtCategory = {
        id: category.id,
        name: category.name,
        parentId: category.parent_id || undefined,
        prompts: sortedPrompts.map((prompt, index) => ({
          id: prompt.id,
          text: prompt.text,
          category: category.name,
          rating: prompt.rating,
          tags: prompt.tags || [],
          backgroundColor: prompt.background_color,
          comments: prompt.comments?.map(c => c.text) || [],
          createdAt: new Date(prompt.created_at),
          selected: false,
          ratingAverage: prompt.rating_average || 0,
          ratingCount: prompt.rating_count || 0,
          copyCount: prompt.copy_count || 0,
          uniqueId: generateUniquePromptId(prompt, mainCategoryName, subcategoryName, index)
        })),
        subcategories: buildTree(category.id)
      };

      return builtCategory;
    });
  };

  const result = buildTree();
  console.log('🌳 Árvore construída com ordenação por rating e IDs no formato CAT-SUB-###');
  
  return result;
};

// Funções para updates otimistas individuais
export const updatePromptRatingOptimistic = async (promptId: string, increment: boolean) => {
  try {
    console.log(`🔄 Atualizando rating do prompt ${promptId} (${increment ? '+1' : '-1'})`);
    
    // Get current rating first
    const { data: currentPrompt, error: fetchError } = await supabase
      .from('prompts')
      .select('rating')
      .eq('id', promptId)
      .single();
    
    if (fetchError) {
      console.error('❌ Erro ao buscar prompt atual:', fetchError);
      throw new Error(`Erro ao buscar prompt: ${fetchError.message}`);
    }
    
    const newRating = Math.max(0, currentPrompt.rating + (increment ? 1 : -1));
    
    const { error } = await supabase
      .from('prompts')
      .update({ rating: newRating })
      .eq('id', promptId);
    
    if (error) {
      console.error('❌ Erro ao atualizar rating:', error);
      throw new Error(`Erro ao atualizar rating: ${error.message}`);
    }
    
    console.log('✅ Rating atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar rating:', error);
    throw error;
  }
};

export const addCommentOptimistic = async (promptId: string, commentText: string) => {
  try {
    console.log(`🔄 Adicionando comentário ao prompt ${promptId}`);
    
    const { error } = await supabase
      .from('comments')
      .insert([{ prompt_id: promptId, text: commentText }]);

    if (error) {
      console.error('❌ Erro ao adicionar comentário:', error);
      throw new Error(`Erro ao adicionar comentário: ${error.message}`);
    }

    // Handle tags if comment starts with #
    if (commentText.startsWith('#')) {
      const { data: promptData, error: fetchError } = await supabase
        .from('prompts')
        .select('tags')
        .eq('id', promptId)
        .single();
        
      if (fetchError) throw new Error(fetchError.message);

      const currentTags = promptData?.tags || [];
      const newTag = commentText.replace('#', '').trim();
      
      if (!currentTags.includes(newTag)) {
        const { error: tagError } = await supabase
          .from('prompts')
          .update({ tags: [...currentTags, newTag] })
          .eq('id', promptId);
          
        if (tagError) throw new Error(tagError.message);
      }
    }
    
    console.log('✅ Comentário adicionado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar comentário:', error);
    throw error;
  }
};

export const fetchOptimizedData = async (limit: number, offset: number) => {
  const { categories, promptsWithComments } = await fetchAllDataOptimized(limit, offset);
  return buildOptimizedCategoryTree(categories, promptsWithComments);
};
