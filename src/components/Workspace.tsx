
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";
import type { WorkspaceItem } from "@/types/prompt";
import { toast } from "sonner";

export const Workspace = () => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [newText, setNewText] = useState("");

  const addItem = () => {
    if (newText.trim()) {
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        text: newText.trim(),
        createdAt: new Date()
      }]);
      setNewText("");
      toast.success("Texto adicionado à área de trabalho");
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success("Texto removido da área de trabalho");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Área de Trabalho</h2>
      
      <Card className="p-4">
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Cole seu texto aqui..."
          className="min-h-[100px] mb-4"
        />
        <Button onClick={addItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar à área de trabalho
        </Button>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4 relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeItem(item.id)}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{item.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
