
import { useState, useEffect } from "react";
import { CategoryHeader } from "./category/CategoryHeader";
import { CategoryContent } from "./category/CategoryContent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  // Apenas expande o primeiro nível (nível 0), todos os outros níveis começam recolhidos
  const [expanded, setExpanded] = useState(level === 0);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
  
  const hasSubcategories = Boolean(category.subcategories?.length);
  
  // Encontrar a subcategoria selecionada
  const selectedCategory = selectedSubcategory 
    ? category.subcategories?.find(sub => sub.id === selectedSubcategory) 
    : undefined;

  // Reset subcategory selection when parent category changes
  useEffect(() => {
    setSelectedSubcategory(undefined);
  }, [category.id]);
  
  return (
    <div className="space-y-2">
      <div className={`
        border relative
        ${level === 0 ? 'bg-white shadow-sm' : 'bg-gray-50/50 border-gray-100'}
      `}>
        <CategoryHeader
          name={category.name}
          hasSubcategories={hasSubcategories}
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

            {hasSubcategories && (
              <div className="mt-4 border-t pt-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Subcategorias</h4>
                  <Select 
                    value={selectedSubcategory} 
                    onValueChange={(value) => {
                      setSelectedSubcategory(value);
                      setSubcategoryError(null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {category.subcategories?.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {subcategoryError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Erro ao carregar subcategoria: {subcategoryError}
                    </AlertDescription>
                  </Alert>
                )}

                {selectedCategory && (
                  <div className="mt-2 border p-2 rounded-md bg-white">
                    <CategoryTree
                      category={selectedCategory}
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
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
