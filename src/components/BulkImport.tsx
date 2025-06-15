
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/prompt";
import { AdminGuard } from "./AdminGuard";
import { toast } from "sonner";

interface BulkImportProps {
  categories: Category[];
  onImport: (prompts: { text: string; tags: string[] }[], categoryName: string) => Promise<void>;
}

export const BulkImport = ({ categories, onImport }: BulkImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parsePrompts = (input: string) => {
    const lines = input.split('\n').filter(line => line.trim());
    const prompts: { text: string; tags: string[] }[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Extract hashtags from the line
      const hashtagMatches = trimmedLine.match(/#\w+/g) || [];
      const tags = hashtagMatches.map(tag => tag.substring(1)); // Remove # prefix
      
      // Remove hashtags from the text
      const text = trimmedLine.replace(/#\w+/g, '').trim();
      
      if (text) {
        prompts.push({ text, tags });
      }
    }
    
    return prompts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selectedCategory) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const prompts = parsePrompts(text);
      if (prompts.length === 0) {
        toast.error("Nenhum prompt válido encontrado");
        return;
      }

      const category = categories.find(cat => cat.name === selectedCategory);
      if (!category) {
        toast.error("Categoria não encontrada");
        return;
      }

      await onImport(prompts, category.name);
      setText("");
      setSelectedCategory("");
      setIsOpen(false);
      toast.success(`${prompts.length} prompts importados com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar prompts:", error);
      toast.error("Erro ao importar prompts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminGuard>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar Prompts
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Prompts em Lote</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Categoria de Destino</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prompts">
                Prompts (um por linha, use #tag para adicionar tags)
              </Label>
              <Textarea
                id="prompts"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Exemplo:
Create a jazz melody with saxophone #jazz #instrumental
Write a pop song about love #pop #love #romantic
Generate rock music with heavy guitar #rock #guitar`}
                className="min-h-[200px]"
                required
              />
            </div>
            <div className="text-sm text-gray-600">
              <strong>Formato:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Um prompt por linha</li>
                <li>Use #tag para adicionar tags aos prompts</li>
                <li>As tags serão extraídas automaticamente</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Importando..." : "Importar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
};
