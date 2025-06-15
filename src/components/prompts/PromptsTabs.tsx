import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptsSection } from "@/components/prompts/PromptsSection";
import { TextPromptsSection } from "@/components/text/TextPromptsSection";
import { ImagePromptsSection } from "@/components/image/ImagePromptsSection";
import { Workspace } from "@/components/Workspace";
import { Links } from "@/components/links/Links";
import { Lyrics } from "@/components/lyrics/Lyrics";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { Category } from "@/types/prompt";
import type { TextPrompt } from "@/types/textPrompt";
import type { ImagePrompt } from "@/types/imagePrompt";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface PromptsTabsProps {
  categories: Category[];
  textPrompts: TextPrompt[];
  imagePrompts: ImagePrompt[];
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
  onRefreshRequired: () => void;
}

export const PromptsTabs = ({
  categories,
  textPrompts,
  imagePrompts,
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
  onRefreshRequired,
}: PromptsTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('music');
  
  // Determinar qual tab está ativa com base na URL atual
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/agents')) {
      setActiveTab('agents');
    } else if (path.startsWith('/prompts')) {
      setActiveTab('music');
    } else if (path.startsWith('/text')) {
      setActiveTab('text');
    } else if (path.startsWith('/image')) {
      setActiveTab('image');
    } else if (path.startsWith('/workspace')) {
      setActiveTab('workspace');
    } else if (path.startsWith('/links')) {
      setActiveTab('links');
    } else if (path.startsWith('/lyrics')) {
      setActiveTab('lyrics');
    } else {
      setActiveTab('music'); // Default
    }
  }, [location.pathname]);
  
  // Função para navegar para a página correta quando uma tab for clicada
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'agents':
        navigate('/agents');
        break;
      case 'music':
        navigate('/prompts');
        break;
      case 'text':
        navigate('/text');
        break;
      case 'image':
        navigate('/image');
        break;
      case 'workspace':
        navigate('/workspace');
        break;
      case 'links':
        navigate('/links');
        break;
      case 'lyrics':
        navigate('/lyrics');
        break;
      default:
        navigate('/prompts');
    }
  };
  
  return (
    <div className="space-y-4">
      <GlobalSearch 
        categories={categories}
        textPrompts={textPrompts}
        imagePrompts={imagePrompts}
        searchTerm={globalSearchTerm}
        setSearchTerm={setGlobalSearchTerm}
      />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 w-full flex">
          <TabsTrigger value="agents" className="flex-1 text-sm font-medium uppercase">Agentes</TabsTrigger>
          <TabsTrigger value="music" className="flex-1 text-sm font-medium uppercase">Música</TabsTrigger>
          <TabsTrigger value="text" className="flex-1 text-sm font-medium uppercase">Texto</TabsTrigger>
          <TabsTrigger value="image" className="flex-1 text-sm font-medium uppercase">Imagem</TabsTrigger>
          <TabsTrigger value="workspace" className="flex-1 text-sm font-medium uppercase">Workspace</TabsTrigger>
          <TabsTrigger value="links" className="flex-1 text-sm font-medium uppercase">Links</TabsTrigger>
          <TabsTrigger value="lyrics" className="flex-1 text-sm font-medium uppercase">Letras</TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="mt-4 sm:mt-6">
          <PromptsSection 
            categories={categories.filter(c => !c.parentId && c.name !== "Experts")}
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
            onRefreshRequired={onRefreshRequired}
          />
        </TabsContent>

        <TabsContent value="text" className="mt-4 sm:mt-6">
          <TextPromptsSection 
            categories={categories}
            textPrompts={textPrompts}
            searchTerm={globalSearchTerm}
          />
        </TabsContent>

        <TabsContent value="image" className="mt-4 sm:mt-6">
          <ImagePromptsSection 
            categories={categories}
            imagePrompts={imagePrompts}
            searchTerm={globalSearchTerm}
          />
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
    </div>
  );
};
