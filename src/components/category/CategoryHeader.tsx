
import { useState } from "react";
import { Edit, Trash, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddCategory } from "@/components/AddCategory";
import type { Category } from "@/types/prompt";

interface CategoryHeaderProps {
  name: string;
  hasSubcategories: boolean;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (newName: string, newParentId?: string) => Promise<void>;
  onDelete: () => Promise<void>;
  categories?: Category[];
  category: Category;
}

export const CategoryHeader = ({
  name,
  hasSubcategories,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  categories = [],
  category
}: CategoryHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {hasSubcategories && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-white/30"
            onClick={onToggle}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        <h3 
          className="text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
          onClick={onToggle}
        >
          {name}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        <AddCategory
          mode="edit"
          initialName={name}
          initialParentId={category.parentId}
          onEdit={onEdit}
          categories={categories}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
