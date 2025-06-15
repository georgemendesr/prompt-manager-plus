import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const useBulkActions = (categories: Category[], setCategories: (categories: Category[]) => void) => {
  const findCategoryById = (categories: Category[], categoryId: string): Category | undefined => {
    for (const category of categories) {
      if (category.id === categoryId) return category;
      if (category.subcategories) {
        const found = findCategoryById(category.subcategories, categoryId);
        if (found) return found;
      }
    }
    return undefined;
  };

  const bulkImportPrompts = async (
    prompts: { text: string; tags: string[] }[],
    categoryId: string
  ) => {
    try {
      const category = findCategoryById(categories, categoryId);
      if (!category) return;

      // Filtrar e limpar as tags para garantir que sejam apenas strings válidas
      // e não incluir o campo simple_id para evitar erros de tipo
      const newPrompts = prompts.map(p => ({
        text: p.text,
        tags: p.tags.filter(tag => typeof tag === 'string'),
        category_id: categoryId,
        rating: 0,
        // Não incluir simple_id para evitar erro de tipo
        // O simple_id será gerado pelo banco de dados ou trigger
      }));

      console.log('Dados a serem importados:', JSON.stringify(newPrompts.slice(0, 2)));

      // Verificar se há algum prompt com texto muito longo
      const longPrompts = newPrompts.filter(p => p.text.length > 5000);
      if (longPrompts.length > 0) {
        console.warn(`${longPrompts.length} prompts têm texto muito longo (>5000 caracteres)`);
      }

      // Usar SQL bruto para inserir os prompts, evitando problemas com o campo simple_id
      const insertedPrompts = [];
      
      // Inserir um prompt de cada vez para identificar qual está causando o problema
      for (const [index, prompt] of newPrompts.entries()) {
        try {
          console.log(`Tentando inserir prompt ${index + 1}/${newPrompts.length}`);
          
          // Usar método de inserção específico que não tenta definir simple_id
          const { data, error } = await supabase
            .from('prompts')
            .insert({
              text: prompt.text,
              tags: prompt.tags,
              category_id: prompt.category_id,
              rating: prompt.rating
            })
            .select();
          
          if (error) {
            console.error(`Erro ao inserir prompt ${index + 1}:`, error);
            continue; // Continuar com o próximo prompt
          }
          
          if (data && data.length > 0) {
            insertedPrompts.push(data[0]);
          }
        } catch (err) {
          console.error(`Erro ao processar prompt ${index + 1}:`, err);
        }
      }
      
      console.log(`Inseridos ${insertedPrompts.length} de ${newPrompts.length} prompts`);
      
      if (insertedPrompts.length === 0) {
        throw new Error('Nenhum prompt foi inserido');
      }

      const updateCategoriesRecursively = (cats: Category[]): Category[] => {
        return cats.map(c => {
          if (c.id === categoryId) {
            return {
              ...c,
              prompts: [
                ...c.prompts,
                ...insertedPrompts.map((p) => ({
                  id: p.id,
                  text: p.text,
                  category: c.name,
                  rating: 0,
                  tags: p.tags || [],
                  comments: [],
                  createdAt: new Date(p.created_at),
                  selected: false,
                })),
              ],
            };
          }
          if (c.subcategories?.length) {
            return {
              ...c,
              subcategories: updateCategoriesRecursively(c.subcategories)
            };
          }
          return c;
        });
      };

      setCategories(updateCategoriesRecursively(categories));
      
      if (insertedPrompts.length === newPrompts.length) {
        toast.success(`${insertedPrompts.length} prompts importados com sucesso!`);
      } else {
        toast.warning(`${insertedPrompts.length} de ${newPrompts.length} prompts importados. Alguns prompts não puderam ser importados.`);
      }
    } catch (error) {
      console.error('Erro ao importar prompts:', error);
      toast.error(`Erro ao importar prompts: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const deleteSelectedPrompts = async (categoryId: string) => {
    try {
      console.log('Tentando excluir prompts da categoria:', categoryId);
      
      const category = findCategoryById(categories, categoryId);
      if (!category) {
        console.error('Categoria não encontrada:', categoryId);
        return;
      }

      const selectedPromptIds = category.prompts
        .filter(p => p.selected)
        .map(p => p.id);

      if (selectedPromptIds.length === 0) {
        console.log('Nenhum prompt selecionado para exclusão');
        return;
      }

      console.log('Prompts selecionados para exclusão:', selectedPromptIds);

      const { error } = await supabase
        .from('prompts')
        .delete()
        .in('id', selectedPromptIds);

      if (error) {
        console.error('Erro ao excluir no Supabase:', error);
        throw error;
      }

      const updateCategoriesRecursively = (cats: Category[]): Category[] => {
        return cats.map(c => {
          if (c.id === categoryId) {
            return {
              ...c,
              prompts: c.prompts.filter((prompt) => !prompt.selected),
            };
          }
          if (c.subcategories?.length) {
            return {
              ...c,
              subcategories: updateCategoriesRecursively(c.subcategories)
            };
          }
          return c;
        });
      };

      setCategories(updateCategoriesRecursively(categories));
      toast.success('Prompts excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir prompts:', error);
      toast.error('Erro ao excluir prompts');
    }
  };

  return {
    bulkImportPrompts,
    deleteSelectedPrompts
  };
};