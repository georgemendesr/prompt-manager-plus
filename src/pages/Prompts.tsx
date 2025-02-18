import { useEffect } from "react";
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

const Prompts = () => {
  const { signOut } = useAuth();
  const {
    categories,
    loading,
    loadCategories,
    addCategory,
    ratePrompt,
    addComment,
    movePrompt,
    bulkImportPrompts,
    deleteSelectedPrompts,
    togglePromptSelection,
    toggleSelectAll
  } = usePromptManager();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 relative min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
              alt="R10 Comunicação Criativa" 
              className="h-16 w-auto"
            />
            <h1 className="text-3xl font-bold text-gray-800">
              Gestor de Prompts
            </h1>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
        
        <Tabs defaultValue="prompts" className="w-full">
          <TabsList className="bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
            <TabsTrigger value="workspace">Área de Trabalho</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Prompts</h2>
                <div className="flex gap-2">
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
                  <TabsList className="w-full justify-start mb-6 bg-gray-100/80 p-1 rounded-lg">
                    {categories
                      .filter(category => !category.parentId)
                      .map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.name}
                          className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                  </TabsList>

                  {categories
                    .filter(category => !category.parentId)
                    .map((category) => (
                      <TabsContent
                        key={category.id}
                        value={category.name}
                        className="mt-6 space-y-6"
                      >
                        <CategoryTree
                          category={category}
                          categories={categories}
                          onRatePrompt={ratePrompt}
                          onAddComment={addComment}
                          onMovePrompt={movePrompt}
                          onTogglePromptSelection={togglePromptSelection}
                          onToggleSelectAll={toggleSelectAll}
                          onDeleteSelectedPrompts={deleteSelectedPrompts}
                        />
                      </TabsContent>
                    ))}
                </Tabs>
              )}
            </div>
          </TabsContent>

          <TabsContent value="estrutura" className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <StructureList 
                structures={[]} 
                onAddStructure={() => {}} 
                onEditStructure={() => {}} 
                onDeleteStructure={() => {}} 
              />
            </div>
          </TabsContent>

          <TabsContent value="workspace" className="mt-6">
            <Workspace />
          </TabsContent>
        </Tabs>
      </div>
      <AIChat />
    </div>
  );
};

export default Prompts;
