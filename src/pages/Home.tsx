import { useAuth } from "@/components/AuthProvider";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";
import { PromptsTabs } from "@/components/prompts/PromptsTabs";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Redirecionar para a página de prompts por padrão
  useEffect(() => {
    navigate('/prompts');
  }, [navigate]);

  // Valores vazios necessários para o PromptsTabs
  const textPrompts = [];
  const imagePrompts = [];
  const categories = [];
  const globalSearchTerm = "";
  const setGlobalSearchTerm = () => {};

  return (
    <div className="container mx-auto p-2 sm:p-4 relative min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PromptsHeader onSignOut={signOut} />
        <PromptsTabs
          categories={categories}
          textPrompts={textPrompts}
          imagePrompts={imagePrompts}
          globalSearchTerm={globalSearchTerm}
          setGlobalSearchTerm={setGlobalSearchTerm}
          onAddCategory={() => Promise.resolve(false)}
          onEditCategory={() => Promise.resolve(false)}
          onDeleteCategory={() => Promise.resolve(false)}
          onRatePrompt={() => Promise.resolve()}
          onAddComment={() => Promise.resolve()}
          onEditPrompt={() => Promise.resolve()}
          onDeletePrompt={() => Promise.resolve()}
          onMovePrompt={() => Promise.resolve()}
          onTogglePromptSelection={() => {}}
          onToggleSelectAll={() => {}}
          onDeleteSelectedPrompts={() => Promise.resolve()}
          onBulkImportPrompts={() => Promise.resolve()}
          onExportPrompts={() => {}}
          onNextPage={() => {}}
          onPreviousPage={() => {}}
          currentPage={1}
          onRefreshRequired={() => {}}
        />
        {/* Conteúdo principal será renderizado nas rotas específicas */}
      </div>
    </div>
  );
} 