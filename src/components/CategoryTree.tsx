
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CategoryActions } from "@/components/CategoryActions";
import { PromptCard } from "@/components/PromptCard";
import type { Category } from "@/types/prompt";

interface CategoryTreeProps {
  category: Category;
  level?: number;
  categories: Category[];
  onRatePrompt: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onMovePrompt: (promptId: string, targetCategoryId: string) => void;
  onTogglePromptSelection: (id: string, selected: boolean) => void;
  onToggleSelectAll: (categoryName: string, selected: boolean) => void;
  onDeleteSelectedPrompts: (categoryName: string) => void;
}

export const CategoryTree = ({
  category,
  level = 0,
  categories,
  onRatePrompt,
  onAddComment,
  onMovePrompt,
  onTogglePromptSelection,
  onToggleSelectAll,
  onDeleteSelectedPrompts,
}: CategoryTreeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSubcategories) {
      setIsExpanded(!isExpanded);
    }
  };

  if (level === 0) {
    return (
      <div className="space-y-4">
        <CategoryActions
          prompts={category.prompts}
          onSelectAll={(checked) => onToggleSelectAll(category.name, checked)}
          onDelete={() => onDeleteSelectedPrompts(category.name)}
          onMove={(targetCategoryId) => {
            const selectedPrompts = category.prompts.filter(p => p.selected);
            selectedPrompts.forEach(prompt => onMovePrompt(prompt.id, targetCategoryId));
          }}
          categories={categories}
          currentCategoryId={category.id}
        />

        {category.prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onRate={onRatePrompt}
            onAddComment={onAddComment}
            onSelect={onTogglePromptSelection}
            selected={prompt.selected || false}
            categories={categories}
          />
        ))}

        {category.subcategories?.map((subCategory) => (
          <CategoryTree
            key={subCategory.id}
            category={subCategory}
            level={level + 1}
            categories={categories}
            onRatePrompt={onRatePrompt}
            onAddComment={onAddComment}
            onMovePrompt={onMovePrompt}
            onTogglePromptSelection={onTogglePromptSelection}
            onToggleSelectAll={onToggleSelectAll}
            onDeleteSelectedPrompts={onDeleteSelectedPrompts}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${level > 0 ? 'ml-6' : ''}`}>
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={handleToggle}
      >
        {hasSubcategories && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        <h3 className="text-lg font-semibold text-gray-700 group-hover:text-gray-900">
          {category.name}
        </h3>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <CategoryActions
            prompts={category.prompts}
            onSelectAll={(checked) => onToggleSelectAll(category.name, checked)}
            onDelete={() => onDeleteSelectedPrompts(category.name)}
            onMove={(targetCategoryId) => {
              const selectedPrompts = category.prompts.filter(p => p.selected);
              selectedPrompts.forEach(prompt => onMovePrompt(prompt.id, targetCategoryId));
            }}
            categories={categories}
            currentCategoryId={category.id}
          />

          {category.prompts.length === 0 && category.subcategories?.length === 0 && (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              Nenhum prompt nesta categoria ainda
            </div>
          )}

          {category.prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onRate={onRatePrompt}
              onAddComment={onAddComment}
              onSelect={onTogglePromptSelection}
              selected={prompt.selected || false}
              categories={categories}
            />
          ))}

          {category.subcategories?.map((subCategory) => (
            <CategoryTree
              key={subCategory.id}
              category={subCategory}
              level={level + 1}
              categories={categories}
              onRatePrompt={onRatePrompt}
              onAddComment={onAddComment}
              onMovePrompt={onMovePrompt}
              onTogglePromptSelection={onTogglePromptSelection}
              onToggleSelectAll={onToggleSelectAll}
              onDeleteSelectedPrompts={onDeleteSelectedPrompts}
            />
          ))}
        </div>
      )}
    </div>
  );
};
