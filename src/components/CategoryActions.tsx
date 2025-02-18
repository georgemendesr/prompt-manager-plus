
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";

interface CategoryActionsProps {
  prompts: { selected?: boolean }[];
  onSelectAll: (checked: boolean) => void;
  onDelete: () => void;
}

export const CategoryActions = ({ prompts, onSelectAll, onDelete }: CategoryActionsProps) => {
  if (prompts.length === 0) return null;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={prompts.every((p) => p.selected)}
          onCheckedChange={(checked) => onSelectAll(checked as boolean)}
        />
        <span className="text-sm text-gray-600">Selecionar todos</span>
      </div>
      {prompts.some((p) => p.selected) && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="gap-2"
        >
          <Trash className="h-4 w-4" />
          Excluir selecionados
        </Button>
      )}
    </div>
  );
};
