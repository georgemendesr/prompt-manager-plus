
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
    <div className="container mx-auto p-2 sm:p-4 relative min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
              alt="R10 Comunicação Criativa" 
              className="h-10 sm:h-14 w-auto"
            />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
              Prompts
            </h1>
          </div>
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
              <div className="flex flex-wrap gap-2">
                <AddCategory onAdd={addCategory} categories={categories} />
                {categories.length > 0 && (
                  <BulkImport
                    categories={categories}
                    onImport={bulkImportPrompts}
                  />
                )}
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

          <TabsContent value="estrutura" className="mt-4 sm:mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6">
              <StructureList 
                structures={[]} 
                onAddStructure={() => {}} 
                onEditStructure={() => {}} 
                onDeleteStructure={() => {}} 
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
