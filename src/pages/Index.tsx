
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PromptCard } from "@/components/PromptCard";
import { BulkImport } from "@/components/BulkImport";
import type { Category, Prompt } from "@/types/prompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_CATEGORIES = ["Música", "Imagem", "Texto", "Áudio"];

const Index = () => {
  const [categories, setCategories] = useState<Category[]>(
    DEFAULT_CATEGORIES.map((name) => ({
      id: uuidv4(),
      name,
      prompts: [],
    }))
  );

  const handleRate = (promptId: string, increment: boolean) => {
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        prompts: category.prompts
          .map((prompt) =>
            prompt.id === promptId
              ? { ...prompt, rating: prompt.rating + (increment ? 1 : -1) }
              : prompt
          )
          .sort((a, b) => b.rating - a.rating),
      }))
    );
  };

  const handleAddComment = (promptId: string, comment: string) => {
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        prompts: category.prompts.map((prompt) =>
          prompt.id === promptId
            ? { ...prompt, comments: [...prompt.comments, comment] }
            : prompt
        ),
      }))
    );
  };

  const handleBulkImport = (prompts: string[], categoryName: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              prompts: [
                ...category.prompts,
                ...prompts.map((text) => ({
                  id: uuidv4(),
                  text,
                  category: categoryName,
                  rating: 0,
                  comments: [],
                  createdAt: new Date(),
                })),
              ],
            }
          : category
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Gestor de Prompts</h1>
          <BulkImport
            categories={categories.map((c) => c.name)}
            onImport={handleBulkImport}
          />
        </div>

        <Tabs defaultValue={categories[0]?.name} className="w-full">
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
              className="mt-6 space-y-4"
            >
              {category.prompts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum prompt nesta categoria ainda
                </div>
              ) : (
                category.prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onRate={handleRate}
                    onAddComment={handleAddComment}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
