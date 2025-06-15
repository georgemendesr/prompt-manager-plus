
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Category } from "@/types/prompt";

export const useBulkActions = (
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
) => {
  const [importing, setImporting] = useState(false);

  const findCategoryByName = (name: string): Category | undefined => {
    const searchInCategories = (cats: Category[]): Category | undefined => {
      for (const cat of cats) {
        if (cat.name.toLowerCase() === name.toLowerCase()) {
          return cat;
        }
        if (cat.subcategories) {
          const found = searchInCategories(cat.subcategories);
          if (found) return found;
        }
      }
      return undefined;
    };
    return searchInCategories(categories);
  };

  const bulkImportPrompts = async (prompts: { text: string; tags: string[] }[], categoryName: string) => {
    try {
      setImporting(true);
      const targetCategory = findCategoryByName(categoryName);
      
      if (!targetCategory) {
        toast.error(`Categoria "${categoryName}" não encontrada`);
        return;
      }

      const promptsToInsert = prompts.map(prompt => ({
        text: prompt.text,
        category_id: targetCategory.id,
        tags: prompt.tags,
        rating: 0
      }));

      const { data, error } = await supabase
        .from("prompts")
        .insert(promptsToInsert)
        .select();

      if (error) {
        console.error("Erro ao importar prompts:", error);
        toast.error("Erro ao importar prompts");
        return;
      }

      const newPrompts = data.map(prompt => ({
        id: prompt.id,
        text: prompt.text,
        category: targetCategory.name,
        rating: prompt.rating,
        tags: prompt.tags || [],
        backgroundColor: prompt.background_color,
        comments: [],
        createdAt: new Date(prompt.created_at),
        selected: false,
        ratingAverage: 0,
        ratingCount: 0,
        copyCount: 0,
        uniqueId: prompt.simple_id || `${targetCategory.name.substring(0, 3).toUpperCase()}-GEN-${String(prompt.id).padStart(3, '0')}`
      }));

      setCategories(prevCategories => {
        const updateCategoryPrompts = (cats: Category[]): Category[] => {
          return cats.map(cat => {
            if (cat.id === targetCategory.id) {
              return {
                ...cat,
                prompts: [...cat.prompts, ...newPrompts]
              };
            }
            if (cat.subcategories) {
              return {
                ...cat,
                subcategories: updateCategoryPrompts(cat.subcategories)
              };
            }
            return cat;
          });
        };
        return updateCategoryPrompts(prevCategories);
      });

      toast.success(`${prompts.length} prompts importados com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar prompts:", error);
      toast.error("Erro ao importar prompts");
    } finally {
      setImporting(false);
    }
  };

  const deleteSelectedPrompts = async (categoryName: string) => {
    try {
      const targetCategory = findCategoryByName(categoryName);
      if (!targetCategory) {
        toast.error(`Categoria "${categoryName}" não encontrada`);
        return;
      }

      const selectedPrompts = targetCategory.prompts.filter(p => p.selected);
      if (selectedPrompts.length === 0) {
        toast.error("Nenhum prompt selecionado");
        return;
      }

      const promptIds = selectedPrompts.map(p => p.id);
      
      const { error } = await supabase
        .from("prompts")
        .delete()
        .in("id", promptIds);

      if (error) {
        console.error("Erro ao deletar prompts:", error);
        toast.error("Erro ao deletar prompts");
        return;
      }

      setCategories(prevCategories => {
        const updateCategoryPrompts = (cats: Category[]): Category[] => {
          return cats.map(cat => {
            if (cat.id === targetCategory.id) {
              return {
                ...cat,
                prompts: cat.prompts.filter(p => !p.selected)
              };
            }
            if (cat.subcategories) {
              return {
                ...cat,
                subcategories: updateCategoryPrompts(cat.subcategories)
              };
            }
            return cat;
          });
        };
        return updateCategoryPrompts(prevCategories);
      });

      toast.success(`${selectedPrompts.length} prompts deletados com sucesso!`);
    } catch (error) {
      console.error("Erro ao deletar prompts:", error);
      toast.error("Erro ao deletar prompts");
    }
  };

  return {
    bulkImportPrompts,
    deleteSelectedPrompts,
    importing
  };
};
