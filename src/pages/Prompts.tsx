
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";
import { PromptsSection } from "@/components/prompts/PromptsSection";
import { StructureList } from "@/components/structures/StructureList";
import { Workspace } from "@/components/Workspace";
import { AIChat } from "@/components/ai/AIChat";
import { usePromptManager } from "@/hooks/usePromptManager";
import { useStructures } from "@/hooks/useStructures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { updatePromptInDb, deletePromptFromDb } from "@/services/categoryService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Prompts = () => {
  const { signOut } = useAuth();
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const {
    categories,
    loading: categoriesLoading,
    loadError: categoriesLoadError,
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

  const {
    structures,
    loading: structuresLoading,
    loadError: structuresLoadError,
    loadStructures,
    addStructure,
    editStructure,
    deleteStructure
  } = useStructures();

  const editPrompt = async (id: string, newText: string) => {
    try {
      const { error } = await updatePromptInDb(id, newText);
      if (error) throw error;

      loadCategories();
      toast.success("Prompt atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao editar prompt:', error);
      toast.error("Erro ao editar prompt");
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const { error } = await deletePromptFromDb(id);
      if (error) throw error;

      loadCategories();
      toast.success("Prompt excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir prompt:', error);
      toast.error("Erro ao excluir prompt");
    }
  };

  const handleRetryConnection = () => {
    setConnectionError(null);
    loadCategories();
    loadStructures();
    toast.info("Tentando reconectar ao banco de dados...");
  };

  useEffect(() => {
    // Esta parte será removida porque já estamos inicializando o carregamento no usePromptManager
    // loadCategories();
    loadStructures();
  }, [loadStructures]);

  useEffect(() => {
    if (categoriesLoadError || structuresLoadError) {
      setConnectionError(categoriesLoadError || structuresLoadError);
    } else {
      setConnectionError(null);
    }
  }, [categoriesLoadError, structuresLoadError]);

  if (categoriesLoading && !connectionError) {
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
        
        {connectionError && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de conexão</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>Não foi possível conectar ao banco de dados: {connectionError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="self-start flex items-center gap-2"
                onClick={handleRetryConnection}
              >
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
              deletePrompt={deletePrompt}
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
                loadError={structuresLoadError}
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
