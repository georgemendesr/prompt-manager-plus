
import { supabase } from "../base/supabaseService";
import type { Category } from "@/types/prompt";
import type { RawCategory } from "@/types/rawCategory";

// Interface para os dados consolidados do banco
interface DatabasePrompt {
  id: string;
  text: string;
  category_id: string;
  rating: number;
  background_color?: string;
  created_at: string;
  comments: Array<{
    id: string;
    text: string;
    created_at: string;
  }> | null;
}


// Função otimizada que faz uma única consulta com JOINs
export const fetchAllDataOptimized = async () => {
  try {
    console.log('🔄 Carregando dados otimizados...');
    
    // Test connection first
    const { error: connectionError } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Erro de conexão com o banco:', connectionError);
      throw new Error(`Falha na conexão: ${connectionError.message}`);
    }
    
    // Query única para buscar categorias, prompts e comentários
    const [categoriesResult, promptsWithCommentsResult] = await Promise.all([
      // Buscar todas as categorias
      supabase
        .from<RawCategory>('categories')
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
          background_color,
          created_at,
          comments:comments(id, text, created_at)
        `)
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

    console.log(`✅ Dados carregados: ${categories.length} categorias, ${promptsWithComments.length} prompts`);

    return { categories, promptsWithComments };
  } catch (error) {
    console.error('❌ Erro ao carregar dados otimizados:', error);
    
    // Check if it's a network error
    if (error instanceof Error) {
      if (error.message.includes('fetch') || 
          error.message.includes('network') || 
          error.message.includes('Failed to connect')) {
        throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Timeout na conexão. O servidor pode estar sobrecarregado.');
      }
    }
    
    throw error;
  }
};

// Função para construir a árvore de categorias com prompts
export const buildOptimizedCategoryTree = (
  categories: RawCategory[],
  promptsWithComments: DatabasePrompt[]
): Category[] => {
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
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(category => {
        const categoryPrompts = promptsByCategory.get(category.id) || [];
        
        return {
          id: category.id,
          name: category.name,
          parentId: category.parent_id || undefined,
          prompts: categoryPrompts.map(prompt => ({
            id: prompt.id,
            text: prompt.text,
            category: category.name,
            rating: prompt.rating,
            backgroundColor: prompt.background_color,
            comments: prompt.comments?.map(c => c.text) || [],
            createdAt: new Date(prompt.created_at),
            selected: false
          })),
          subcategories: buildTree(category.id)
        };
      });
  };

  return buildTree();
};

// Funções para updates otimistas individuais
export const updatePromptRatingOptimistic = async (promptId: string, increment: boolean) => {
  try {
    console.log(`🔄 Atualizando rating do prompt ${promptId} (${increment ? '+1' : '-1'})`);
    
    const { error } = await supabase.rpc('update_prompt_rating', {
      prompt_id: promptId,
      increment_value: increment ? 1 : -1
    });
    
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
    
    console.log('✅ Comentário adicionado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar comentário:', error);
    throw error;
  }
};
