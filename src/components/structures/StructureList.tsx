
import { useState } from "react";
import { Plus, MessageSquare, Tag, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { MusicStructure } from "@/types/prompt";
import { StructureItem } from "./StructureItem";
import { BulkImportStructure } from "./BulkImportStructure";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StructureListProps {
  structures: MusicStructure[];
  loadError?: string | null;
  onAddStructure: (structureOrStructures: MusicStructure | MusicStructure[]) => void;
  onEditStructure: (id: string, structure: MusicStructure) => void;
  onDeleteStructure: (id: string) => void;
}

export const StructureList = ({ 
  structures, 
  loadError,
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
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Estruturas Musicais</h2>
        <div className="flex gap-2">
          <BulkImportStructure onImport={onAddStructure} />
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Estrutura
          </Button>
        </div>
      </div>

      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar estruturas. Você pode continuar usando o aplicativo, mas as estruturas não estão disponíveis no momento.
          </AlertDescription>
        </Alert>
      )}

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
        {structures.length > 0 ? (
          <>
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
              <StructureItem
                key={structure.id}
                structure={structure}
                onEdit={onEditStructure}
                onDelete={onDeleteStructure}
                editingId={editingId}
                setEditingId={setEditingId}
              />
            ))}
          </>
        ) : !loadError ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            Nenhuma estrutura encontrada. Crie uma nova estrutura ou importe algumas para começar.
          </div>
        ) : null}
      </div>
    </div>
  );
};
