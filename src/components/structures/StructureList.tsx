
import { useState } from "react";
import { Plus, Edit, Trash, Check, X, MessageSquare, Tag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { MusicStructure } from "@/types/prompt";

interface StructureListProps {
  structures: MusicStructure[];
  onAddStructure: (structure: MusicStructure) => void;
  onEditStructure: (id: string, structure: MusicStructure) => void;
  onDeleteStructure: (id: string) => void;
}

export const StructureList = ({ 
  structures, 
  onAddStructure, 
  onEditStructure,
  onDeleteStructure 
}: StructureListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStructure, setNewStructure] = useState({
    name: "",
    description: "",
    tags: "",
    effect: ""
  });

  const handleAdd = () => {
    if (!newStructure.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const structure: MusicStructure = {
      id: crypto.randomUUID(),
      name: newStructure.name.trim(),
      description: newStructure.description.trim(),
      tags: newStructure.tags.split(",").map(tag => tag.trim()),
      effect: newStructure.effect.trim()
    };

    onAddStructure(structure);
    setNewStructure({ name: "", description: "", tags: "", effect: "" });
    setIsAdding(false);
    toast.success("Estrutura adicionada com sucesso!");
  };

  const handleEdit = (structure: MusicStructure) => {
    onEditStructure(structure.id, structure);
    setEditingId(null);
    toast.success("Estrutura atualizada com sucesso!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Estruturas Musicais</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Estrutura
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 space-y-4 mb-6">
          <Input
            placeholder="[Nome da estrutura] (ex: [Ascending progression])"
            value={newStructure.name}
            onChange={(e) => setNewStructure(prev => ({ ...prev, name: e.target.value }))}
          />
          <Textarea
            placeholder="Tags (separadas por vírgula, máximo 5)"
            value={newStructure.tags}
            onChange={(e) => setNewStructure(prev => ({ ...prev, tags: e.target.value }))}
          />
          <Textarea
            placeholder="Efeito/Importância na música"
            value={newStructure.effect}
            onChange={(e) => setNewStructure(prev => ({ ...prev, effect: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Adicionar</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-6 px-4 py-2 bg-gray-100 rounded-lg font-semibold text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Prompt
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            Explicação simples (até 5 tags)
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-500" />
            Importância
          </div>
        </div>

        {structures.map((structure) => (
          <Card key={structure.id} className="p-4">
            {editingId === structure.id ? (
              <div className="space-y-4">
                <Input
                  value={structure.name}
                  onChange={(e) => onEditStructure(structure.id, { ...structure, name: e.target.value })}
                />
                <Input
                  value={structure.tags.join(", ")}
                  onChange={(e) => onEditStructure(structure.id, { 
                    ...structure, 
                    tags: e.target.value.split(",").map(t => t.trim()) 
                  })}
                />
                <Textarea
                  value={structure.effect}
                  onChange={(e) => onEditStructure(structure.id, { ...structure, effect: e.target.value })}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={() => handleEdit(structure)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{structure.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(structure.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        onDeleteStructure(structure.id);
                        toast.success("Estrutura removida com sucesso!");
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    {structure.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{structure.effect}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
