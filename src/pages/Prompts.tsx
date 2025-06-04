
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SecurityProvider } from "@/components/SecurityProvider";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";
import { ConnectionAlert } from "@/components/prompts/ConnectionAlert";
import { PromptsTabs } from "@/components/prompts/PromptsTabs";
import { PromptsLoading } from "@/components/prompts/PromptsLoading";
import { AIChat } from "@/components/ai/AIChat";
import { usePromptManager } from "@/hooks/usePromptManager";
import { useStructures } from "@/hooks/useStructures";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { updatePromptInDb, deletePromptFromDb } from "@/services/categoryService";
import { QueryProvider } from "@/providers/QueryProvider";
import { toast } from "sonner";

const PromptsContent = () => {
  const { signOut } = useAuth();
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const {
    categories,
    loading: categoriesLoading,
    loadError: categoriesLoadError,
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory,
    ratePrompt,
    addComment,
    movePrompt,
    bulkImportPrompts,
    deleteSelectedPrompts,
    togglePromptSelection,
    toggleSelectAll,
    exportPrompts
  } = usePromptManager();

  const {
    structures,
    loading: structuresLoading,
    loadError: structuresLoadError,
    loadStructures,
    addStructure,
    editStructure,
    deleteStructure
  } = useStructures();
  
  const { networkStatus, isRetrying, handleRetryConnection } = useNetworkStatus();

  // Simplified edit/delete functions that don't trigger full reload
  const editPrompt = async (id: string, newText: string) => {
    try {
      const { error } = await updatePromptInDb(id, newText);
      if (error) throw error;

      // Only reload if optimistic update fails
      toast.success("Prompt atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao editar prompt:', error);
      toast.error("Erro ao editar prompt");
      // Reload on error
      loadCategories();
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const { error } = await deletePromptFromDb(id);
      if (error) throw error;

      // Trigger reload for delete operations
      loadCategories();
      toast.success("Prompt excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir prompt:', error);
      toast.error("Erro ao excluir prompt");
    }
  };

  const handleRetry = async () => {
    await handleRetryConnection(async () => {
      await Promise.all([
        loadCategories(),
        loadStructures()
      ]);
      setConnectionError(null);
    });
  };

  // Load structures when component mounts
  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

  // Update connection error state
  useEffect(() => {
    if (categoriesLoadError || structuresLoadError) {
      setConnectionError(categoriesLoadError || structuresLoadError);
    } else {
      setConnectionError(null);
    }
  }, [categoriesLoadError, structuresLoadError]);

  // Show loading screen only if loading and no connection error
  if (categoriesLoading && !connectionError) {
    return <PromptsLoading />;
  }

  return (
    <SecurityProvider>
      <div className="container mx-auto p-2 sm:p-4 relative min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PromptsHeader onSignOut={signOut} />
          
          <ConnectionAlert 
            connectionError={connectionError}
            networkStatus={networkStatus}
            isRetrying={isRetrying}
            onRetry={handleRetry}
          />
          
          <PromptsTabs
            categories={categories}
            structuresLoading={structuresLoading}
            structuresLoadError={structuresLoadError}
            globalSearchTerm={globalSearchTerm}
            setGlobalSearchTerm={setGlobalSearchTerm}
            onAddCategory={addCategory}
            onEditCategory={editCategory}
            onDeleteCategory={deleteCategory}
            onRatePrompt={ratePrompt}
            onAddComment={addComment}
            onEditPrompt={editPrompt}
            onDeletePrompt={deletePrompt}
            onMovePrompt={movePrompt}
            onTogglePromptSelection={togglePromptSelection}
            onToggleSelectAll={toggleSelectAll}
            onDeleteSelectedPrompts={deleteSelectedPrompts}
            onBulkImportPrompts={bulkImportPrompts}
            onExportPrompts={exportPrompts}
            structures={structures}
            onAddStructure={addStructure}
            onEditStructure={editStructure}
            onDeleteStructure={deleteStructure}
          />
        </div>
        <AIChat />
      </div>
    </SecurityProvider>
  );
};

const Prompts = () => {
  return (
    <QueryProvider>
      <PromptsContent />
    </QueryProvider>
  );
};

export default Prompts;
