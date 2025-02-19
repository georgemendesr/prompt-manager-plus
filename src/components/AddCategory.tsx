
import { useState } from "react";
import { Plus } from "lucide-react";
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
} from "@/components/ui/dialog";
import type { Category } from "@/types/prompt";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Nova Categoria" : "Editar Categoria"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da categoria"
          />
          <Select
            value={parentId}
            onValueChange={setParentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria pai (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">Nenhuma (categoria raiz)</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.parentId ? `↳ ${category.name}` : category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
