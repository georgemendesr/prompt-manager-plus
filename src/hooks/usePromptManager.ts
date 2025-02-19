
import { useCategories } from "./useCategories";
import { usePrompts } from "./usePrompts";
import { useBulkActions } from "./useBulkActions";
import { useSelection } from "./useSelection";
import type { Category, MusicStructure } from "@/types/prompt";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PromptManager {
  categories: Category[];
  loading: boolean;
  loadCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  editCategory: (id: string, newName: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  ratePrompt: (promptId: string, increment: boolean) => Promise<void>;
  addComment: (promptId: string, comment: string) => Promise<void>;
  movePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  bulkImportPrompts: (prompts: string[], categoryName: string) => Promise<void>;
  deleteSelectedPrompts: (categoryName: string) => Promise<void>;
  togglePromptSelection: (promptId: string, selected: boolean) => void;
  toggleSelectAll: (categoryName: string, selected: boolean) => void;
  structures: MusicStructure[];
}

export const usePromptManager = (): PromptManager => {
  const [structures, setStructures] = useState<MusicStructure[]>([]);

  const {
    categories,
    setCategories,
    loading,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory
  } = useCategories();

  const {
    ratePrompt,
    addComment,
    movePrompt
  } = usePrompts(categories, setCategories, structures);

  const {
    bulkImportPrompts,
    deleteSelectedPrompts
  } = useBulkActions(categories, setCategories);

  const {
    togglePromptSelection,
    toggleSelectAll
  } = useSelection(categories, setCategories);

  useEffect(() => {
    const loadStructures = async () => {
      try {
        const { data, error } = await supabase
          .from('structures')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStructures(data);
      } catch (error) {
        console.error('Erro ao carregar estruturas:', error);
        toast.error('Erro ao carregar estruturas');
      }
    };

    loadStructures();
  }, []);

  return {
    categories,
    loading,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory,
    ratePrompt,
    addComment,
    movePrompt,
    bulkImportPrompts,
    deleteSelectedPrompts,
    togglePromptSelection,
    toggleSelectAll,
    structures
  };
};
