
import { useState } from "react";
import { CategoryContent } from "@/components/category/CategoryContent";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import type { TextCategory } from "@/types/textCategory";
import type { TextPrompt } from "@/types/textPrompt";

interface TextCategoryTreeProps {
  category: TextCategory;
  categories: TextCategory[];
  textPrompts: TextPrompt[];
  searchTerm: string;
  onEditCategory: (id: string, newName: string, parentId?: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const TextCategoryTree = ({
  category,
  categories,
  textPrompts,
  searchTerm,
  onEditCategory,
  onDeleteCategory
}: TextCategoryTreeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filtrar prompts desta categoria
  const categoryPrompts = textPrompts.filter(prompt => 
    prompt.categoryId === category.id
  );

  // Filtrar prompts com base no termo de busca
  const filteredPrompts = searchTerm 
    ? categoryPrompts.filter(prompt =>
        prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : categoryPrompts;

  // Obter subcategorias
  const subcategories = categories.filter(cat => cat.parentId === category.id);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEditCategory = async (newName: string, newParentId?: string) => {
    await onEditCategory(category.id, newName, newParentId);
  };

  const handleDeleteCategory = async () => {
    await onDeleteCategory(category.id);
  };

  return (
    <div className="mb-4">
      <CategoryHeader
        category={{
          id: category.id,
          name: category.name,
          prompts: filteredPrompts.map(prompt => ({
            id: prompt.id,
            text: prompt.text,
            rating: 0,
            tags: prompt.tags,
            comments: [],
            createdAt: new Date(prompt.createdAt),
            ratingAverage: 0,
            ratingCount: 0,
            copyCount: 0
          })),
          subcategories: []
        }}
        allCategories={categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          prompts: [],
          subcategories: []
        }))}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {isExpanded && (
        <div className="ml-4 border-l-2 border-gray-200 pl-4">
          <CategoryContent
            prompts={filteredPrompts.map(prompt => ({
              id: prompt.id,
              text: prompt.text,
              rating: 0,
              tags: prompt.tags,
              comments: [],
              createdAt: new Date(prompt.createdAt),
              ratingAverage: 0,
              ratingCount: 0,
              copyCount: 0
            }))}
            searchTerm={searchTerm}
            onRatePrompt={async () => {}}
            onAddComment={async () => {}}
            onEditPrompt={async () => {}}
            onDeletePrompt={async () => {}}
            onMovePrompt={async () => {}}
            onTogglePromptSelection={() => {}}
            allCategories={categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              prompts: [],
              subcategories: []
            }))}
          />

          {subcategories.map((subcategory) => (
            <TextCategoryTree
              key={subcategory.id}
              category={subcategory}
              categories={categories}
              textPrompts={textPrompts}
              searchTerm={searchTerm}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};
