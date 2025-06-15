import type { Category, Prompt } from "@/types/prompt";

// Converter um prompt do banco para o formato esperado pela UI
const mapPromptForDisplay = (prompt: any, comments: any[]): Prompt => {
  return {
    id: prompt.id,
    text: prompt.text,
    category: "", // Será preenchido mais tarde
    rating: prompt.rating || 0,
    comments: comments.map(c => c.text),
    tags: prompt.tags || [],
    createdAt: new Date(prompt.created_at),
    backgroundColor: prompt.background_color,
    ratingAverage: prompt.rating_average || 0,
    ratingCount: prompt.rating_count || 0,
    copyCount: prompt.copy_count || 0,
    uniqueId: prompt.simple_id || "",
    translatedText: prompt.translated_text || undefined // Adicionando o campo translatedText
  };
};

export const buildOptimizedCategoryTree = async (
  categories: any[], 
  promptsWithComments: any[]
): Promise<Category[]> => {
  // Criar um mapa para organizar os prompts por categoria
  const promptsByCategoryId: Record<string, any[]> = {};
  
  promptsWithComments.forEach(prompt => {
    if (!promptsByCategoryId[prompt.category_id]) {
      promptsByCategoryId[prompt.category_id] = [];
    }
    promptsByCategoryId[prompt.category_id].push(prompt);
  });
  
  // Função auxiliar para construir a árvore recursivamente
  const buildTree = (category: any): Category => {
    const prompts = promptsByCategoryId[category.id] || [];
    const processedPrompts = prompts.map(prompt => {
      // Usar a função de mapeamento para padronizar os prompts
      const mappedPrompt = mapPromptForDisplay(
        prompt,
        prompt.comments || []
      );
      
      // Adicionar o nome da categoria ao prompt
      mappedPrompt.category = category.name;
      return mappedPrompt;
    });
    
    // Encontrar subcategorias
    const subcategories = categories
      .filter(c => c.parent_id === category.id)
      .map(buildTree);
    
    return {
      id: category.id,
      name: category.name,
      prompts: processedPrompts,
      subcategories
    };
  };
  
  // Construir a árvore apenas com categorias de nível superior
  return categories
    .filter(c => !c.parent_id)
    .map(buildTree);
}; 