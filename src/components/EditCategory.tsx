import { useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Category } from "@/types/prompt";
import { getAllDescendantIds } from "@/utils/categoryTreeUtils";

interface EditCategoryProps {
  category: Category;
  availableParentCategories?: Category[];
  onClose: () => void;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
}

export const EditCategory = ({ 
  category,
  availableParentCategories = [],
  onClose,
  onEditCategory
}: EditCategoryProps) => {
  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState<string | undefined>(category.parentId);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Lista de IDs que não podem ser selecionados como pai (para evitar ciclos)
  const invalidParentIds = useMemo(() => {
    // A própria categoria e todos seus descendentes não podem ser selecionados como pai
    const descendantIds = getAllDescendantIds(availableParentCategories, category.id);
    return [category.id, ...descendantIds];
  }, [availableParentCategories, category.id]);

  const handleParentChange = (newParentId: string) => {
    // Resetar erro de validação
    setValidationError(null);
    
    // Verificar se a seleção criaria um ciclo
    if (invalidParentIds.includes(newParentId)) {
      setValidationError("Esta seleção criaria um ciclo na hierarquia. Por favor, escolha outra categoria pai.");
      return;
    }
    
    setParentId(newParentId === "root" ? undefined : newParentId);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setValidationError("O nome da categoria não pode estar vazio");
      return;
    }
    
    // Verificar novamente se a seleção de pai é válida
    if (parentId && invalidParentIds.includes(parentId)) {
      setValidationError("Esta seleção criaria um ciclo na hierarquia. Por favor, escolha outra categoria pai.");
      return;
    }
    
    const success = await onEditCategory(category.id, name, parentId);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="dlg-desc">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription id="dlg-desc">
            Modifique o nome ou a categoria pai.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setValidationError(null);
            }}
            placeholder="Nome da categoria"
          />
          
          <Select
            value={parentId || "root"}
            onValueChange={handleParentChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria pai (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">Nenhuma (categoria raiz)</SelectItem>
              {availableParentCategories.map((cat) => (
                <SelectItem 
                  key={cat.id} 
                  value={cat.id}
                  disabled={invalidParentIds.includes(cat.id)}
                >
                  {cat.parentId ? `↳ ${cat.name}` : cat.name}
                  {invalidParentIds.includes(cat.id) && " (não disponível)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 