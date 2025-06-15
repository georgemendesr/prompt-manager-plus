import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddCategory } from "@/components/AddCategory";
import type { ImageCategory } from "@/types/imageCategory";
import type { ImagePrompt } from "@/types/imagePrompt";
import { ImageDisplay } from "./ImageDisplay";

interface ImageCategoryTreeProps {
  category: ImageCategory;
  categories: ImageCategory[];
  imagePrompts: ImagePrompt[];
  searchTerm: string;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  level?: number;
}

export const ImageCategoryTree = ({ 
  category,
  categories,
  imagePrompts,
  searchTerm,
  onEditCategory,
  onDeleteCategory,
  level = 0
}: ImageCategoryTreeProps) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  
  const hasSubcategories = Boolean(category.subcategories?.length);
  
  const selectedCategory = selectedSubcategory 
    ? category.subcategories?.find(sub => sub.id === selectedSubcategory) 
    : undefined;

  const categoryPrompts = imagePrompts.filter(prompt => prompt.category_id === category.id);
  
  const currentSearchTerm = searchTerm || localSearchTerm;
  const filteredPrompts = categoryPrompts.filter(prompt =>
    !currentSearchTerm || 
    prompt.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
    prompt.body.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase()))
  );

  useEffect(() => {
    setSelectedSubcategory(undefined);
  }, [category.id]);

  useEffect(() => {
    if (selectedSubcategory) {
      setExpanded(true);
    }
  }, [selectedSubcategory]);

  // Renderiza os prompts filtrados da categoria atual
  const renderPrompts = () => {
    if (!filteredPrompts || filteredPrompts.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          Nenhum prompt encontrado nesta categoria
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((prompt) => (
          <ImageDisplay key={prompt.id} prompt={prompt} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className={`
        border relative
        ${level === 0 ? 'bg-white shadow-sm' : 'bg-gray-50/50 border-gray-100'}
      `}>
        <div 
          className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            {hasSubcategories && (
              <div className="flex items-center justify-center h-6 w-6">
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-700 hover:text-gray-900">
              {category.name} ({filteredPrompts.length})
            </h3>
          </div>
          <div 
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <AddCategory
                    mode="edit"
                    initialName={category.name}
                    initialParentId={category.parentId}
                    onEdit={onEditCategory}
                    categories={categories.map(cat => ({
                      id: cat.id,
                      name: cat.name,
                      parentId: cat.parentId,
                      prompts: [],
                      subcategories: []
                    }))}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDeleteCategory(category.id)}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {expanded && (
          <div className="p-4">
            {level === 0 && (
              <div className="mb-4">
                <Input
                  placeholder="Buscar prompts de imagem..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            )}

            <div className="grid gap-4 mb-4">
              {renderPrompts()}
            </div>

            {hasSubcategories && (
              <div className="border-t pt-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Subcategorias</h4>
                  <Select 
                    value={selectedSubcategory} 
                    onValueChange={setSelectedSubcategory}
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

                {selectedCategory && (
                  <div className="mt-2 border p-2 rounded-md bg-white">
                    <ImageCategoryTree
                      category={selectedCategory}
                      categories={categories}
                      imagePrompts={imagePrompts}
                      searchTerm={searchTerm}
                      onEditCategory={onEditCategory}
                      onDeleteCategory={onDeleteCategory}
                      level={level + 1}
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
