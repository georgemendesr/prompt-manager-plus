import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SecurityProvider } from "@/components/SecurityProvider";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";
import { ConnectionAlert } from "@/components/prompts/ConnectionAlert";
import { PromptsTabs } from "@/components/prompts/PromptsTabs";
import { PromptsLoading } from "@/components/prompts/PromptsLoading";
import { HealthStatus } from "@/components/common/HealthStatus";
import { usePromptManager } from "@/hooks/usePromptManager";
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
    loadError,
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
    exportPrompts,
    nextPage,
    previousPage,
    currentPage,
  } = usePromptManager();

  const { networkStatus, isRetrying, handleRetryConnection } = useNetworkStatus();

  // "Ouvinte" para o evento de atualização de prompts disparado pelo PromptCard.
  // Isso permite uma atualização de dados mais suave, sem recarregamento de página.
  useEffect(() => {
    const handlePromptsUpdate = () => {
      console.log('Recebido evento de atualização de prompts. Recarregando categorias...');
      loadCategories();
    };

    window.addEventListener('promptsUpdated', handlePromptsUpdate);

    // Limpa o "ouvinte" quando o componente é desmontado para evitar vazamentos de memória.
    return () => {
      window.removeEventListener('promptsUpdated', handlePromptsUpdate);
    };
  }, [loadCategories]);

  // Mantemos as chamadas de 'Texto' e 'Imagem' vazias para não quebrar a aplicação
  const textPrompts = [];
  const imagePrompts = [];

  const editPrompt = async (id: string, newText: string) => {
    try {
      const { error } = await updatePromptInDb(id, newText);
      if (error) throw error;
      toast.success("Prompt atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao editar prompt:', error);
      toast.error("Erro ao editar prompt");
      loadCategories();
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
      await loadCategories();
      setConnectionError(null);
    });
  };

  useEffect(() => {
    if (loadError) {
      setConnectionError(loadError);
    } else {
      setConnectionError(null);
    }
  }, [loadError]);

  if (categoriesLoading && !connectionError) {
    return <PromptsLoading />;
  }

  return (
    <SecurityProvider>
      <div className="container mx-auto p-2 sm:p-4 relative min-h-screen">
        {categoriesLoading && <PromptsLoading />}
        
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
            textPrompts={textPrompts}
            imagePrompts={imagePrompts}
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
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            currentPage={currentPage}
            onRefreshRequired={loadCategories}
          />
        </div>
        <HealthStatus />
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
