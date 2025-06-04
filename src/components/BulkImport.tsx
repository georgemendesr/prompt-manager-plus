import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
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
  onImport: (prompts: { text: string; tags: string[] }[], categoryId: string) => void;
}

export const BulkImport = ({ categories, onImport }: BulkImportProps) => {
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [open, setOpen] = useState(false);

  const handleImport = () => {
    const lines = text
      .split(/\n{1,}|```|\s{2,}/)
      .map(t => t.trim())
      .filter(t => t && !t.includes("```") && t.length > 0);

    const prompts = lines.map(line => {
      const [promptText, tagsPart] = line.split("|");
      const tagsArr = tagsPart ? tagsPart.split(',').map(t => t.trim()).filter(Boolean) : [];
      return { text: promptText.trim(), tags: tagsArr };
    });

    if (prompts.length && categoryId) {
      // Merge tags from input with prompt line tags
      const globalTags = tags.split(",").map(t => t.trim()).filter(t => t);
      const promptsWithTags = prompts.map(({ text, tags }) => ({
        text,
        tags: Array.from(new Set([...tags, ...globalTags])),
      }));

      onImport(promptsWithTags, categoryId);
      setTags("");
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
            placeholder="Cole seus prompts aqui. Separe cada linha e opcionalmente adicione '| tag1, tag2'"
            className="min-h-[200px] font-mono"
          />
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags para todos os prompts (separadas por vírgula)"
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