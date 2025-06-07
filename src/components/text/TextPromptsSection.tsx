
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddCategory } from "@/components/AddCategory";
import { TextPromptForm } from "./TextPromptForm";
import { TextCategoryTree } from "./TextCategoryTree";
import { useTextCategories } from "@/hooks/text/useTextCategories";
import type { TextPrompt } from "@/types/textPrompt";

interface TextPromptsSectionProps {
  categories: any[];
  textPrompts: TextPrompt[];
  searchTerm: string;
}

export const TextPromptsSection = ({ textPrompts, searchTerm }: TextPromptsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const { 
    categories: textCategories, 
    loading, 
    createCategory,
    editCategory,
    removeCategory
  } = useTextCategories();

  const rootCategories = textCategories.filter(cat => !cat.parentId);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <AddCategory 
            onAdd={createCategory} 
            categories={textCategories.map(cat => ({
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
          {textCategories.length > 0 && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Prompt de Texto
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <TextPromptForm
          categories={textCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            parentId: cat.parentId,
            prompts: [],
            subcategories: []
          }))}
          onSubmit={async (data) => {
            console.log('Criar prompt de texto:', data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Carregando categorias de texto...</div>
      ) : textCategories.length === 0 ? (
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
                categories={textCategories}
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
