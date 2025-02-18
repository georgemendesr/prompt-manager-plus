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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, created_at');

      if (categoriesError) throw categoriesError;

      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('id, text, category_id, rating, created_at');

      if (promptsError) throw promptsError;

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, prompt_id, text, created_at');

      if (commentsError) throw commentsError;

      const formattedCategories = categoriesData.map(category => ({
        id: category.id,
        name: category.name,
        prompts: promptsData
          ?.filter(prompt => prompt.category_id === category.id)
          .map(prompt => ({
            id: prompt.id,
            text: prompt.text,
            category: category.name,
            rating: prompt.rating,
            comments: commentsData
              ?.filter(comment => comment.prompt_id === prompt.id)
              .map(comment => comment.text) || [],
            createdAt: new Date(prompt.created_at),
            selected: false
          })) || []
      }));

      setCategories(formattedCategories);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name: newCategory.trim() }])
          .select()
          .single();

        if (error) throw error;

        setCategories(prev => [...prev, {
          id: data.id,
          name: data.name,
          prompts: []
        }]);
        
        setNewCategory("");
        setDialogOpen(false);
        toast.success('Categoria adicionada com sucesso!');
      } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        toast.error('Erro ao adicionar categoria');
      }
    }
  };

  const handleRate = async (promptId: string, increment: boolean) => {
    try {
      const prompt = categories
        .flatMap(c => c.prompts)
        .find(p => p.id === promptId);

      if (!prompt) return;

      const newRating = prompt.rating + (increment ? 1 : -1);

      const { error } = await supabase
        .from('prompts')
        .update({ rating: newRating })
        .eq('id', promptId);

      if (error) throw error;

      setCategories(prev =>
        prev.map((category) => ({
          ...category,
          prompts: category.prompts
            .map((p) =>
              p.id === promptId
                ? { ...p, rating: newRating }
                : p
            )
            .sort((a, b) => b.rating - a.rating),
        }))
      );
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      toast.error('Erro ao atualizar avaliação');
    }
  };

  const handleAddComment = async (promptId: string, comment: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ prompt_id: promptId, text: comment }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev =>
        prev.map((category) => ({
          ...category,
          prompts: category.prompts.map((prompt) =>
            prompt.id === promptId
              ? { ...prompt, comments: [...prompt.comments, comment] }
              : prompt
          ),
        }))
      );

      toast.success('Comentário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const handleBulkImport = async (prompts: string[], categoryName: string) => {
    try {
      const category = categories.find(c => c.name === categoryName);
      if (!category) return;

      const newPrompts = prompts.map(text => ({
        text,
        category_id: category.id,
        rating: 0
      }));

      const { data, error } = await supabase
        .from('prompts')
        .insert(newPrompts)
        .select();

      if (error) throw error;

      setCategories(prev =>
        prev.map((c) =>
          c.name === categoryName
            ? {
                ...c,
                prompts: [
                  ...c.prompts,
                  ...data.map((p) => ({
                    id: p.id,
                    text: p.text,
                    category: categoryName,
                    rating: 0,
                    comments: [],
                    createdAt: new Date(p.created_at),
                    selected: false,
                  })),
                ],
              }
            : c
        )
      );

      toast.success('Prompts importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar prompts:', error);
      toast.error('Erro ao importar prompts');
    }
  };

  const handleDeleteSelected = async (categoryName: string) => {
    try {
      const category = categories.find(c => c.name === categoryName);
      if (!category) return;

      const selectedPromptIds = category.prompts
        .filter(p => p.selected)
        .map(p => p.id);

      if (selectedPromptIds.length === 0) return;

      const { error } = await supabase
        .from('prompts')
        .delete()
        .in('id', selectedPromptIds);

      if (error) throw error;

      setCategories(prev =>
        prev.map((c) =>
          c.name === categoryName
            ? {
                ...c,
                prompts: c.prompts.filter((prompt) => !prompt.selected),
              }
            : c
        )
      );

      toast.success('Prompts excluídos com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir prompts:', error);
      toast.error('Erro ao excluir prompts');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

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
