
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import type { MusicStructure } from "@/types/prompt";

interface BulkImportStructureProps {
  onImport: (structures: MusicStructure[]) => void;
}

export const BulkImportStructure = ({ onImport }: BulkImportStructureProps) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const handleImport = () => {
    try {
      // Divide o texto em linhas e remove linhas vazias
      const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);

      // Estruturas para importar
      const structures: MusicStructure[] = [];
      
      // Processa as linhas em grupos de 2 (nome da estrutura e descrição)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('[')) {
          // Extrai o nome da estrutura
          const nameMatch = line.match(/\[(.*?)\]/);
          if (!nameMatch) continue;

          const name = nameMatch[1];
          // Divide a linha em partes usando tabs ou múltiplos espaços
          const parts = line.split(/\s{2,}|\t/).filter(Boolean);
          
          if (parts.length >= 2) {
            // Extrai tags da descrição
            const descriptionPart = parts[1];
            const tagsMatch = descriptionPart.match(/Tags:(.*?)\./)
            const tags = tagsMatch 
              ? tagsMatch[1].split(',').map(tag => tag.trim())
              : [];

            // Extrai a importância (última parte)
            const effect = parts[2] || '';

            structures.push({
              id: crypto.randomUUID(),
              name,
              description: descriptionPart,
              tags,
              effect
            });
          }
        }
      }

      if (structures.length > 0) {
        onImport(structures);
        setText("");
        setOpen(false);
        toast.success(`${structures.length} estruturas importadas com sucesso!`);
      } else {
        toast.error("Nenhuma estrutura válida encontrada no texto");
      }
    } catch (error) {
      console.error('Erro ao processar estruturas:', error);
      toast.error("Erro ao processar o texto. Verifique o formato.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Estruturas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Estruturas Musicais</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Cole suas estruturas aqui, exemplo:
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
