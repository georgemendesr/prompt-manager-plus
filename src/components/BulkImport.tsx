
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

interface BulkImportProps {
  categories: string[];
  onImport: (prompts: string[], category: string) => void;
}

export const BulkImport = ({ categories, onImport }: BulkImportProps) => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);

  const handleImport = () => {
    const prompts = text
      .split("```")
      .map(t => t.trim())
      .filter(t => t && !t.includes("```")); // Remove empty strings and backticks

    if (prompts.length && category) {
      onImport(prompts, category);
      setText("");
      setCategory("");
      setOpen(false);
    }
  };

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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole seus prompts aqui, separados por ```"
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
