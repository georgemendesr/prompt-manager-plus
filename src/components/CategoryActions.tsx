<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Trash, Move } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/prompt";
import { toast } from "sonner";

interface CategoryActionsProps {
  prompts: { selected?: boolean; text?: string }[];
  onSelectAll: (checked: boolean) => void;
  onDelete: () => void;
  onMove?: (targetCategoryId: string) => void;
  categories?: Category[];
  currentCategoryId?: string;
}

export const CategoryActions = ({ 
  prompts, 
  onSelectAll, 
  onDelete,
  onMove,
  categories = [],
  currentCategoryId
}: CategoryActionsProps) => {
  if (prompts.length === 0) return null;

  const hasSelectedPrompts = prompts.some((p) => p.selected);

  const getAllCategories = (categories: Category[]): Category[] => {
    return categories.reduce((acc: Category[], category) => {
      acc.push(category);
      if (category.subcategories) {
        acc.push(...getAllCategories(category.subcategories));
      }
      return acc;
    }, []);
  };

  const handleCopySelected = async () => {
    const selectedTexts = prompts
      .filter(p => p.selected && p.text)
      .map(p => p.text)
      .join('\n\n');
    
    if (selectedTexts) {
      await navigator.clipboard.writeText(selectedTexts);
      toast.success("Textos copiados para a área de transferência!");
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-lg shadow-sm">
=======
    <div className="flex items-center justify-between gap-2 bg-white p-4 rounded-lg shadow-sm">
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      <div className="flex items-center gap-2">
        <Checkbox
          checked={prompts.every((p) => p.selected)}
          onCheckedChange={onSelectAll}
          className="h-4 w-4"
        />
<<<<<<< HEAD
        <span className="text-xs sm:text-sm text-gray-500">
          <span className="hidden sm:inline">Selecionar todos</span>
          <span className="sm:hidden">Sel. todos</span>
        </span>
      </div>

      {hasSelectedPrompts && (
        <div className="flex flex-wrap items-center gap-2 mt-2 w-full sm:mt-0 sm:w-auto">
          {onMove && categories.length > 0 && (
            <Select onValueChange={onMove}>
              <SelectTrigger className="w-full sm:w-[200px] h-8 text-xs gap-1">
                <Move className="h-3 w-3" />
=======
        <span className="text-sm text-gray-500">Selecionar todos</span>
      </div>

      {hasSelectedPrompts && (
        <div className="flex items-center gap-2">
          {onMove && categories.length > 0 && (
            <Select onValueChange={onMove}>
              <SelectTrigger className="w-[200px]">
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
                <SelectValue placeholder="Mover para..." />
              </SelectTrigger>
              <SelectContent>
                {getAllCategories(categories).map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    disabled={category.id === currentCategoryId}
                  >
                    {category.parentId ? `↳ ${category.name}` : category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopySelected}
<<<<<<< HEAD
            className="h-8 text-xs px-2 gap-1 flex-1 sm:flex-none"
          >
            <Copy className="h-3 w-3" />
            <span className="hidden sm:inline">Copiar</span>
=======
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
<<<<<<< HEAD
            className="h-8 text-xs px-2 gap-1 flex-1 sm:flex-none"
          >
            <Trash className="h-3 w-3" />
            <span className="hidden sm:inline">Excluir</span>
=======
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
            Excluir
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          </Button>
        </div>
      )}
    </div>
  );
};
