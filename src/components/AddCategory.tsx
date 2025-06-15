<<<<<<< HEAD
import { useState, useMemo } from "react";
import { Plus, AlertCircle } from "lucide-react";
=======

import { useState } from "react";
import { Plus } from "lucide-react";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
  DialogTrigger,
<<<<<<< HEAD
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Category } from "@/types/prompt";
import { getAllDescendantIds, findCategoryById } from "@/utils/categoryTreeUtils";
=======
} from "@/components/ui/dialog";
import type { Category } from "@/types/prompt";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

type AddCategoryProps = {
  categories?: Category[];
  mode?: "add" | "edit";
  initialName?: string;
  initialParentId?: string;
} & (
  | { mode?: "add"; onAdd: (name: string, parentId?: string) => Promise<boolean>; onEdit?: never; }
  | { mode: "edit"; onEdit: (name: string, parentId?: string) => Promise<boolean>; onAdd?: never; }
);

export const AddCategory = ({ 
  categories = [], 
  mode = "add",
  initialName = "",
  initialParentId,
  onAdd,
  onEdit
}: AddCategoryProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState<string | undefined>(initialParentId);
<<<<<<< HEAD
  const [validationError, setValidationError] = useState<string | null>(null);

  // Se estamos no modo de edição, precisamos saber qual categoria está sendo editada
  const currentCategory = mode === "edit" && initialName 
    ? findCategoryById(categories, initialParentId || "")
    : undefined;

  // Lista de IDs que não podem ser selecionados como pai (para evitar ciclos)
  const invalidParentIds = useMemo(() => {
    if (mode !== "edit" || !currentCategory) return [];
    
    // A própria categoria e todos seus descendentes não podem ser selecionados como pai
    const descendantIds = getAllDescendantIds(categories, currentCategory.id);
    return [currentCategory.id, ...descendantIds];
  }, [categories, currentCategory, mode]);

  const handleParentChange = (newParentId: string) => {
    // Resetar erro de validação
    setValidationError(null);
    
    // Verificar se a seleção criaria um ciclo
    if (mode === "edit" && invalidParentIds.includes(newParentId)) {
      setValidationError("Esta seleção criaria um ciclo na hierarquia. Por favor, escolha outra categoria pai.");
      return;
    }
    
    setParentId(newParentId);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setValidationError("O nome da categoria não pode estar vazio");
      return;
    }
    
    // Verificar novamente se a seleção de pai é válida
    if (mode === "edit" && parentId && invalidParentIds.includes(parentId)) {
      setValidationError("Esta seleção criaria um ciclo na hierarquia. Por favor, escolha outra categoria pai.");
      return;
    }
    
    console.log("🔧 AddCategory handleSave:", { mode, name, parentId });
    
    const success = mode === "add" 
      ? await onAdd?.(name, parentId === "root" ? undefined : parentId)
      : await onEdit?.(name, parentId === "root" ? undefined : parentId);

    console.log("✅ AddCategory save result:", success);

    if (success) {
      setName("");
      setParentId(undefined);
      setValidationError(null);
      setOpen(false);
=======

  const handleSave = async () => {
    if (name.trim()) {
      const success = mode === "add" 
        ? await onAdd?.(name, parentId === "root" ? undefined : parentId)
        : await onEdit?.(name, parentId === "root" ? undefined : parentId);

      if (success) {
        setName("");
        setParentId(undefined);
        setOpen(false);
      }
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    }
  };

  // Função recursiva para obter todas as categorias e subcategorias
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
        {mode === "add" ? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Categoria
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        )}
      </DialogTrigger>
<<<<<<< HEAD
      <DialogContent className="sm:max-w-[425px]" aria-describedby="dlg-desc">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Nova Categoria" : "Editar Categoria"}</DialogTitle>
          <DialogDescription id="dlg-desc">
            {mode === "add" 
              ? "Crie uma nova categoria para organizar seus prompts." 
              : "Edite as informações desta categoria."}
          </DialogDescription>
=======
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Nova Categoria" : "Editar Categoria"}</DialogTitle>
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            value={name}
<<<<<<< HEAD
            onChange={(e) => {
              setName(e.target.value);
              setValidationError(null);
            }}
            placeholder="Nome da categoria"
          />
          
          <Select
            value={parentId}
            onValueChange={handleParentChange}
=======
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da categoria"
          />
          <Select
            value={parentId}
            onValueChange={setParentId}
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria pai (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">Nenhuma (categoria raiz)</SelectItem>
              {allCategories.map((category) => (
<<<<<<< HEAD
                <SelectItem 
                  key={category.id} 
                  value={category.id}
                  disabled={mode === "edit" && invalidParentIds.includes(category.id)}
                >
                  {category.parentId ? `↳ ${category.name}` : category.name}
                  {mode === "edit" && invalidParentIds.includes(category.id) && " (não disponível)"}
=======
                <SelectItem key={category.id} value={category.id}>
                  {category.parentId ? `↳ ${category.name}` : category.name}
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
<<<<<<< HEAD
          
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {mode === "add" ? "Adicionar" : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
