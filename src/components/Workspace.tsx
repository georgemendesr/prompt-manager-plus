
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Trash, Copy, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkspaceItem } from "@/types/prompt";
import { toast } from "sonner";

export const Workspace = () => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [newText, setNewText] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const addItem = () => {
    if (newText.trim()) {
      const newId = crypto.randomUUID();
      setItems(prev => [...prev, {
        id: newId,
        text: newText.trim(),
        createdAt: new Date()
      }]);
      setExpandedItems(prev => ({ ...prev, [newId]: true }));
      setNewText("");
      toast.success("Texto adicionado à área de trabalho");
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setExpandedItems(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    toast.success("Texto removido da área de trabalho");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado para a área de transferência");
    } catch (err) {
      toast.error("Erro ao copiar texto");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Área de Trabalho</h2>
      
      <Card className="p-4">
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
        <Button onClick={addItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar à área de trabalho
        </Button>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4 relative group">
            <div className="flex justify-between items-start mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6"
                onClick={() => toggleExpand(item.id)}
              >
                {expandedItems[item.id] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(item.text)}
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-200 ${
              expandedItems[item.id] ? 'max-h-[1000px]' : 'max-h-[100px]'
            }`}>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{item.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
