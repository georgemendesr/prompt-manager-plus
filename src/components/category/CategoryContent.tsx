
import { CategoryActions } from "../CategoryActions";
import { PromptCard } from "../PromptCard";
import { CategorySearch } from "./CategorySearch";
import { AdminGuard } from "../AdminGuard";
import { AddCategory } from "../AddCategory";
import type { Category, Prompt } from "@/types/prompt";

interface CategoryContentProps {
  category: Category;
  categories: Category[];
  filteredPrompts: Prompt[];
  hasSelectedPrompts: boolean;
  onRatePrompt: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onEditPrompt: (id: string, newText: string) => Promise<void>;
  onMovePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  onTogglePromptSelection: (id: string, selected: boolean) => void;
  onToggleSelectAll: (categoryName: string, selected: boolean) => void;
  onDeleteSelectedPrompts: (categoryName: string) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const CategoryContent = ({
  category,
  categories,
  filteredPrompts,
  hasSelectedPrompts,
  onRatePrompt,
  onAddComment,
  onEditPrompt,
  onMovePrompt,
  onTogglePromptSelection,
  onToggleSelectAll,
  onDeleteSelectedPrompts,
  searchTerm,
  setSearchTerm
}: CategoryContentProps) => {
  return (
    <div className="space-y-4">
      <CategorySearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryName={category.name}
      />

      <div className="flex gap-2 items-center">
        <AdminGuard>
          <AddCategory 
            onAdd={async (name: string, parentId?: string) => {
              // Implementation would be handled by parent component
              return true;
            }}
            categories={categories}
            mode="add"
          />
        </AdminGuard>
      </div>

      {filteredPrompts.length > 0 && (
        <CategoryActions
          prompts={filteredPrompts}
          onSelectAll={(selected) => onToggleSelectAll(category.name, selected)}
          onDelete={() => onDeleteSelectedPrompts(category.name)}
          onMove={onMovePrompt ? (targetId) => {
            const selectedPrompts = filteredPrompts.filter(p => p.selected);
            selectedPrompts.forEach(prompt => onMovePrompt(prompt.id, targetId));
          } : undefined}
          categories={categories}
          currentCategoryId={category.id}
        />
      )}

      <div className="grid gap-4 sm:gap-6">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            {searchTerm ? "Nenhum prompt encontrado com o termo pesquisado" : "Nenhum prompt nesta categoria ainda"}
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onRate={(increment) => onRatePrompt(prompt.id, increment)}
              onAddComment={(comment) => onAddComment(prompt.id, comment)}
              onEdit={(newText) => onEditPrompt(prompt.id, newText)}
              onSelect={(selected) => onTogglePromptSelection(prompt.id, selected)}
              onMove={onMovePrompt ? (targetId) => onMovePrompt(prompt.id, targetId) : undefined}
              categories={categories}
              currentCategoryId={category.id}
            />
          ))
        )}
      </div>
    </div>
  );
};
