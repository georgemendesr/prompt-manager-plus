
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useImagePrompts } from "@/hooks/useImagePrompts";
import { ImagePromptForm } from "./ImagePromptForm";
import type { Category } from "@/types/prompt";
import type { ImagePrompt } from "@/types/imagePrompt";

interface ImagePromptsSectionProps {
  categories: Category[];
  imagePrompts: ImagePrompt[];
  searchTerm: string;
}

export const ImagePromptsSection = ({ categories, imagePrompts, searchTerm }: ImagePromptsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const { loading, createImagePrompt, editImagePrompt, removeImagePrompt } = useImagePrompts();

  const imageCategories = categories.filter(c => 'type' in c && (c as any).type === 'image' && !c.parentId);

  const filteredPrompts = imagePrompts.filter(prompt =>
    !searchTerm || 
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Prompts de Imagem</h2>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Prompt
        </Button>
      </div>

      {showForm && (
        <ImagePromptForm
          categories={imageCategories}
          onSubmit={async (data) => {
            await createImagePrompt(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Carregando prompts de imagem...</div>
      ) : (
        <div className="grid gap-4">
          {filteredPrompts.map((prompt) => {
            const category = categories.find(c => c.id === prompt.category_id);
            return (
              <Card key={prompt.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{prompt.title}</h3>
                    {prompt.favorite && <span className="text-yellow-500">⭐</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">⭐ {prompt.score}/5</span>
                    <Badge variant="outline">{category?.name || 'Sem categoria'}</Badge>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{prompt.body}</p>
                {prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum prompt encontrado' : 'Nenhum prompt de imagem criado ainda'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
