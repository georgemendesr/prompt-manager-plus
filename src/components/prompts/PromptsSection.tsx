
import { AddCategory } from "@/components/AddCategory";
import { BulkImport } from "@/components/BulkImport";
import { CategoryTree } from "@/components/CategoryTree";
import { AdminGuard } from "@/components/AdminGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Category } from "@/types/prompt";

interface PromptsSectionProps {
  categories: Category[];
  addCategory: (name: string) => Promise<boolean>;
  bulkImportPrompts: (prompts: { text: string; tags: string[] }[], categoryName: string) => Promise<void>;
  ratePrompt: (id: string, increment: boolean) => void;
  addComment: (id: string, comment: string) => void;
  editPrompt: (id: string, newText: string) => Promise<void>;
  deletePrompt?: (id: string) => Promise<void>;
  movePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  togglePromptSelection: (id: string, selected: boolean) => void;
  toggleSelectAll: (categoryName: string, selected: boolean) => void;
  deleteSelectedPrompts: (categoryName: string) => Promise<void>;
  editCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  exportPrompts: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentPage: number;
}

export const PromptsSection = ({ 
  categories,
  addCategory,
  bulkImportPrompts,
  ratePrompt,
  addComment,
  editPrompt,
  deletePrompt,
  movePrompt,
  togglePromptSelection,
  toggleSelectAll,
  deleteSelectedPrompts,
  editCategory,
  deleteCategory,
  searchTerm,
  setSearchTerm,
  exportPrompts,
  onNextPage,
  onPreviousPage,
  currentPage
}: PromptsSectionProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <AddCategory onAdd={addCategory} categories={categories} />
          {categories.length > 0 && (
            <>
              <BulkImport
                categories={categories}
                onImport={bulkImportPrompts}
              />
              <Button 
                onClick={exportPrompts} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Prompts
              </Button>
            </>
          )}
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Crie uma categoria para começar a adicionar prompts
        </div>
      ) : (
        <>
        <Tabs defaultValue={categories[0]?.name} className="w-full">
          <div className="max-w-full overflow-hidden">
            <TabsList className="bg-gray-100/80 p-1 rounded-lg max-w-full overflow-x-auto flex gap-1 no-scrollbar">
              {categories
                .filter(category => !category.parentId)
                .map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.name}
                    className="flex-shrink-0 px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
            </TabsList>
          </div>

          {categories
            .filter(category => !category.parentId)
            .map((category) => (
              <TabsContent
                key={category.id}
                value={category.name}
                className="mt-4 sm:mt-6"
              >
                <CategoryTree
                  category={category}
                  categories={categories}
                  onRatePrompt={ratePrompt}
                  onAddComment={addComment}
                  onEditPrompt={editPrompt}
                  onMovePrompt={movePrompt}
                  onTogglePromptSelection={togglePromptSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onDeleteSelectedPrompts={deleteSelectedPrompts}
                  onEditCategory={editCategory}
                  onDeleteCategory={deleteCategory}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </TabsContent>
            ))}
        </Tabs>
        
        {/* Controles de paginação no rodapé */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPreviousPage();
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onNextPage();
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        </>
      )}
    </div>
  );
};
