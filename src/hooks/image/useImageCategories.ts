import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchImageCategories, addImageCategory, updateImageCategory, deleteImageCategory } from "@/services/image/imageCategoryService";
import type { ImageCategory } from "@/types/imageCategory";
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  subcategories?: Category[];
}

export const useImageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando categorias de imagem do Supabase...');
      
      // Buscar todas as categorias - não existe coluna 'type'
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at');

      if (error) throw error;

      console.log('Categorias encontradas:', data?.length || 0);
      
      // Filtrar as categorias de imagem (no cliente)
      // Vamos filtrar por alguma convenção de nome ou estrutura
      const imageCategories = ['Imagem', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Leonardo'];
      const filteredData = data?.filter(cat => 
        imageCategories.some(prefix => cat.name.includes(prefix)) || 
        cat.name.toLowerCase().includes('imag')
      ) || [];
      
      console.log('Categorias de imagem filtradas:', filteredData.length);
      
      // Construir árvore de categorias
      const categoriesWithSubs = buildCategoryTree(filteredData);
      setCategories(categoriesWithSubs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias de imagem';
      setError(errorMessage);
      console.error('Erro ao carregar categorias de imagem:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (flatCategories: any[]): Category[] => {
    const categoryMap = new Map();
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        parentId: cat.parent_id,
        subcategories: []
      });
    });

    const rootCategories: Category[] = [];
    categoryMap.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.subcategories = parent.subcategories || [];
          parent.subcategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return Array.from(categoryMap.values());
  };

  const createCategory = async (name: string, parentId: string | null = null) => {
    try {
      const id = uuidv4();
      const newCategory = {
        id,
        name,
        parent_id: parentId
        // Removemos o campo 'type' que não existe
      };

      console.log('Criando categoria de imagem:', newCategory);

      const { error } = await supabase
        .from('categories')
        .insert(newCategory);

      if (error) throw error;

      // Atualizar estado local
      await loadCategories();
      toast.success('Categoria criada com sucesso');
      return id;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      toast.error('Erro ao criar categoria');
      throw err;
    }
  };

  const editCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local
      setCategories(categories.map(cat => {
        if (cat.id === id) {
          return { ...cat, name };
        }
        return cat;
      }));

      toast.success('Categoria atualizada');
    } catch (err) {
      console.error('Erro ao editar categoria:', err);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const removeCategory = async (id: string) => {
    try {
      // Verificar se há prompts usando esta categoria
      const { count, error: countError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError) throw countError;

      if (count && count > 0) {
        toast.error(`Não é possível excluir: existem ${count} prompts nesta categoria`);
        return;
      }

      // Verificar se há subcategorias
      const { data: subcategories, error: subError } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', id);

      if (subError) throw subError;

      if (subcategories && subcategories.length > 0) {
        toast.error(`Não é possível excluir: esta categoria contém ${subcategories.length} subcategorias`);
        return;
      }

      // Excluir a categoria
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success('Categoria excluída');
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      toast.error('Erro ao excluir categoria');
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
