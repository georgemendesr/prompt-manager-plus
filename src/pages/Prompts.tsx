
import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";
import { ConnectionAlert } from "@/components/prompts/ConnectionAlert";
import { PromptsTabs } from "@/components/prompts/PromptsTabs";
import { PromptsLoading } from "@/components/prompts/PromptsLoading";
import { AIChat } from "@/components/ai/AIChat";
import { usePromptManager } from "@/hooks/usePromptManager";
import { useStructures } from "@/hooks/useStructures";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { updatePromptInDb, deletePromptFromDb } from "@/services/categoryService";
import { toast } from "sonner";

const Prompts = () => {
  const { signOut } = useAuth();
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [initialCategoriesDeleted, setInitialCategoriesDeleted] = useState(false);
  
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

  useEffect(() => {
    // Run once when categories are loaded and deletion hasn't been performed yet
    if (categories.length > 0 && !initialCategoriesDeleted && !categoriesLoading) {
      const deleteInitialCategories = async () => {
        const categoriesToDelete = ['Emocionantes II', 'Revisão'];
        let success = true;
        
        for (const categoryName of categoriesToDelete) {
          const category = categories.find(cat => cat.name === categoryName);
          if (category) {
            console.log(`Attempting to delete category: ${categoryName} (ID: ${category.id})`);
            const result = await deleteCategory(category.id);
            if (!result) {
              console.error(`Failed to delete category: ${categoryName}`);
              success = false;
              break;
            }
          }
        }
        
        if (success) {
          setInitialCategoriesDeleted(true);
          toast.success("Categorias especificadas foram removidas com sucesso!");
        } else {
          toast.error("Houve um problema ao remover uma ou mais categorias.");
        }
      };
      
      deleteInitialCategories();
    }
  }, [categories, categoriesLoading, initialCategoriesDeleted, deleteCategory]);

  const editPrompt = async (id: string, newText: string) => {
    try {
      const { error } = await updatePromptInDb(id, newText);
      if (error) throw error;

      loadCategories();
      toast.success("Prompt atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao editar prompt:', error);
      toast.error("Erro ao editar prompt");
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const { error } = await deletePromptFromDb(id);
      if (error) throw error;

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

  // Carregar estruturas quando o componente montar
  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

  // Atualizar o estado de erro de conexão quando os erros mudarem
  useEffect(() => {
    if (categoriesLoadError || structuresLoadError) {
      setConnectionError(categoriesLoadError || structuresLoadError);
    } else {
      setConnectionError(null);
    }
  }, [categoriesLoadError, structuresLoadError]);

  // Se estiver carregando e não houver erro de conexão, mostrar tela de carregamento
  if (categoriesLoading && !connectionError) {
    return <PromptsLoading />;
  }

  return (
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
  );
};

export default Prompts;
