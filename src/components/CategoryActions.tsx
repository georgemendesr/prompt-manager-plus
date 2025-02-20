
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/prompt";

interface CategoryActionsProps {
  prompts: { selected?: boolean }[];
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

  return (
    <div className="flex items-center justify-end gap-2 bg-white p-4 rounded-lg shadow-sm">
      {hasSelectedPrompts && (
        <div className="flex items-center gap-2">
          {onMove && categories.length > 0 && (
            <Select onValueChange={onMove}>
              <SelectTrigger className="w-[200px]">
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
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
            Excluir selecionados
          </Button>
        </div>
      )}
    </div>
  );
};
