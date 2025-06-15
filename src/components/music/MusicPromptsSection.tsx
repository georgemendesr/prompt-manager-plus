import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCategory } from "@/components/AddCategory";
import { MusicCategoryTree } from "@/components/music/MusicCategoryTree";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { addCategory, fetchCategories, updateCategory, deleteCategory } from "@/services/categoryService";
import type { MusicPrompt, MusicPromptInsert } from "@/types/musicPrompt";
import type { Category } from "@/types/category";

interface MusicPromptsSectionProps {
  categories: Category[];
  musicPrompts?: MusicPrompt[];
  searchTerm: string;
}

export const MusicPromptsSection = ({ categories, musicPrompts: initialMusicPrompts, searchTerm }: MusicPromptsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [musicPrompts, setMusicPrompts] = useState<MusicPrompt[]>(initialMusicPrompts || []);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [musicCategories, setMusicCategories] = useState<any[]>([]);
  
  useEffect(() => {
    loadMusicCategories();
  }, []);

  const loadMusicCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchCategories('music');
      
      if (error) throw error;
      
      if (data) {
        // Transformar em estrutura hierárquica
        const hierarchicalData = buildCategoryTree(data);
        setMusicCategories(hierarchicalData);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias de música:', err);
      toast.error('Erro ao carregar categorias de música');
    } finally {
      setLoading(false);
    }
  };

  // Função para construir a árvore de categorias
  const buildCategoryTree = (categories: any[], parentId: string | null = null): any[] => {
    return categories
      .filter(category => category.parent_id === parentId)
      .map(category => ({
        id: category.id,
        name: category.name,
        parentId: category.parent_id,
        type: 'music' as const,
        created_at: category.created_at,
        subcategories: buildCategoryTree(categories, category.id)
      }));
  };

  // Usamos as categorias de música carregadas diretamente da tabela music_categories
  const allCategories = musicCategories;
  
  // Garantir que temos categorias para trabalhar
  const hasCategories = allCategories && allCategories.length > 0;
  
  // Filtragem de categorias raiz para exibição na interface
  const rootCategories = hasCategories 
    ? allCategories.filter(cat => !cat.parentId)
    : [];

  // Funções de gerenciamento de categorias usando a nova API
  const createCategory = async (name: string, parentId?: string) => {
    try {
      // Não prefixar o nome
      const { data, error } = await addCategory('music', name, parentId);

      if (error) throw error;
      
      toast.success('Categoria criada com sucesso');
      // Recarregar categorias sem recarregar a página
      loadMusicCategories();
      return true;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      toast.error('Erro ao criar categoria');
      return false;
    }
  };

  const editCategory = async (id: string, name: string, parentId?: string) => {
    try {
      const { error } = await updateCategory('music', id, name, parentId);

      if (error) throw error;
      
      toast.success('Categoria atualizada');
      // Recarregar categorias sem recarregar a página
      loadMusicCategories();
      return true;
    } catch (err) {
      console.error('Erro ao editar categoria:', err);
      toast.error('Erro ao atualizar categoria');
      return false;
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
        return false;
      }

      // Verificar se há subcategorias
      const { data: subcategories, error: subError } = await supabase
        .from('music_categories')
        .select('*')
        .eq('parent_id', id);

      if (subError) throw subError;

      if (subcategories && subcategories.length > 0) {
        toast.error(`Não é possível excluir: esta categoria contém ${subcategories.length} subcategorias`);
        return false;
      }

      // Excluir a categoria
      const { error } = await deleteCategory('music', id);

      if (error) throw error;
      
      toast.success('Categoria excluída');
      // Recarregar categorias sem recarregar a página
      loadMusicCategories();
      return true;
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      toast.error('Erro ao excluir categoria');
      return false;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <AddCategory 
            onAdd={createCategory} 
            categories={allCategories.map(cat => ({
              id: cat.id,
              name: cat.name,
              parentId: cat.parentId,
              prompts: [],
              subcategories: cat.subcategories?.map(sub => ({
                id: sub.id,
                name: sub.name,
                parentId: sub.parentId,
                prompts: [],
                subcategories: []
              })) || []
            }))} 
          />
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Prompt de Música
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando categorias de música...</div>
      ) : !hasCategories ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Crie uma categoria para começar a adicionar prompts de música
        </div>
      ) : (
        <Tabs defaultValue={rootCategories[0]?.name} className="w-full">
          <div className="max-w-full overflow-hidden">
            <TabsList className="bg-gray-100/80 p-1 rounded-lg max-w-full overflow-x-auto flex gap-1 no-scrollbar">
              {rootCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.name}
                  className="flex-shrink-0 px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {rootCategories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.name}
              className="mt-4 sm:mt-6"
            >
              <MusicCategoryTree
                category={category}
                categories={allCategories}
                musicPrompts={musicPrompts}
                searchTerm={searchTerm}
                onEditCategory={editCategory}
                onDeleteCategory={removeCategory}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}; 