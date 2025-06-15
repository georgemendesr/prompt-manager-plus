<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
import type { Category, Prompt } from "@/types/prompt";
=======
import type { Category } from "@/types/prompt";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

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
<<<<<<< HEAD
  onRefreshRequired?: () => void;
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
  onRefreshRequired = () => {},
}: CategoryTreeProps) => {
=======
}: CategoryTreeProps) => {
  // Começamos com todas as categorias expandidas para melhor usabilidade
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
  const [expanded, setExpanded] = useState(true);
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
  
  // Automatically expand when a subcategory is selected
  useEffect(() => {
    if (selectedSubcategory) {
      setExpanded(true);
    }
  }, [selectedSubcategory]);
<<<<<<< HEAD

  // Adaptadores para os novos parâmetros do CategoryContent
  const handleToggleSelectAll = (selected: boolean) => {
    onToggleSelectAll(category.name, selected);
  };

  const handleDeleteSelectedPrompts = () => {
    onDeleteSelectedPrompts(category.name);
  };
  
  // Função para adicionar subcategoria
  const handleAddSubcategory = async (name: string, parentId: string) => {
    console.log("Adicionar subcategoria", name, "ao pai", parentId);
    return true;
  };
  
  return (
    <div className="space-y-2">
      <div className={`border relative ${level === 0 ? 'bg-white shadow-sm' : 'bg-gray-50/50 border-gray-100'}`}>
        <CategoryHeader
          category={category}
          isExpanded={expanded}
          toggleExpanded={() => setExpanded(!expanded)}
          onAddSubcategory={handleAddSubcategory}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          availableParentCategories={categories}
=======
  
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
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
              onToggleSelectAll={handleToggleSelectAll}
              onDeleteSelectedPrompts={handleDeleteSelectedPrompts}
              onUpdatePrompt={onEditPrompt}
              onRefreshRequired={onRefreshRequired}
            />

            {hasSubcategories && (
              <div className="mt-2">
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
            )}
            
            {selectedCategory && (
              <div className="mt-2">
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
                  onRefreshRequired={onRefreshRequired}
                />
              </div>
            )}
            
            {subcategoryError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro: {subcategoryError}
                </AlertDescription>
              </Alert>
            )}
=======
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
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
          </div>
        )}
      </div>
    </div>
  );
};
