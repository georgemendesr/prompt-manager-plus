
import type { WorkspaceItem as WorkspaceItemType } from "@/types/prompt";
import { WorkspaceItem } from "./WorkspaceItem";

interface WorkspaceListProps {
  items: WorkspaceItemType[];
  expandedItems: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onCopy: (text: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export const WorkspaceList = ({
  items,
  expandedItems,
  onToggleExpand,
  onCopy,
  onRemove,
}: WorkspaceListProps) => {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <WorkspaceItem
          key={item.id}
          item={item}
          isExpanded={expandedItems[item.id]}
          onToggleExpand={() => onToggleExpand(item.id)}
          onCopy={onCopy}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
