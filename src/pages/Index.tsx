import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PromptCard } from "@/components/PromptCard";
import { BulkImport } from "@/components/BulkImport";
import type { Category, Prompt } from "@/types/prompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = 'prompt-manager-data';

const Index = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.map((category: Category) => ({
        ...category,
        prompts: category.prompts.map(prompt => ({
          ...prompt,
          createdAt: new Date(prompt.createdAt)
        }))
      }));
    }
    return [];
  });
  const [newCategory, setNewCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories((prev) => [
        ...prev,
        {
          id: uuidv4(),
          name: newCategory.trim(),
          prompts: [],
        },
      ]);
      setNewCategory("");
      setDialogOpen(false);
    }
  };

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
                  selected: false,
                })),
              ],
            }
          : category
      )
    );
  };

  const handleSelectPrompt = (promptId: string, selected: boolean) => {
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        prompts: category.prompts.map((prompt) =>
          prompt.id === promptId ? { ...prompt, selected } : prompt
        ),
      }))
    );
  };

  const handleSelectAll = (categoryName: string, selected: boolean) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              prompts: category.prompts.map((prompt) => ({
                ...prompt,
                selected,
              })),
            }
          : category
      )
    );
  };

  const handleDeleteSelected = (categoryName: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              prompts: category.prompts.filter((prompt) => !prompt.selected),
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
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nome da categoria"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCategory}>Adicionar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {categories.length > 0 && (
              <BulkImport
                categories={categories.map((c) => c.name)}
                onImport={handleBulkImport}
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
                className="mt-6 space-y-4"
              >
                {category.prompts.length > 0 && (
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={category.prompts.every((p) => p.selected)}
                        onCheckedChange={(checked) => 
                          handleSelectAll(category.name, checked as boolean)
                        }
                      />
                      <span className="text-sm text-gray-600">Selecionar todos</span>
                    </div>
                    {category.prompts.some((p) => p.selected) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSelected(category.name)}
                        className="gap-2"
                      >
                        <Trash className="h-4 w-4" />
                        Excluir selecionados
                      </Button>
                    )}
                  </div>
                )}
                
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
                      onSelect={handleSelectPrompt}
                      selected={prompt.selected || false}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
