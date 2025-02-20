
import { CategorySearch } from "./CategorySearch";
import { CategoryActions } from "@/components/CategoryActions";
import { PromptCard } from "@/components/PromptCard";
import type { Category, Prompt } from "@/types/prompt";
import { usePromptManager } from "@/hooks/usePromptManager";

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
  // Primeiro aplicamos a busca
  const filteredPrompts = category.prompts.filter(prompt => 
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.comments.some(comment => 
      comment.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Depois separamos em favoritos e não favoritos
  const favoritedPrompts = filteredPrompts.filter(p => p.rating > 0);
  const unfavoritedPrompts = filteredPrompts.filter(p => p.rating === 0);

  // Combinamos os arrays mantendo a ordem (favoritos primeiro)
  const orderedPrompts = [...favoritedPrompts, ...unfavoritedPrompts];

  return (
    <div className="space-y-6">
      {level === 0 && (
        <CategorySearch 
          value={searchTerm} 
          onChange={(value) => setSearchTerm(value)} 
        />
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

      <div className="grid gap-6">
        {orderedPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onRate={onRatePrompt}
            onAddComment={onAddComment}
            onSelect={onTogglePromptSelection}
            selected={prompt.selected || false}
            categories={categories}
            searchTerm={searchTerm}
          />
        ))}
      </div>

      {orderedPrompts.length === 0 && (!category.subcategories || category.subcategories.length === 0) && (
        <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-lg backdrop-blur-sm">
          {searchTerm ? "Nenhum prompt encontrado" : "Nenhum prompt nesta categoria ainda"}
        </div>
      )}
    </div>
  );
};
