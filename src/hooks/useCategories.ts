
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      let { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, created_at');

      if (categoriesError) {
        console.error('Erro ao carregar categorias:', categoriesError);
        toast.error('Erro ao carregar categorias');
        setCategories([]);
        return;
      }

      let { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('id, text, category_id, rating, created_at');

      if (promptsError) {
        console.error('Erro ao carregar prompts:', promptsError);
        toast.error('Erro ao carregar prompts');
        setCategories([]);
        return;
      }

      let { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, prompt_id, text, created_at');

      if (commentsError) {
        console.error('Erro ao carregar comentários:', commentsError);
        toast.error('Erro ao carregar comentários');
        setCategories([]);
        return;
      }

      // Initialize with empty arrays if data is null
      categoriesData = categoriesData || [];
      promptsData = promptsData || [];
      commentsData = commentsData || [];

      const formattedCategories = categoriesData.map(category => ({
        id: category.id,
        name: category.name,
        prompts: promptsData
          ?.filter(prompt => prompt.category_id === category.id)
          .map(prompt => ({
            id: prompt.id,
            text: prompt.text,
            category: category.name,
            rating: prompt.rating,
            comments: commentsData
              ?.filter(comment => comment.prompt_id === prompt.id)
              .map(comment => comment.text) || [],
            createdAt: new Date(prompt.created_at),
            selected: false
          })) || []
      }));

      setCategories(formattedCategories);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao conectar com o banco de dados');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, {
        id: data.id,
        name: data.name,
        prompts: []
      }]);

      toast.success('Categoria adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
      return false;
    }
  };

  return {
    categories,
    setCategories,
    loading,
    loadCategories,
    addCategory
  };
};
