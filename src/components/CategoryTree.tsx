
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { CategoryActions } from "@/components/CategoryActions";
import { PromptCard } from "@/components/PromptCard";
import { Input } from "@/components/ui/input";
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
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasSubcategories = category.subcategories?.length > 0;

  const handleToggle = () => {
    console.log('Toggling category:', category.name, 'Current expanded:', expanded);
    setExpanded(prev => !prev);
  };

  const filteredPrompts = category.prompts.filter(prompt => 
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Array of soft background colors for different levels
  const levelColors = [
    'bg-soft-purple',
    'bg-soft-blue',
    'bg-soft-pink',
    'bg-soft-peach',
    'bg-soft-green',
    'bg-soft-yellow'
  ];

  // Get background color based on level
  const getBgColor = (level: number) => levelColors[level % levelColors.length];

  // Conteúdo comum para todas as categorias
  const categoryContent = (
    <div className="space-y-4">
      {level === 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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

  // Para categorias de nível 0 (principais)
  if (level === 0) {
    return (
      <div className="space-y-4">
        {categoryContent}
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

  // Para subcategorias (nível > 0)
  return (
    <div className={`ml-6 space-y-4 p-4 rounded-lg ${getBgColor(level)}`}>
      <div className="flex items-center gap-2">
        {hasSubcategories && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-white/30"
            onClick={handleToggle}
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
          onClick={handleToggle}
        >
          {category.name}
        </h3>
      </div>

      {expanded && (
        <>
          {categoryContent}
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
        </>
      )}
    </div>
  );
};
