
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
  // Função para criar uma prévia do texto
  const getPreviewText = (text: string) => {
    const words = text.split(' ');
    const preview = words.slice(0, 15).join(' ');
    return words.length > 15 ? `${preview}...` : preview;
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

      {/* Prévia do texto quando recolhido */}
      {!isExpanded && (
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
          {getPreviewText(item.text)}
        </p>
      )}
      
      {/* Texto completo quando expandido */}
      <div className={`overflow-hidden transition-all duration-200 ${
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-[0px] opacity-0'
      }`}>
        <p className="whitespace-pre-wrap text-sm text-gray-700">{item.text}</p>
      </div>
    </Card>
  );
};
