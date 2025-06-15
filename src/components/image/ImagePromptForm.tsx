
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePromptLayerEditor } from "./ImagePromptLayerEditor";
import type { ImageCategory } from "@/types/imageCategory";

interface ImagePromptFormProps {
  categories: ImageCategory[];
  onSubmit: (data: {
    text: string;
    categoryId: string;
    tags: string[];
    layers: any[];
    style?: string;
    aspectRatio?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export const ImagePromptForm = ({
  categories,
  onSubmit,
  onCancel
}: ImagePromptFormProps) => {
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [layers, setLayers] = useState<any[]>([]);
  const [style, setStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !categoryId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        text: text.trim(),
        categoryId,
        tags,
        layers,
        style,
        aspectRatio
      });
      
      // Reset form
      setText("");
      setCategoryId("");
      setTags([]);
      setLayers([]);
      setStyle("");
      setAspectRatio("");
    } catch (error) {
      console.error("Erro ao criar prompt de imagem:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAllCategories = (cats: ImageCategory[], level = 0): ImageCategory[] => {
    return cats.reduce((acc: ImageCategory[], category) => {
      acc.push({ ...category, level });
      if (category.subcategories) {
        acc.push(...getAllCategories(category.subcategories, level + 1));
      }
      return acc;
    }, []);
  };

  const allCategories = getAllCategories(categories);

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="text">Prompt de Imagem</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descreva a imagem que deseja gerar..."
            required
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {"  ".repeat(category.level || 0)}{category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="style">Estilo (opcional)</Label>
          <Input
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="Ex: realista, cartoon, pintura a óleo..."
          />
        </div>

        <div>
          <Label htmlFor="aspectRatio">Proporção (opcional)</Label>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma proporção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">Quadrado (1:1)</SelectItem>
              <SelectItem value="16:9">Paisagem (16:9)</SelectItem>
              <SelectItem value="9:16">Retrato (9:16)</SelectItem>
              <SelectItem value="4:3">Clássico (4:3)</SelectItem>
              <SelectItem value="3:2">Fotografia (3:2)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ImagePromptLayerEditor
          layers={layers}
          onLayersChange={setLayers}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar Prompt"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
