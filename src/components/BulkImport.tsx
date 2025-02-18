
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Category } from "@/types/prompt";

interface BulkImportProps {
  categories: Category[];
  onImport: (prompts: string[], categoryId: string) => void;
}

export const BulkImport = ({ categories, onImport }: BulkImportProps) => {
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [open, setOpen] = useState(false);

  const handleImport = () => {
    // Divide o texto em linhas e remove linhas vazias
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    // Filtra apenas as linhas que começam com [
    const prompts = lines
      .filter(line => line.startsWith('['))
      .map(line => {
        // Pega apenas a parte entre colchetes
        const match = line.match(/\[(.*?)\]/);
        return match ? match[1] : line;
      });

    if (prompts.length && categoryId) {
      onImport(prompts, categoryId);
      setText("");
      setCategoryId("");
      setOpen(false);
    }
  };

  // Função recursiva para obter todas as categorias e subcategorias
  const getAllCategories = (categories: Category[]): Category[] => {
    return categories.reduce((acc: Category[], category) => {
      acc.push(category);
      if (category.subcategories?.length) {
        acc.push(...getAllCategories(category.subcategories));
      }
      return acc;
    }, []);
  };

  const allCategories = getAllCategories(categories);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Prompts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Prompts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.parentId ? `↳ ${category.name}` : category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Cole seus prompts aqui, exemplo:
[Ascending progression]  Notas ou acordes que sobem, aumentando a energia. Tags: subida, energia, tensão, escalada, progressão.  Cria tensão e expectativa, conduzindo o ouvinte a um ponto culminante na música.
[Anticipatory lyrics]  Letras que dão pistas do que vem a seguir. Tags: pista, previsão, engajamento, suspense, preparação.  Mantém o ouvinte engajado, preparando-o emocionalmente para as próximas partes.`}
            className="min-h-[200px] font-mono"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport}>Importar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
