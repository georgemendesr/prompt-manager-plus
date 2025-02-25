
import { useState } from "react";
import { CategoryHeader } from "./category/CategoryHeader";
import { CategoryContent } from "./category/CategoryContent";
import type { Category } from "@/types/prompt";

interface CategoryTreeProps {
  category: Category;
  categories: Category[];
  onRatePrompt: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onEditPrompt?: (id: string, newText: string) => void;
  onMovePrompt: (promptId: string, targetCategoryId: string) => void;
  onTogglePromptSelection: (id: string, selected: boolean) => void;
  onToggleSelectAll: (categoryName: string, selected: boolean) => void;
  onDeleteSelectedPrompts: (categoryName: string) => void;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  level?: number;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
}

export const CategoryTree = ({ 
  category,
  categories,
  onRatePrompt,
  onAddComment,
  onEditPrompt,
  onMovePrompt,
  onTogglePromptSelection,
  onToggleSelectAll,
  onDeleteSelectedPrompts,
  onEditCategory,
  onDeleteCategory,
  level = 0,
  searchTerm = "",
  setSearchTerm = () => {},
}: CategoryTreeProps) => {
  const [expanded, setExpanded] = useState(level === 0); // Apenas expande o primeiro nível
  
  return (
    <div className="space-y-2">
      <div className={`
        border relative
        ${level === 0 ? 'bg-white shadow-sm' : 'bg-gray-50/50 border-gray-100'}
      `}>
        <CategoryHeader
          name={category.name}
          hasSubcategories={Boolean(category.subcategories?.length)}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
          onEdit={onEditCategory}
          onDelete={onDeleteCategory}
          categories={categories}
          category={category}
        />

        {expanded && (
          <div className="p-4">
            <CategoryContent
              category={category}
              level={level}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categories={categories}
              onRatePrompt={onRatePrompt}
              onAddComment={onAddComment}
              onMovePrompt={onMovePrompt}
              onTogglePromptSelection={onTogglePromptSelection}
              onToggleSelectAll={onToggleSelectAll}
              onDeleteSelectedPrompts={onDeleteSelectedPrompts}
            />

            {category.subcategories?.map((subcategory) => (
              <div key={subcategory.id} className="mt-2">
                <CategoryTree
                  category={subcategory}
                  categories={categories}
                  onRatePrompt={onRatePrompt}
                  onAddComment={onAddComment}
                  onEditPrompt={onEditPrompt}
                  onMovePrompt={onMovePrompt}
                  onTogglePromptSelection={onTogglePromptSelection}
                  onToggleSelectAll={onToggleSelectAll}
                  onDeleteSelectedPrompts={onDeleteSelectedPrompts}
                  onEditCategory={onEditCategory}
                  onDeleteCategory={onDeleteCategory}
                  level={level + 1}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
