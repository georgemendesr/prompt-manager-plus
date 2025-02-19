
import React, { useEffect, useState } from "react";
import { BulkImport } from "@/components/BulkImport";
import { AddCategory } from "@/components/AddCategory";
import { Workspace } from "@/components/Workspace";
import { CategoryTree } from "@/components/CategoryTree";
import { usePromptManager } from "@/hooks/usePromptManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { LogOut } from "lucide-react";
import { StructureList } from "@/components/structures/StructureList";
import { AIChat } from "@/components/ai/AIChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MusicStructure } from "@/types/prompt";
import { Link } from "react-router-dom";

const Prompts = () => {
  const { signOut } = useAuth();
  const [structures, setStructures] = useState<MusicStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const {
    categories,
    loading: categoriesLoading,
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
    toggleSelectAll
  } = usePromptManager();

  const editPrompt = async (id: string, newText: string) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ text: newText })
        .eq('id', id);

      if (error) throw error;

      const updatedCategories = categories.map(category => ({
        ...category,
        prompts: category.prompts.map(prompt =>
          prompt.id === id ? { ...prompt, text: newText } : prompt
        ),
        subcategories: category.subcategories?.map(subcat => ({
          ...subcat,
          prompts: subcat.prompts.map(prompt =>
            prompt.id === id ? { ...prompt, text: newText } : prompt
          )
        }))
      }));

      loadCategories();
      toast.success("Prompt atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao editar prompt:', error);
      toast.error("Erro ao editar prompt");
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const addStructure = async (structureOrStructures: MusicStructure | MusicStructure[]) => {
    try {
      const structuresToAdd = Array.isArray(structureOrStructures) 
        ? structureOrStructures 
        : [structureOrStructures];

      const { error } = await supabase
        .from('structures')
        .insert(structuresToAdd.map(structure => ({
          name: structure.name,
          description: structure.description,
          tags: structure.tags,
          effect: structure.effect
        })));

      if (error) throw error;

      loadStructures();
      toast.success(`${structuresToAdd.length} estrutura(s) adicionada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao adicionar estrutura:', error);
      toast.error('Erro ao adicionar estrutura');
    }
  };

  const editStructure = async (id: string, structure: MusicStructure) => {
    try {
      const { error } = await supabase
        .from('structures')
        .update({
          name: structure.name,
          description: structure.description,
          tags: structure.tags,
          effect: structure.effect
        })
        .eq('id', id);

      if (error) throw error;

      loadStructures();
      toast.success('Estrutura atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar estrutura:', error);
      toast.error('Erro ao atualizar estrutura');
    }
  };

  const deleteStructure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStructures(prev => prev.filter(s => s.id !== id));
      toast.success('Estrutura removida com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar estrutura:', error);
      toast.error('Erro ao deletar estrutura');
    }
  };

  useEffect(() => {
    loadCategories();
    loadStructures();
  }, [loadCategories]);

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 relative min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link 
            to="/prompts" 
            className="flex items-center gap-2"
          >
            <img 
              src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
              alt="R10 Comunicação Criativa" 
              className="h-10 sm:h-14 w-auto"
            />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
              Prompts
            </h1>
          </Link>
          <Button 
            variant="outline" 
            onClick={signOut}
            size="sm"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
        
        <Tabs defaultValue="prompts" className="w-full">
          <TabsList className="bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 w-full flex">
            <TabsTrigger value="prompts" className="flex-1">Prompts</TabsTrigger>
            <TabsTrigger value="estrutura" className="flex-1">Estrutura</TabsTrigger>
            <TabsTrigger value="workspace" className="flex-1">Workspace</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <AddCategory onAdd={addCategory} categories={categories} />
                  {categories.length > 0 && (
                    <BulkImport
                      categories={categories}
                      onImport={bulkImportPrompts}
                    />
                  )}
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  Crie uma categoria para começar a adicionar prompts
                </div>
              ) : (
                <Tabs defaultValue={categories[0]?.name} className="w-full">
                  <div className="max-w-full overflow-hidden">
                    <TabsList className="bg-gray-100/80 p-1 rounded-lg max-w-full overflow-x-auto flex gap-1 no-scrollbar">
                      {categories
                        .filter(category => !category.parentId)
                        .map((category) => (
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

                  {categories
                    .filter(category => !category.parentId)
                    .map((category) => (
                      <TabsContent
                        key={category.id}
                        value={category.name}
                        className="mt-4 sm:mt-6"
                      >
                        <CategoryTree
                          category={category}
                          categories={categories}
                          onRatePrompt={ratePrompt}
                          onAddComment={addComment}
                          onEditPrompt={editPrompt}
                          onMovePrompt={movePrompt}
                          onTogglePromptSelection={togglePromptSelection}
                          onToggleSelectAll={toggleSelectAll}
                          onDeleteSelectedPrompts={deleteSelectedPrompts}
                          onEditCategory={editCategory}
                          onDeleteCategory={deleteCategory}
                          searchTerm={globalSearchTerm}
                          setSearchTerm={setGlobalSearchTerm}
                        />
                      </TabsContent>
                    ))}
                </Tabs>
              )}
            </div>
          </TabsContent>

          <TabsContent value="estrutura" className="mt-4 sm:mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6">
              <StructureList 
                structures={structures} 
                onAddStructure={addStructure} 
                onEditStructure={editStructure} 
                onDeleteStructure={deleteStructure} 
              />
            </div>
          </TabsContent>

          <TabsContent value="workspace" className="mt-4 sm:mt-6">
            <Workspace />
          </TabsContent>
        </Tabs>
      </div>
      <AIChat />
    </div>
  );
};

export default Prompts;
