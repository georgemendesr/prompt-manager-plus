import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadCategories = useCallback(async () => {
    // Evitar múltiplas chamadas se já estiver carregando
    if (loading && initialized) return;
    
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      // Fazer todas as chamadas em paralelo
      const [categoriesResult, promptsResult, commentsResult] = await Promise.all([
        supabase.from('categories').select('id, name, created_at'),
        supabase.from('prompts').select('id, text, category_id, rating, created_at'),
        supabase.from('comments').select('id, prompt_id, text, created_at')
      ]);

      if (categoriesResult.error) {
        console.error('Erro ao carregar categorias:', categoriesResult.error);
        toast.error('Erro ao carregar categorias. Por favor, verifique sua conexão.');
        setCategories([]);
        return;
      }

      if (promptsResult.error) {
        console.error('Erro ao carregar prompts:', promptsResult.error);
        toast.error('Erro ao carregar prompts. Por favor, verifique sua conexão.');
        setCategories([]);
        return;
      }

      if (commentsResult.error) {
        console.error('Erro ao carregar comentários:', commentsResult.error);
        toast.error('Erro ao carregar comentários. Por favor, verifique sua conexão.');
        setCategories([]);
        return;
      }

      // Usar os dados retornados ou arrays vazios se null
      const categoriesData = categoriesResult.data || [];
      const promptsData = promptsResult.data || [];
      const commentsData = commentsResult.data || [];

      console.log('Dados carregados com sucesso:', {
        categories: categoriesData.length,
        prompts: promptsData.length,
        comments: commentsData.length
      });

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
      
      // Mostrar toast apenas na primeira carga
      if (!initialized) {
        toast.success('Dados carregados com sucesso!');
        setInitialized(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao conectar com o banco de dados. Por favor, tente novamente mais tarde.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [loading, initialized]);

  const addCategory = async (name: string) => {
    try {
      console.log('Adicionando nova categoria:', name);
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      console.log('Categoria adicionada com sucesso:', data);
      setCategories(prev => [...prev, {
        id: data.id,
        name: data.name,
        prompts: []
      }]);

      toast.success('Categoria adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria. Por favor, tente novamente.');
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
