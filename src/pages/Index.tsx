
import { useEffect, useState } from "react";
import { PromptCard } from "@/components/PromptCard";
import { BulkImport } from "@/components/BulkImport";
import { AddCategory } from "@/components/AddCategory";
import { CategoryActions } from "@/components/CategoryActions";
import { Workspace } from "@/components/Workspace";
import { usePromptManager } from "@/hooks/usePromptManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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

  const renderCategory = (category: typeof categories[0]) => (
    <div key={category.id} className="space-y-4">
      <CategoryActions
        prompts={category.prompts}
        onSelectAll={(checked) => toggleSelectAll(category.name, checked)}
        onDelete={() => deleteSelectedPrompts(category.name)}
      />
      
      {category.prompts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum prompt nesta categoria ainda
        </div>
      ) : (
        category.prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onRate={ratePrompt}
            onAddComment={addComment}
            onSelect={togglePromptSelection}
            onMove={movePrompt}
            selected={prompt.selected || false}
            categories={categories}
          />
        ))
      )}

      {category.subcategories?.map(renderCategory)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">Gestor de Prompts</h1>
              <div className="flex gap-2">
                <AddCategory onAdd={addCategory} />
                {categories.length > 0 && (
                  <BulkImport
                    categories={categories.map((c) => c.name)}
                    onImport={bulkImportPrompts}
                  />
                )}
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Crie uma categoria para começar a adicionar prompts
              </div>
            ) : (
              <Tabs 
                defaultValue={categories[0]?.name} 
                className="w-full"
                onValueChange={setSelectedCategory}
              >
                <TabsList className="w-full justify-start">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.name}
                      className="min-w-[100px]"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent
                    key={category.id}
                    value={category.name}
                    className="mt-6"
                  >
                    {renderCategory(category)}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          <div className="space-y-6">
            <Workspace />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
