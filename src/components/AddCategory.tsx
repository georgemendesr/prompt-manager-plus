
import { useState } from "react";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/prompt";
import { AdminGuard } from "./AdminGuard";

interface AddCategoryProps {
  onAdd?: (name: string, parentId?: string) => Promise<boolean>;
  onEdit?: (newName: string, newParentId?: string) => Promise<boolean>;
  categories: Category[];
  mode?: "add" | "edit";
  initialName?: string;
  initialParentId?: string;
}

export const AddCategory = ({ 
  onAdd,
  onEdit,
  categories,
  mode = "add",
  initialName = "",
  initialParentId
}: AddCategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [parentId, setParentId] = useState<string | undefined>(initialParentId);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      let success = false;
      
      if (mode === "edit" && onEdit) {
        success = await onEdit(name.trim(), parentId);
      } else if (mode === "add" && onAdd) {
        success = await onAdd(name.trim(), parentId);
      }

      if (success) {
        setName("");
        setParentId(undefined);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Erro ao processar categoria:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName(mode === "edit" ? initialName : "");
    setParentId(mode === "edit" ? initialParentId : undefined);
  };

  const buildCategoryOptions = (cats: Category[], level = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    cats.forEach(category => {
      const prefix = "  ".repeat(level);
      options.push(
        <SelectItem key={category.id} value={category.id}>
          {prefix}{category.name}
        </SelectItem>
      );
      
      if (category.subcategories) {
        options.push(...buildCategoryOptions(category.subcategories, level + 1));
      }
    });
    
    return options;
  };

  const rootCategories = categories.filter(cat => !cat.parentId);

  return (
    <AdminGuard>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          {mode === "edit" ? (
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome da categoria"
                required
              />
            </div>
            <div>
              <Label htmlFor="parent">Categoria Pai (opcional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria pai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (categoria raiz)</SelectItem>
                  {buildCategoryOptions(rootCategories)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : mode === "edit" ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
};
