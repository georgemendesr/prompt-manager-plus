import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, ChevronDown, ChevronRight, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { EditCategory } from "@/components/EditCategory";

interface MusicCategoryTreeProps {
  category: any;
  categories: any[];
  musicPrompts: any[];
  searchTerm: string;
  onEditCategory: (id: string, name: string, parentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  level?: number;
}

export const MusicCategoryTree = ({
  category,
  categories,
  musicPrompts,
  searchTerm,
  onEditCategory,
  onDeleteCategory,
  level = 0,
}: MusicCategoryTreeProps) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Encontrar a subcategoria selecionada
  const selectedCategory = selectedSubcategory 
    ? category.subcategories?.find((sub: any) => sub.id === selectedSubcategory)
    : undefined;
  
  const hasSubcategories = Boolean(category.subcategories?.length);
  
  // Filtrar prompts desta categoria
  const categoryPrompts = musicPrompts.filter(prompt => 
    prompt.category_id === category.id &&
    (!searchTerm || prompt.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset subcategory selection when parent category changes
  useEffect(() => {
    setSelectedSubcategory(undefined);
  }, [category.id]);
  
  // Funções de manipulação de categoria
  const handleEditCategory = async (id: string, name: string, parentId?: string) => {
    const success = await onEditCategory(id, name, parentId);
    if (success) {
      setIsEditing(false);
    }
  };
  
  const handleDeleteCategory = async () => {
    const success = await onDeleteCategory(category.id);
    if (success) {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-2">
        <button 
          className="mr-1 flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100"
          onClick={() => setExpanded(!expanded)}
        >
          {hasSubcategories && (expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>
        
        <h3 className="font-medium flex-1">
          {category.name}
        </h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDeleting(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Modais de edição e exclusão */}
      {isEditing && (
        <EditCategory
          id={category.id}
          initialName={category.name}
          initialParentId={category.parentId}
          categories={categories.filter(c => c.id !== category.id)}
          onSave={handleEditCategory}
          onClose={() => setIsEditing(false)}
        />
      )}
      
      {isDeleting && (
        <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a categoria "{category.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCategory}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {expanded && (
        <div className="ml-5 pl-2 border-l">
          {/* Conteúdo da categoria */}
          <div className="py-2">
            {categoryPrompts.length > 0 ? (
              <div className="space-y-2">
                {categoryPrompts.map(prompt => (
                  <Card key={prompt.id} className="overflow-hidden">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{prompt.title || 'Prompt de Música'}</CardTitle>
                      <CardDescription className="text-xs">{new Date(prompt.created_at).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm whitespace-pre-wrap">{prompt.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              searchTerm ? 
                <p className="text-sm text-gray-500">Nenhum prompt corresponde à pesquisa</p> :
                <p className="text-sm text-gray-500">Nenhum prompt nesta categoria</p>
            )}

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
                      {category.subcategories?.map((subcategory: any) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory && (
                  <div className="mt-2 border p-2 rounded-md bg-white">
                    <MusicCategoryTree
                      category={selectedCategory}
                      categories={categories}
                      musicPrompts={musicPrompts}
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
        </div>
      )}
    </div>
  );
}; 