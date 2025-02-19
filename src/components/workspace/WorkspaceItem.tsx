
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Copy, Trash, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkspaceItem as WorkspaceItemType } from "@/types/prompt";

interface WorkspaceItemProps {
  item: WorkspaceItemType;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: (text: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export const WorkspaceItem = ({
  item,
  isExpanded,
  onToggleExpand,
  onCopy,
  onRemove,
}: WorkspaceItemProps) => {
  // Função para truncar o texto e adicionar reticências
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <Card className="p-4 relative group">
      <div className="flex justify-between items-start mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6"
          onClick={onToggleExpand}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isExpanded ? "Recolher" : "Expandir"}
          </span>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCopy(item.text)}
          >
            <Copy className="h-4 w-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(item.id)}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      <div>
        {/* Prévia do texto (sempre visível) */}
        {!isExpanded && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {truncateText(item.text, 150)}
          </p>
        )}
        {/* Texto completo (visível quando expandido) */}
        <div className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-[1000px]' : 'max-h-[0px]'
        }`}>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{item.text}</p>
        </div>
      </div>
    </Card>
  );
};
