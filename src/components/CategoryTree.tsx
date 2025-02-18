
import { useState } from "react";
import { CategoryHeader } from "./category/CategoryHeader";
import { CategoryContent } from "./category/CategoryContent";
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
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
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
  onEditCategory,
  onDeleteCategory,
}: CategoryTreeProps) => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasSubcategories = category.subcategories?.length > 0;

  const handleToggle = () => {
    console.log('Toggling category:', category.name, 'Current expanded:', expanded);
    setExpanded(prev => !prev);
  };

  const handleEdit = async (newName: string, newParentId?: string) => {
    return await onEditCategory(category.id, newName, newParentId);
  };

  const handleDelete = async () => {
    if (category.prompts.length > 0) {
      alert('Não é possível deletar uma categoria que contém prompts');
      return;
    }
    await onDeleteCategory(category.id);
  };

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

  // Para categorias de nível 0 (principais)
  if (level === 0) {
    return (
      <div className="space-y-4">
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
            onEditCategory={onEditCategory}
            onDeleteCategory={onDeleteCategory}
          />
        ))}
      </div>
    );
  }

  // Para subcategorias (nível > 0)
  return (
    <div className={`ml-6 space-y-4 p-4 rounded-lg ${getBgColor(level)}`}>
      <CategoryHeader
        name={category.name}
        hasSubcategories={hasSubcategories}
        expanded={expanded}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
        category={category}
      />

      {expanded && (
        <>
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
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
            />
          ))}
        </>
      )}
    </div>
  );
};
