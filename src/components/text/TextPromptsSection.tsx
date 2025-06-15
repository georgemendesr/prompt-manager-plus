import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCategory } from "@/components/AddCategory";
import { TextPromptLayerEditor } from "./TextPromptLayerEditor";
import { TextCategoryTree } from "./TextCategoryTree";
import { addTextPrompt, fetchTextPrompts, createTextPromptsTable } from "@/services/text/textPromptService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import type { TextPrompt, TextPromptInsert } from "@/types/textPrompt";
import { addCategory, fetchCategories, updateCategory, deleteCategory } from "@/services/categoryService";

interface TextPromptsSectionProps {
  categories: any[];
  textPrompts: TextPrompt[];
  searchTerm: string;
}

// Lista de nomes de categorias que devem aparecer na aba de texto
const TEXT_CATEGORY_NAMES = [
  "Super Prompts", "ChatGPT", "Gemini", "Claude", "Texto", 
  "Escrita", "LLM", "AI", "Rewrite", "Experts", "GPT"
];

export const TextPromptsSection = ({ categories, textPrompts: initialTextPrompts, searchTerm }: TextPromptsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [textPrompts, setTextPrompts] = useState<TextPrompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textCategories, setTextCategories] = useState<any[]>([]);
  
  useEffect(() => {
    // Verificar e criar a tabela text_prompts se necessário
    createTextPromptsTable().then(result => {
      if (!result.success) {
        toast.warning('A tabela text_prompts não existe no banco de dados', {
          description: 'Consulte a documentação para criar as tabelas necessárias'
        });
      }
    });
    
    loadTextPrompts();
    loadTextCategories();
  }, []);

  const loadTextPrompts = async () => {
    try {
      setIsLoadingPrompts(true);
      const prompts = await fetchTextPrompts();
      setTextPrompts(prompts);
    } catch (err) {
      console.error('Erro ao carregar prompts de texto:', err);
      toast.error('Erro ao carregar prompts de texto');
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const loadTextCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchCategories('text');
      
      if (error) throw error;
      
      if (data) {
        // Transformar em estrutura hierárquica
        const hierarchicalData = buildCategoryTree(data);
        setTextCategories(hierarchicalData);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias de texto:', err);
      toast.error('Erro ao carregar categorias de texto');
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
        type: 'text' as const,
        created_at: category.created_at,
        subcategories: buildCategoryTree(categories, category.id)
      }));
  };

  const handleAddPrompt = async (data: TextPromptInsert) => {
    try {
      await addTextPrompt(data);
      toast.success('Prompt de texto adicionado com sucesso');
      loadTextPrompts(); // Recarregar prompts após adicionar
      setShowForm(false);
    } catch (err) {
      console.error('Erro ao adicionar prompt:', err instanceof Object ? JSON.stringify(err, null, 2) : err);
      toast.error('Erro ao adicionar prompt de texto. Verifique o console para detalhes.');
    }
  };

  // Usamos as categorias de texto carregadas diretamente da tabela text_categories
  const allCategories = textCategories;
  
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
      const { data, error } = await addCategory('text', name, parentId);

      if (error) throw error;
      
      toast.success('Categoria criada com sucesso');
      // Recarregar categorias sem recarregar a página
      loadTextCategories();
      return true;
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      toast.error('Erro ao criar categoria');
      return false;
    }
  };

  const editCategory = async (id: string, name: string, parentId?: string) => {
    try {
      const { error } = await updateCategory('text', id, name, parentId);

      if (error) throw error;
      
      toast.success('Categoria atualizada');
      // Recarregar categorias sem recarregar a página
      loadTextCategories();
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
        .from('text_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError) throw countError;

      if (count && count > 0) {
        toast.error(`Não é possível excluir: existem ${count} prompts nesta categoria`);
        return false;
      }

      // Verificar se há subcategorias
      const { data: subcategories, error: subError } = await supabase
        .from('text_categories')
        .select('*')
        .eq('parent_id', id);

      if (subError) throw subError;

      if (subcategories && subcategories.length > 0) {
        toast.error(`Não é possível excluir: esta categoria contém ${subcategories.length} subcategorias`);
        return false;
      }

      // Excluir a categoria
      const { error } = await deleteCategory('text', id);

      if (error) throw error;
      
      toast.success('Categoria excluída');
      // Recarregar categorias sem recarregar a página
      loadTextCategories();
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
            Novo Prompt de Texto
          </Button>
        </div>
      </div>

      {showForm && (
        <TextPromptLayerEditor
          categories={allCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            parentId: cat.parentId,
            prompts: [],
            subcategories: []
          }))}
          onSubmit={handleAddPrompt}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Carregando categorias de texto...</div>
      ) : !hasCategories ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Crie uma categoria para começar a adicionar prompts de texto
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
              <TextCategoryTree
                category={category}
                categories={allCategories}
                textPrompts={textPrompts}
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
