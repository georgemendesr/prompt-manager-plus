
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
    // Divide o texto usando múltiplos separadores: quebras de linha, ```, ou espaços duplos
    const prompts = text
      .split(/\n{2,}|```|\s{2,}/)
      .map(t => t.trim())
      .filter(t => t && !t.includes("```")); // Remove strings vazias e backticks

    if (prompts.length && categoryId) {
      onImport(prompts, categoryId);
      setText("");
      setCategoryId("");
      setOpen(false);
    }
  };

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
            placeholder="Cole seus prompts aqui. Eles podem estar separados por quebras de linha duplas, ```, ou espaços duplos"
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
