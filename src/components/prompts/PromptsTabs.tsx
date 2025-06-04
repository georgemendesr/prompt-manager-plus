import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptsSection } from "@/components/prompts/PromptsSection";
import { StructureList } from "@/components/structures/StructureList";
import { Workspace } from "@/components/Workspace";
import { Links } from "@/components/links/Links";
import { Lyrics } from "@/components/lyrics/Lyrics";
import { Category } from "@/types/prompt";
import type { MusicStructure } from "@/types/prompt";

interface PromptsTabsProps {
  categories: Category[];
  structuresLoading: boolean;
  structuresLoadError: string | null;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  onAddCategory: (name: string, parentId?: string) => Promise<boolean>;
  onEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  onRatePrompt: (promptId: string, increment: boolean) => Promise<void>;
  onAddComment: (promptId: string, comment: string) => Promise<void>;
  onEditPrompt: (id: string, newText: string) => Promise<void>;
  onDeletePrompt: (id: string) => Promise<void>;
  onMovePrompt: (promptId: string, targetCategoryId: string) => Promise<void>;
  onTogglePromptSelection: (promptId: string, selected: boolean) => void;
  onToggleSelectAll: (categoryName: string, selected: boolean) => void;
  onDeleteSelectedPrompts: (categoryName: string) => Promise<void>;
  onBulkImportPrompts: (prompts: { text: string; tags: string[] }[], categoryName: string) => Promise<void>;
  onExportPrompts: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentPage: number;
  structures: MusicStructure[];
  onAddStructure: (structure: MusicStructure | MusicStructure[]) => Promise<void>;
  onEditStructure: (id: string, structure: MusicStructure) => Promise<void>;
  onDeleteStructure: (id: string) => Promise<void>;
}

export const PromptsTabs = ({
  categories,
  structuresLoading,
  structuresLoadError,
  globalSearchTerm,
  setGlobalSearchTerm,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onRatePrompt,
  onAddComment,
  onEditPrompt,
  onDeletePrompt,
  onMovePrompt,
  onTogglePromptSelection,
  onToggleSelectAll,
  onDeleteSelectedPrompts,
  onBulkImportPrompts,
  onExportPrompts,
  onNextPage,
  onPreviousPage,
  currentPage,
  structures,
  onAddStructure,
  onEditStructure,
  onDeleteStructure
}: PromptsTabsProps) => {
  return (
    <Tabs defaultValue="prompts" className="w-full">
      <TabsList className="bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 w-full flex">
        <TabsTrigger value="prompts" className="flex-1">Prompts</TabsTrigger>
        <TabsTrigger value="estrutura" className="flex-1">Estrutura</TabsTrigger>
        <TabsTrigger value="workspace" className="flex-1">Workspace</TabsTrigger>
        <TabsTrigger value="links" className="flex-1">Links</TabsTrigger>
        <TabsTrigger value="lyrics" className="flex-1">Letras</TabsTrigger>
      </TabsList>

      <TabsContent value="prompts" className="mt-4 sm:mt-6">
        <PromptsSection 
          categories={categories}
          addCategory={onAddCategory}
          bulkImportPrompts={onBulkImportPrompts}
          ratePrompt={onRatePrompt}
          addComment={onAddComment}
          editPrompt={onEditPrompt}
          deletePrompt={onDeletePrompt}
          movePrompt={onMovePrompt}
          togglePromptSelection={onTogglePromptSelection}
          toggleSelectAll={onToggleSelectAll}
          deleteSelectedPrompts={onDeleteSelectedPrompts}
          editCategory={onEditCategory}
          deleteCategory={onDeleteCategory}
          searchTerm={globalSearchTerm}
          setSearchTerm={setGlobalSearchTerm}
          exportPrompts={onExportPrompts}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          currentPage={currentPage}
        />
      </TabsContent>

      <TabsContent value="estrutura" className="mt-4 sm:mt-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6">
          <StructureList 
            structures={structures} 
            loadError={structuresLoadError}
            onAddStructure={onAddStructure} 
            onEditStructure={onEditStructure} 
            onDeleteStructure={onDeleteStructure} 
          />
        </div>
      </TabsContent>

      <TabsContent value="workspace" className="mt-4 sm:mt-6">
        <Workspace />
      </TabsContent>

      <TabsContent value="links" className="mt-4 sm:mt-6">
        <Links />
      </TabsContent>

      <TabsContent value="lyrics" className="mt-4 sm:mt-6">
        <Lyrics />
      </TabsContent>
    </Tabs>
  );
};