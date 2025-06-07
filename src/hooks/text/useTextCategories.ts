
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchTextCategories, addTextCategory, updateTextCategory, deleteTextCategory } from "@/services/text/textCategoryService";
import type { TextCategory } from "@/types/textCategory";

export const useTextCategories = () => {
  const [categories, setCategories] = useState<TextCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTextCategories();
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias de texto';
      setError(errorMessage);
      console.error('Erro ao carregar categorias de texto:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, parentId?: string): Promise<boolean> => {
    try {
      await addTextCategory(name, parentId);
      await loadCategories();
      toast.success('Categoria de texto criada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria de texto';
      toast.error(errorMessage);
      return false;
    }
  };

  const editCategory = async (id: string, newName: string, newParentId?: string): Promise<boolean> => {
    try {
      await updateTextCategory(id, newName, newParentId);
      await loadCategories();
      toast.success('Categoria de texto atualizada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria de texto';
      toast.error(errorMessage);
      return false;
    }
  };

  const removeCategory = async (id: string): Promise<boolean> => {
    try {
      await deleteTextCategory(id);
      await loadCategories();
      toast.success('Categoria de texto removida com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover categoria de texto';
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    editCategory,
    removeCategory
  };
};
