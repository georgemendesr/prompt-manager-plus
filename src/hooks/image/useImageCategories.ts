
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchImageCategories, addImageCategory, updateImageCategory, deleteImageCategory } from "@/services/image/imageCategoryService";
import type { ImageCategory } from "@/types/imageCategory";

export const useImageCategories = () => {
  const [categories, setCategories] = useState<ImageCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchImageCategories();
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias de imagem';
      setError(errorMessage);
      console.error('Erro ao carregar categorias de imagem:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, parentId?: string): Promise<boolean> => {
    try {
      await addImageCategory(name, parentId);
      await loadCategories();
      toast.success('Categoria de imagem criada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria de imagem';
      toast.error(errorMessage);
      return false;
    }
  };

  const editCategory = async (id: string, newName: string, newParentId?: string): Promise<boolean> => {
    try {
      await updateImageCategory(id, newName, newParentId);
      await loadCategories();
      toast.success('Categoria de imagem atualizada com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria de imagem';
      toast.error(errorMessage);
      return false;
    }
  };

  const removeCategory = async (id: string): Promise<boolean> => {
    try {
      await deleteImageCategory(id);
      await loadCategories();
      toast.success('Categoria de imagem removida com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover categoria de imagem';
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
