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
<<<<<<< HEAD
  translated_text?: string | undefined; // Totalmente opcional
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
}

// Função otimizada que faz uma única consulta com JOINs
export const fetchAllDataOptimized = async (
  limit: number = 20,
  offset: number = 0
) => {
  try {
<<<<<<< HEAD
    console.info(`🔄 [OPT] Carregando dados otimizados... (limit: ${limit}, offset: ${offset})`);
    
    // Verificar se o banco está acessível primeiro
    const { count: dbTestCount, error: dbTestError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .limit(1);
      
    if (dbTestError) {
      console.error('❌ [OPT] Erro ao verificar conexão com banco:', dbTestError);
      throw new Error(`Erro de conexão com o banco de dados: ${dbTestError.message}`);
    }
    
    if (dbTestCount === 0) {
      console.error('❌ [OPT] Banco de dados sem categorias');
      throw new Error('Banco de dados vazio - nenhuma categoria encontrada');
    }
=======
    console.log(`🔄 Carregando dados otimizados... (limit: ${limit}, offset: ${offset})`);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    
    // Query única para buscar categorias, prompts e comentários
    const [categoriesResult, promptsWithCommentsResult] = await Promise.all([
      // Buscar todas as categorias (sem limite)
      supabase
        .from('categories')
        .select('id, name, parent_id, created_at')
        .order('created_at', { ascending: true }),
      
      // Buscar prompts ordenados por rating_average (média de estrelas)
<<<<<<< HEAD
      // IMPORTANTE: Carregar TODOS os prompts, não apenas um subconjunto paginado
      // A paginação será feita posteriormente na interface, após a construção da árvore
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
    ]);

    // Verificar se há categorias
    if (categoriesResult.error) {
      console.error('❌ [OPT] Erro ao carregar categorias:', categoriesResult.error);
      throw new Error(`Erro ao carregar categorias: ${categoriesResult.error.message}`);
    }
    
    if (categoriesResult.data.length === 0) {
      console.error('❌ [OPT] Nenhuma categoria encontrada na base');
      // Fazer uma verificação de contagem
      const { count, error: countError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('❌ [OPT] Erro ao verificar contagem de categorias:', countError);
      } else {
        console.info(`ℹ️ [OPT] Contagem total de categorias: ${count}`);
      }
      
      throw new Error('Nenhuma categoria encontrada no banco de dados');
    }
    
    // Verificar se há prompts
    if (promptsWithCommentsResult.error) {
      console.error('❌ [OPT] Erro ao carregar prompts:', promptsWithCommentsResult.error);
      throw new Error(`Erro ao carregar prompts: ${promptsWithCommentsResult.error.message}`);
    }
    
    if (promptsWithCommentsResult.data.length === 0) {
      console.warn('⚠️ [OPT] Nenhum prompt encontrado com os filtros atuais');
      // Fazer uma verificação de contagem
      const { count, error: countError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('❌ [OPT] Erro ao verificar contagem de prompts:', countError);
      } else {
        console.info(`ℹ️ [OPT] Contagem total de prompts: ${count}`);
      }
      
      // Se não há prompts no offset atual, mas há prompts no banco, resetar para offset 0
      if (count && count > 0 && offset > 0) {
        console.info(`🔄 [OPT] Resetando para offset 0 pois não há prompts no offset ${offset}`);
        return fetchAllDataOptimized(limit, 0);
      }
    }
=======
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
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

    const categories: RawCategory[] = categoriesResult.data || [];
    const promptsWithComments = promptsWithCommentsResult.data || [];

<<<<<<< HEAD
    console.info(`✅ [OPT] carregados ${categories.length} categorias, ${promptsWithComments.length} prompts`);

    return { categories, promptsWithComments };
  } catch (error) {
    console.error('❌ [OPT] erro', error);
=======
    console.log(`✅ Dados carregados: ${categories.length} categorias, ${promptsWithComments.length} prompts (ordenados por rating)`);

    return { categories, promptsWithComments };
  } catch (error) {
    console.error('❌ Erro ao carregar dados otimizados:', error);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    
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
<<<<<<< HEAD
const generateUniquePromptId = async (prompt: DatabasePrompt, categoryName: string, subcategoryName: string | null, index: number): Promise<string> => {
=======
const generateUniquePromptId = (prompt: DatabasePrompt, categoryName: string, subcategoryName: string | null, index: number): string => {
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
  // Se já tem um simple_id salvo, usar ele
  if (prompt.simple_id) {
    return prompt.simple_id;
  }
  
  // Gerar novo ID baseado na categoria e subcategoria
<<<<<<< HEAD
  const catCode = getCategoryCode(categoryName);
  const subCode = subcategoryName ? getUniqueSubcategoryCode(categoryName, subcategoryName) : 'GEN';
  
  // Verificar se o ID já existe para garantir unicidade
  let isUnique = false;
  let attemptCount = 0;
  let promptNumber = String(index + 1).padStart(3, '0');
  let candidateId = `${catCode}-${subCode}-${promptNumber}`;
  
  while (!isUnique && attemptCount < 100) {
    // Verificar se o ID já existe no banco
    const { data, error } = await supabase
      .from('prompts')
      .select('id')
      .eq('simple_id', candidateId)
      .limit(1);
      
    if (error) {
      console.error('Erro ao verificar unicidade do ID:', error);
      break; // Sair do loop em caso de erro
    }
    
    // Se não encontrou resultados, o ID é único
    if (!data || data.length === 0) {
      isUnique = true;
    } else {
      // Incrementar o número para tentar outro ID
      attemptCount++;
      const newIndex = index + 1 + attemptCount;
      promptNumber = String(newIndex).padStart(3, '0');
      candidateId = `${catCode}-${subCode}-${promptNumber}`;
    }
  }
  
  // Salvar o ID no banco de dados
  savePromptSimpleId(prompt.id, candidateId);
  
  return candidateId;
};

// Função para obter código de categoria (3 letras)
const getCategoryCode = (categoryName: string): string => {
  if (!categoryName) return "GEN";
  
  // Se o nome tem apenas uma palavra
  if (!categoryName.includes(' ')) {
    return categoryName.substring(0, 3).toUpperCase();
  }
  
  // Se o nome tem múltiplas palavras, usar iniciais
  const words = categoryName.split(' ').filter(w => w.length > 0);
  if (words.length >= 3) {
    // Usar iniciais das três primeiras palavras
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
  } else if (words.length === 2) {
    // Usar duas letras da primeira palavra e uma da segunda
    return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  } else {
    // Caso padrão
    return categoryName.substring(0, 3).toUpperCase();
  }
};

// Função para obter código único de subcategoria (3 letras)
const getUniqueSubcategoryCode = (parentName: string, subcategoryName: string): string => {
  if (!subcategoryName) return "GEN";
  
  // Se os nomes começam iguais, precisamos diferenciar
  if (subcategoryName.toLowerCase().startsWith(parentName.substring(0, 3).toLowerCase())) {
    // Usar o meio do nome da subcategoria para diferenciar
    if (subcategoryName.length > 5) {
      return subcategoryName.substring(2, 5).toUpperCase();
    }
  }
  
  // Se tiver múltiplas palavras, usar técnica de iniciais
  if (subcategoryName.includes(' ')) {
    const words = subcategoryName.split(' ').filter(w => w.length > 0);
    if (words.length >= 3) {
      return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
    } else if (words.length === 2) {
      // Primeira letra da primeira palavra + duas primeiras da segunda
      if (words[1].length >= 2) {
        return (words[0][0] + words[1].substring(0, 2)).toUpperCase();
      }
    }
  }
  
  // Comportamento padrão
  return subcategoryName.substring(0, 3).toUpperCase();
};

// Função para salvar o ID simples no banco de dados
const savePromptSimpleId = async (promptId: string, simpleId: string) => {
  try {
    console.log(`🔄 Salvando ID ${simpleId} para o prompt ${promptId}`);
    
    const { error } = await supabase
      .from('prompts')
      .update({ simple_id: simpleId })
      .eq('id', promptId);
      
    if (error) {
      console.error('❌ Erro ao salvar simple_id:', error);
      return false;
    }
    
    console.log(`✅ ID ${simpleId} salvo com sucesso`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar simple_id:', error);
    return false;
  }
};

// Função para construir a árvore de categorias com prompts
export const buildOptimizedCategoryTree = async (
  categories: RawCategory[],
  promptsWithComments: DatabasePrompt[]
): Promise<Category[]> => {
=======
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
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
  const buildTree = async (parentId: string | null = null): Promise<Category[]> => {
    const categoriesAtLevel = categories.filter(cat => cat.parent_id === parentId);
    
    const result = [];
    
    for (const category of categoriesAtLevel) {
=======
  const buildTree = (parentId: string | null = null): Category[] => {
    const categoriesAtLevel = categories.filter(cat => cat.parent_id === parentId);
    
    return categoriesAtLevel.map(category => {
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
      
<<<<<<< HEAD
      // Processar prompts
      const processedPrompts = [];
      for (let i = 0; i < sortedPrompts.length; i++) {
        const prompt = sortedPrompts[i];
        // Gerar ID único de forma assíncrona
        const uniqueId = await generateUniquePromptId(
          prompt, 
          mainCategoryName, 
          subcategoryName, 
          i
        );
        
        processedPrompts.push({
=======
      const builtCategory = {
        id: category.id,
        name: category.name,
        parentId: category.parent_id || undefined,
        prompts: sortedPrompts.map((prompt, index) => ({
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
          uniqueId
        });
      }
      
      const builtCategory = {
        id: category.id,
        name: category.name,
        parentId: category.parent_id || undefined,
        prompts: processedPrompts,
        subcategories: await buildTree(category.id)
      };

      result.push(builtCategory);
    }
    
    return result;
  };

  const result = await buildTree();
=======
          uniqueId: generateUniquePromptId(prompt, mainCategoryName, subcategoryName, index)
        })),
        subcategories: buildTree(category.id)
      };

      return builtCategory;
    });
  };

  const result = buildTree();
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD

// Função para verificar se a migração de IDs é necessária
export const isIdMigrationNeeded = async (): Promise<boolean> => {
  // Desativado conforme solicitado pelo usuário
  return false;
};

// Função para migrar IDs existentes para o formato CAT-SUB-###
export const migratePromptIds = async (): Promise<boolean> => {
  // Desativado conforme solicitado pelo usuário
  console.log('⚠️ [OPT] Migração de IDs desativada pelo usuário');
  return false;
};

// Função para buscar prompts por categoria
export const fetchOptimizedPrompts = async (categoryId: string, limit: number, offset: number): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        id, 
        text, 
        category_id, 
        rating, 
        background_color, 
        tags, 
        created_at, 
        rating_average, 
        rating_count, 
        copy_count,
        simple_id
      `)
      .eq('category_id', categoryId)
      .range(offset, offset + limit - 1) // Usar range para paginação
      .order('copy_count', { ascending: false })
      .order('rating_average', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar prompts:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar prompts por categoria:', error);
    throw error;
  }
};
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
