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
<<<<<<< HEAD
  const [error, setError] = useState("");

  // Função para limpar e validar tags
  const sanitizeTags = (tags: string[]): string[] => {
    return tags
      .map(tag => tag.trim())
      .filter(tag => {
        // Remover tags vazias
        if (!tag) return false;
        
        // Verificar se a tag é um código com formato específico (como AN-CAN-116)
        // que pode causar erro de conversão para inteiro
        if (/^\w+-\w+-\d+$/.test(tag)) {
          console.log(`Tag com formato de código detectada e convertida para string: "${tag}"`);
          return true; // Manter a tag, mas como string
        }
        
        return true;
      });
  };

  const processText = (inputText: string) => {
    try {
      // Remover caracteres especiais que podem causar problemas
      const cleanText = inputText.replace(/[^\w\s,.;:|#@%&*()[\]{}'"<>?!-]/g, ' ');
      
      // Dividir o texto em linhas
      const lines = cleanText
        .split(/\n{1,}|```|\s{2,}/)
        .map(t => t.trim())
        .filter(t => t && !t.includes("```") && t.length > 0);
      
      console.log(`Processando ${lines.length} linhas de texto`);
      
      return lines.map(line => {
        // Verificar se a linha contém um separador de tags
        const parts = line.split("|");
        const promptText = parts[0].trim();
        
        // Se houver tags após o separador |, processá-las
        let rawTags: string[] = [];
        if (parts.length > 1 && parts[1].trim()) {
          rawTags = parts[1].split(',').map(t => t.trim()).filter(Boolean);
        }
        
        // Garantir que o texto não esteja vazio
        if (!promptText) {
          console.warn("Linha ignorada por não ter texto:", line);
          return null;
        }
        
        return { 
          text: promptText, 
          tags: sanitizeTags(rawTags) 
        };
      }).filter(Boolean); // Remover itens nulos
    } catch (err) {
      console.error("Erro ao processar texto:", err);
      setError(`Erro ao processar texto: ${err.message}`);
      return [];
    }
  };

  const handleImport = () => {
    setError("");
    
    if (!text.trim()) {
      setError("O texto não pode estar vazio");
      return;
    }
    
    if (!categoryId) {
      setError("Selecione uma categoria");
      return;
    }
    
    try {
      // Processar o texto para extrair prompts e tags
      const processedPrompts = processText(text);
      
      if (processedPrompts.length === 0) {
        setError("Nenhum prompt válido encontrado no texto");
        return;
      }
      
      console.log(`Processados ${processedPrompts.length} prompts`);
      
      // Processar tags globais
      const globalTags = sanitizeTags(tags.split(","));
      
      // Combinar tags globais com tags específicas de cada prompt
      const promptsWithTags = processedPrompts.map(({ text, tags }) => ({
        text,
        tags: Array.from(new Set([...tags, ...globalTags])),
      }));
      
      // Verificar se há prompts muito longos
      const longPrompts = promptsWithTags.filter(p => p.text.length > 5000);
      if (longPrompts.length > 0) {
        console.warn(`${longPrompts.length} prompts são muito longos (>5000 caracteres)`);
      }
      
      // Importar os prompts
      onImport(promptsWithTags, categoryId);
      
      // Limpar o formulário
=======

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
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      setTags("");
      setText("");
      setCategoryId("");
      setOpen(false);
<<<<<<< HEAD
    } catch (err) {
      console.error("Erro durante a importação:", err);
      setError(`Erro durante a importação: ${err.message}`);
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
        <Button variant="outline" className="flex items-center gap-2">
=======
        <Button className="gap-2">
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          <Upload className="h-4 w-4" />
          Importar Prompts
        </Button>
      </DialogTrigger>
<<<<<<< HEAD
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Prompts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              placeholder="Tags globais (separadas por vírgula)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Cole seus prompts aqui, um por linha. Use | para separar o prompt das tags."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button onClick={handleImport} disabled={!text || !categoryId}>
            Importar
          </Button>
=======
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
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
        </div>
      </DialogContent>
    </Dialog>
  );
};