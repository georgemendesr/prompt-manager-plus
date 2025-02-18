
import { CategorySearch } from "./CategorySearch";
import { CategoryActions } from "@/components/CategoryActions";
import { PromptCard } from "@/components/PromptCard";
import type { Category, Prompt } from "@/types/prompt";

interface CategoryContentProps {
  category: Category;
  level: number;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categories: Category[];
  onRatePrompt: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onMovePrompt: (promptId: string, targetCategoryId: string) => void;
  onTogglePromptSelection: (id: string, selected: boolean) => void;
  onToggleSelectAll: (categoryName: string, selected: boolean) => void;
  onDeleteSelectedPrompts: (categoryName: string) => void;
}

export const CategoryContent = ({
  category,
  level,
  searchTerm,
  setSearchTerm,
  categories,
  onRatePrompt,
  onAddComment,
  onMovePrompt,
  onTogglePromptSelection,
  onToggleSelectAll,
  onDeleteSelectedPrompts,
}: CategoryContentProps) => {
  const filteredPrompts = category.prompts.filter(prompt => 
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {level === 0 && (
        <CategorySearch value={searchTerm} onChange={setSearchTerm} />
      )}

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

      {filteredPrompts.map((prompt) => (
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

      {filteredPrompts.length === 0 && (!category.subcategories || category.subcategories.length === 0) && (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          {searchTerm ? "Nenhum prompt encontrado" : "Nenhum prompt nesta categoria ainda"}
        </div>
      )}
    </div>
  );
};
