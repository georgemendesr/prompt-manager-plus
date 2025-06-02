
import { supabase } from "../base/supabaseService";
import type { Category } from "@/types/prompt";

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
  }>;
}

interface DatabaseCategory {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
}

// Função otimizada que faz uma única consulta com JOINs
export const fetchAllDataOptimized = async () => {
  try {
    console.log('Carregando dados otimizados...');
    
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
          background_color,
          created_at,
          comments:comments(id, text, created_at)
        `)
        .order('created_at', { ascending: false })
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (promptsWithCommentsResult.error) throw promptsWithCommentsResult.error;

    const categories = categoriesResult.data || [];
    const promptsWithComments = promptsWithCommentsResult.data || [];

    console.log(`Dados carregados: ${categories.length} categorias, ${promptsWithComments.length} prompts`);

    return { categories, promptsWithComments };
  } catch (error) {
    console.error('Erro ao carregar dados otimizados:', error);
    throw error;
  }
};

// Função para construir a árvore de categorias com prompts
export const buildOptimizedCategoryTree = (
  categories: DatabaseCategory[], 
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
    const { error } = await supabase.rpc('update_prompt_rating', {
      prompt_id: promptId,
      increment_value: increment ? 1 : -1
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar rating:', error);
    throw error;
  }
};

export const addCommentOptimistic = async (promptId: string, commentText: string) => {
  try {
    const { error } = await supabase
      .from('comments')
      .insert([{ prompt_id: promptId, text: commentText }]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
};
