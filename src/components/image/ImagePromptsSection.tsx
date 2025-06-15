<<<<<<< HEAD
import { useState, useEffect } from "react";
=======

import { useState } from "react";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCategory } from "@/components/AddCategory";
<<<<<<< HEAD
import { ImagePromptLayerEditor } from "./ImagePromptLayerEditor";
import { ImageCategoryTree } from "./ImageCategoryTree";
import { addImagePrompt, fetchImagePrompts } from "@/services/image/imagePromptService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import type { ImagePrompt, ImagePromptInsert } from "@/types/imagePrompt";
import { addCategory, fetchCategories, updateCategory, deleteCategory } from "@/services/categoryService";
=======
import { ImagePromptForm } from "./ImagePromptForm";
import { ImageCategoryTree } from "./ImageCategoryTree";
import { useImageCategories } from "@/hooks/image/useImageCategories";
import type { ImagePrompt } from "@/types/imagePrompt";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

interface ImagePromptsSectionProps {
  categories: any[];
  imagePrompts: ImagePrompt[];
  searchTerm: string;
}

<<<<<<< HEAD
// Lista de nomes de categorias que devem aparecer na aba de imagem
const IMAGE_CATEGORY_NAMES = [
  "Imagem", "Midjourney", "DALL-E", "Stable Diffusion", "Leonardo", 
  "Desenho", "Arte", "Fotos", "Renders", "SD", "Design", "Visual"
];

export const ImagePromptsSection = ({ categories, imagePrompts: initialImagePrompts, searchTerm }: ImagePromptsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageCategories, setImageCategories] = useState<any[]>([]);
  
  // Remover a filtragem antiga que usava prefixos
  // Agora vamos usar apenas categorias da tabela image_categories
  
  useEffect(() => {
    loadImagePrompts();
    loadImageCategories();
  }, []);

  const loadImagePrompts = async () => {
    try {
      setIsLoadingPrompts(true);
      const prompts = await fetchImagePrompts();
      setImagePrompts(prompts);
    } catch (err) {
      console.error('Erro ao carregar prompts de imagem:', err);
      toast.error('Erro ao carregar prompts de imagem');
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const loadImageCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchCategories('image');
      
      if (error) throw error;
      
      if (data) {
        // Transformar em estrutura hierárquica
        const hierarchicalData = buildCategoryTree(data);
        setImageCategories(hierarchicalData);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias de imagem:', err);
      toast.error('Erro ao carregar categorias de imagem');
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
        name: category.name, // Não adicionar prefixo
        parentId: category.parent_id,
        type: 'image' as const,
        created_at: category.created_at,
        subcategories: buildCategoryTree(categories, category.id)
      }));
  };

  const handleAddPrompt = async (data: ImagePromptInsert) => {
    try {
      await addImagePrompt(data);
      toast.success('Prompt de imagem adicionado com sucesso');
      loadImagePrompts(); // Recarregar prompts após adicionar
      setShowForm(false);
    } catch (err) {
      console.error('Erro ao adicionar prompt:', err);
      toast.error('Erro ao adicionar prompt de imagem');
    }
  };

  // Usamos as categorias de imagem carregadas diretamente da tabela image_categories
  const allCategories = imageCategories;
  
  // Garantir que temos categorias para trabalhar
  const hasCategories = allCategories && allCategories.length > 0;
  
  // Filtragem de categorias raiz para exibição na interface
  const rootCategories = hasCategories 
    ? allCategories.filter(cat => !cat.parentId)
    : [];

  // Funções de gerenciamento de categorias usando a nova API
  const createCategory = async (name: string, parentId?: string) => {
    try {
      // Não prefixar mais o nome
      const { data, error } = await addCategory('image', name, parentId);

      if (error) throw error;
      
      toast.success('Categoria criada com sucesso');
      // Recarregar categorias sem recarregar a página
      loadImageCategories();
      return true;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      toast.error('Erro ao criar categoria');
      return false;
    }
  };

  const editCategory = async (id: string, name: string, parentId?: string) => {
    try {
      const { error } = await updateCategory('image', id, name, parentId);

      if (error) throw error;
      
      toast.success('Categoria atualizada');
      // Recarregar categorias sem recarregar a página
      loadImageCategories();
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
        .from('image_categories')
        .select('*')
        .eq('parent_id', id);

      if (subError) throw subError;

      if (subcategories && subcategories.length > 0) {
        toast.error(`Não é possível excluir: esta categoria contém ${subcategories.length} subcategorias`);
        return false;
      }

      // Excluir a categoria
      const { error } = await deleteCategory('image', id);

      if (error) throw error;
      
      toast.success('Categoria excluída');
      // Recarregar categorias sem recarregar a página
      loadImageCategories();
      return true;
    } catch (err) {
      console.error('Erro ao remover categoria:', err);
      toast.error('Erro ao excluir categoria');
      return false;
    }
  };
=======
export const ImagePromptsSection = ({ imagePrompts, searchTerm }: ImagePromptsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const { 
    categories: imageCategories, 
    loading, 
    createCategory,
    editCategory,
    removeCategory
  } = useImageCategories();

  const rootCategories = imageCategories.filter(cat => !cat.parentId);
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <AddCategory 
            onAdd={createCategory} 
<<<<<<< HEAD
            categories={allCategories.map(cat => ({
=======
            categories={imageCategories.map(cat => ({
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Prompt de Imagem
          </Button>
=======
          {imageCategories.length > 0 && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Prompt de Imagem
            </Button>
          )}
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
        </div>
      </div>

      {showForm && (
<<<<<<< HEAD
        <ImagePromptLayerEditor
          categories={allCategories.map(cat => ({
=======
        <ImagePromptForm
          categories={imageCategories.map(cat => ({
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
            id: cat.id,
            name: cat.name,
            parentId: cat.parentId,
            prompts: [],
            subcategories: []
          }))}
<<<<<<< HEAD
          onSubmit={handleAddPrompt}
=======
          onSubmit={async (data) => {
            console.log('Criar prompt de imagem:', data);
            setShowForm(false);
          }}
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Carregando categorias de imagem...</div>
<<<<<<< HEAD
      ) : !hasCategories ? (
=======
      ) : imageCategories.length === 0 ? (
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Crie uma categoria para começar a adicionar prompts de imagem
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
              <ImageCategoryTree
                category={category}
<<<<<<< HEAD
                categories={allCategories}
=======
                categories={imageCategories}
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
                imagePrompts={imagePrompts}
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
