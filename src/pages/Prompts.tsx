
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";
import { PromptsSection } from "@/components/prompts/PromptsSection";
import { StructureList } from "@/components/structures/StructureList";
import { Workspace } from "@/components/Workspace";
import { AIChat } from "@/components/ai/AIChat";
import { usePromptManager } from "@/hooks/usePromptManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MusicStructure } from "@/types/prompt";

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
        <PromptsHeader onSignOut={signOut} />
        
        <Tabs defaultValue="prompts" className="w-full">
          <TabsList className="bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 w-full flex">
            <TabsTrigger value="prompts" className="flex-1">Prompts</TabsTrigger>
            <TabsTrigger value="estrutura" className="flex-1">Estrutura</TabsTrigger>
            <TabsTrigger value="workspace" className="flex-1">Workspace</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-4 sm:mt-6">
            <PromptsSection 
              categories={categories}
              addCategory={addCategory}
              bulkImportPrompts={bulkImportPrompts}
              ratePrompt={ratePrompt}
              addComment={addComment}
              editPrompt={editPrompt}
              movePrompt={movePrompt}
              togglePromptSelection={togglePromptSelection}
              toggleSelectAll={toggleSelectAll}
              deleteSelectedPrompts={deleteSelectedPrompts}
              editCategory={editCategory}
              deleteCategory={deleteCategory}
              searchTerm={globalSearchTerm}
              setSearchTerm={setGlobalSearchTerm}
            />
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
