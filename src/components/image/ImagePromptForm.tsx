<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Category } from "@/types/prompt";
import type { ImagePromptInsert } from "@/types/imagePrompt";

interface ImagePromptFormProps {
  categories: Category[];
  onSubmit: (data: ImagePromptInsert) => Promise<void>;
  onCancel: () => void;
}

export const ImagePromptForm = ({ categories, onSubmit, onCancel }: ImagePromptFormProps) => {
  const [title, setTitle] = useState('');
<<<<<<< HEAD
  const [promptText, setPromptText] = useState('');
=======
  const [body, setBody] = useState('');
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [score, setScore] = useState(3);
  const [favorite, setFavorite] = useState(false);
<<<<<<< HEAD
  const [imageUrl, setImageUrl] = useState('');
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!title.trim() || !promptText.trim() || !categoryId) return;
=======
    if (!title.trim() || !body.trim() || !categoryId) return;
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
<<<<<<< HEAD
        prompt_text: promptText.trim(),
        category_id: categoryId,
        tags,
        score,
        favorite,
        image_url: imageUrl.trim() || undefined
=======
        body: body.trim(),
        category_id: categoryId,
        tags,
        score,
        favorite
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do prompt"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-medium mb-2">Prompt de Imagem</label>
          <Textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Digite o prompt para geração de imagem"
=======
          <label className="block text-sm font-medium mb-2">Descrição/Prompt</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Digite a descrição ou prompt para geração de imagem"
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
            rows={4}
            required
          />
        </div>

        <div>
<<<<<<< HEAD
          <label className="block text-sm font-medium mb-2">URL da Imagem (opcional)</label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de uma imagem gerada com este prompt"
          />
        </div>

        <div>
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Digite uma tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button type="button" onClick={handleAddTag} variant="outline">
              Adicionar
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(index)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pontuação (0-5)</label>
            <Input
              type="number"
              min="0"
              max="5"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center gap-2 pt-8">
            <input
              type="checkbox"
              id="favorite"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <label htmlFor="favorite" className="text-sm font-medium">
              Favorito
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};
