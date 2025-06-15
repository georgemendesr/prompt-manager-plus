<<<<<<< HEAD
=======

>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
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
<<<<<<< HEAD
import { TextPromptDisplay } from "./TextPromptDisplay";
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
import type { TextCategory } from "@/types/textCategory";
import type { TextPrompt } from "@/types/textPrompt";

interface TextCategoryTreeProps {
  category: TextCategory;
  categories: TextCategory[];
  textPrompts: TextPrompt[];
  searchTerm: string;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  level?: number;
}

export const TextCategoryTree = ({ 
  category,
  categories,
  textPrompts,
  searchTerm,
  onEditCategory,
  onDeleteCategory,
  level = 0
}: TextCategoryTreeProps) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  
  const hasSubcategories = Boolean(category.subcategories?.length);
  
  const selectedCategory = selectedSubcategory 
    ? category.subcategories?.find(sub => sub.id === selectedSubcategory) 
    : undefined;

  const categoryPrompts = textPrompts.filter(prompt => prompt.category_id === category.id);
  
  const currentSearchTerm = searchTerm || localSearchTerm;
<<<<<<< HEAD
  const filteredPrompts = categoryPrompts.filter(prompt => {
    if (!currentSearchTerm) return true;
    
    // Verificar no título
    if (prompt.title?.toLowerCase().includes(currentSearchTerm.toLowerCase())) return true;
    
    // Verificar em cada bloco de texto
    if (prompt.blocks?.some(block => 
      block.label.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
      block.text.toLowerCase().includes(currentSearchTerm.toLowerCase())
    )) return true;
    
    return false;
  });
=======
  const filteredPrompts = categoryPrompts.filter(prompt =>
    !currentSearchTerm || 
    prompt.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
    prompt.body.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase()))
  );
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

  useEffect(() => {
    setSelectedSubcategory(undefined);
  }, [category.id]);

  useEffect(() => {
    if (selectedSubcategory) {
      setExpanded(true);
    }
  }, [selectedSubcategory]);

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
                  placeholder="Buscar prompts de texto..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            )}

            <div className="grid gap-4 mb-4">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="p-4">
<<<<<<< HEAD
                  <TextPromptDisplay prompt={prompt} />
=======
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{prompt.title}</h4>
                      {prompt.favorite && <span className="text-yellow-500">⭐</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">⭐ {prompt.score}/5</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{prompt.body}</p>
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
                </Card>
              ))}
              
              {filteredPrompts.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-lg backdrop-blur-sm">
                  {currentSearchTerm ? "Nenhum prompt encontrado" : "Nenhum prompt nesta categoria ainda"}
                </div>
              )}
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
                    <TextCategoryTree
                      category={selectedCategory}
                      categories={categories}
                      textPrompts={textPrompts}
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
