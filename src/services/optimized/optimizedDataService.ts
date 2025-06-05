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
  comments: Array<{
    id: string;
    text: string;
    created_at: string;
  }> | null;
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
      // Buscar todas as categorias
      supabase
        .from('categories')
        .select('id, name, parent_id, created_at')
        .order('created_at', { ascending: true }),
      
      // Buscar prompts com seus comentários em uma única query
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
          comments:comments(id, text, created_at)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
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

    console.log(`✅ Dados carregados: ${categories.length} categorias, ${promptsWithComments.length} prompts (limit: ${limit}, offset: ${offset})`);
    console.log('📊 Categorias encontradas:', categories.map(c => ({ id: c.id, name: c.name, parent_id: c.parent_id })));
    console.log('📊 Prompts por categoria:', promptsWithComments.reduce((acc, p) => {
      acc[p.category_id] = (acc[p.category_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));

    return { categories, promptsWithComments };
  } catch (error) {
    console.error('❌ Erro ao carregar dados otimizados:', error);
    
    // Better error handling
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
      // Re-throw the error message as is if it's already formatted
      throw error;
    }
    
    throw new Error('Erro desconhecido ao carregar dados');
  }
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

  console.log('📝 Prompts agrupados por categoria:', Object.fromEntries(promptsByCategory.entries()));

  // Construir árvore recursivamente
  const buildTree = (parentId: string | null = null): Category[] => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(category => {
        const categoryPrompts = promptsByCategory.get(category.id) || [];
        
        console.log(`📁 Categoria "${category.name}" (${category.id}): ${categoryPrompts.length} prompts`);
        
        const builtCategory = {
          id: category.id,
          name: category.name,
          parentId: category.parent_id || undefined,
          prompts: categoryPrompts.map(prompt => ({
            id: prompt.id,
            text: prompt.text,
            category: category.name,
            rating: prompt.rating,
            tags: prompt.tags || [],
            backgroundColor: prompt.background_color,
            comments: prompt.comments?.map(c => c.text) || [],
            createdAt: new Date(prompt.created_at),
            selected: false
          })),
          subcategories: buildTree(category.id)
        };

        return builtCategory;
      });
  };

  const result = buildTree();
  console.log('🌳 Árvore construída:', result.map(c => ({ 
    name: c.name, 
    prompts: c.prompts.length, 
    subcategories: c.subcategories?.length || 0 
  })));
  
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
