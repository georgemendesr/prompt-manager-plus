import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, GripVertical, Plus } from "lucide-react";
import type { Category } from "@/types/prompt";
import type { TextPromptInsert, PromptBlock } from "@/types/textPrompt";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface TextPromptLayerEditorProps {
  categories: Category[];
  onSubmit: (data: TextPromptInsert) => Promise<void>;
  onCancel: () => void;
}

interface LayerCardProps {
  id: string;
  label: string;
  text: string;
  onLabelChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const LayerCard = ({ 
  id, 
  label, 
  text, 
  onLabelChange, 
  onTextChange, 
  onRemove, 
  canRemove 
}: LayerCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`mb-4 ${isDragging ? 'border-blue-500' : ''}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <label className="text-sm font-medium">Label</label>
            </div>
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                title="Remover camada"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </Button>
            )}
          </div>
          
          <Input
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="Nome da camada (ex: Etapa 1, Contexto, etc)"
            className="mb-3"
          />
          
          <label className="block text-sm font-medium mb-2">Texto</label>
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Digite o conteúdo desta camada do prompt"
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const TextPromptLayerEditor = ({ categories, onSubmit, onCancel }: TextPromptLayerEditorProps) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [layers, setLayers] = useState<PromptBlock[]>([
    { label: 'Etapa 1', text: '' }
  ]);
  const [loading, setLoading] = useState(false);
  
  // Configuração do DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddLayer = () => {
    setLayers([
      ...layers,
      { label: `Etapa ${layers.length + 1}`, text: '' }
    ]);
  };

  const handleRemoveLayer = (index: number) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((_, i) => i !== index));
  };

  const handleLayerLabelChange = (index: number, value: string) => {
    const newLayers = [...layers];
    newLayers[index].label = value;
    setLayers(newLayers);
  };

  const handleLayerTextChange = (index: number, value: string) => {
    const newLayers = [...layers];
    newLayers[index].text = value;
    setLayers(newLayers);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = layers.findIndex(layer => `layer-${layer.label}-${layers.indexOf(layer)}` === active.id);
      const newIndex = layers.findIndex(layer => `layer-${layer.label}-${layers.indexOf(layer)}` === over.id);
      
      const newLayers = [...layers];
      const [movedItem] = newLayers.splice(oldIndex, 1);
      newLayers.splice(newIndex, 0, movedItem);
      
      setLayers(newLayers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!categoryId) {
      alert('Selecione uma categoria');
      return;
    }
    
    if (layers.length < 1) {
      alert('Adicione pelo menos uma camada');
      return;
    }
    
    if (layers.some(layer => !layer.text.trim())) {
      alert('Todas as camadas precisam ter conteúdo');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        category_id: categoryId,
        blocks: layers
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título (opcional)</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do prompt"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-4">Camadas do Prompt</h3>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={layers.map((layer, index) => `layer-${layer.label}-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              {layers.map((layer, index) => (
                <LayerCard
                  key={`layer-${layer.label}-${index}`}
                  id={`layer-${layer.label}-${index}`}
                  label={layer.label}
                  text={layer.text}
                  onLabelChange={(value) => handleLayerLabelChange(index, value)}
                  onTextChange={(value) => handleLayerTextChange(index, value)}
                  onRemove={() => handleRemoveLayer(index)}
                  canRemove={layers.length > 1}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 mt-2"
            onClick={handleAddLayer}
          >
            <Plus className="h-4 w-4" />
            Adicionar Camada
          </Button>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}; 