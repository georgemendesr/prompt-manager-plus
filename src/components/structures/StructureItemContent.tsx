
import { Edit, Trash, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MusicStructure } from "@/types/prompt";
import { toast } from "sonner";

interface StructureItemContentProps {
  structure: MusicStructure;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  setEditingId: (id: string | null) => void;
  onDelete: (id: string) => void;
  hasSubcategories?: boolean;
}

export const StructureItemContent = ({
  structure,
  isExpanded,
  setIsExpanded,
  setEditingId,
  onDelete,
  hasSubcategories
}: StructureItemContentProps) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div>
        <div className="flex items-center gap-2">
          {hasSubcategories ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          <h3 className="text-base font-semibold text-gray-900">{structure.name}</h3>
        </div>
        <div className="flex gap-2 mt-2 ml-6">
          <Button variant="ghost" size="icon" onClick={() => setEditingId(structure.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              onDelete(structure.id);
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
  );
};
