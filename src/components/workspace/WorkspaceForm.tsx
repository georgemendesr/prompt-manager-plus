
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface WorkspaceFormProps {
  onAdd: (text: string) => Promise<void>;
}

export const WorkspaceForm = ({ onAdd }: WorkspaceFormProps) => {
  const [newText, setNewText] = useState("");
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    await onAdd(newText);
    setNewText("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado para a área de transferência");
    } catch (err) {
      toast.error("Erro ao copiar texto");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Área de Trabalho</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFormExpanded(!isFormExpanded)}
          className="gap-2"
        >
          {isFormExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {isFormExpanded ? "Recolher" : "Expandir"}
        </Button>
      </div>
      
      <Card className={`p-4 overflow-hidden transition-all duration-200 ${
        isFormExpanded ? 'max-h-[1000px]' : 'max-h-[60px]'
      }`}>
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => copyToClipboard(newText)}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
        </div>
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Cole seu texto aqui..."
          className="min-h-[200px] md:min-h-[300px] mb-4"
        />
        <Button onClick={handleAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar à área de trabalho
        </Button>
      </Card>
    </>
  );
};
