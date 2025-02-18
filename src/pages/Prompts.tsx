import { useEffect, useState } from "react";
import { PromptCard } from "@/components/PromptCard";
import { BulkImport } from "@/components/BulkImport";
import { AddCategory } from "@/components/AddCategory";
import { CategoryActions } from "@/components/CategoryActions";
import { Workspace } from "@/components/Workspace";
import { usePromptManager } from "@/hooks/usePromptManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { LogOut, ChevronRight, ChevronDown } from "lucide-react";
import type { Category } from "@/types/prompt";
import { StructureList } from "@/components/structures/StructureList";

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

  // Iniciando com um Set vazio - todas as categorias começam recolhidas
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

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

  const renderCategoryContent = (category: Category, level = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className={`space-y-4 ${level > 0 ? 'ml-6' : ''}`}>
        {level > 0 && (
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => hasSubcategories && toggleCategory(category.id)}
          >
            {hasSubcategories && (
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <h3 className="text-lg font-semibold text-gray-700 hover:text-gray-900">
              {category.name}
            </h3>
          </div>
        )}
        
        {(!level || isExpanded) && (
          <>
            <CategoryActions
              prompts={category.prompts}
              onSelectAll={(checked) => toggleSelectAll(category.name, checked)}
              onDelete={() => deleteSelectedPrompts(category.name)}
              onMove={(targetCategoryId) => {
                const selectedPrompts = category.prompts.filter(p => p.selected);
                selectedPrompts.forEach(prompt => movePrompt(prompt.id, targetCategoryId));
              }}
              categories={categories}
              currentCategoryId={category.id}
            />
            
            {category.prompts.length === 0 && category.subcategories?.length === 0 && (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                Nenhum prompt nesta categoria ainda
              </div>
            )}

            {category.prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onRate={ratePrompt}
                onAddComment={addComment}
                onSelect={togglePromptSelection}
                selected={prompt.selected || false}
                categories={categories}
              />
            ))}

            {category.subcategories?.map((subCategory) => 
              renderCategoryContent(subCategory, level + 1)
            )}
          </>
        )}
      </div>
    );
  };

  const renderPrompts = () => (
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
                {renderCategoryContent(category)}
              </TabsContent>
            ))}
        </Tabs>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            {renderPrompts()}
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
    </div>
  );
};

export default Prompts;
