import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@/components/AuthProvider";
import { PromptsHeader } from "@/components/prompts/PromptsHeader";
import { PromptsTabs } from "@/components/prompts/PromptsTabs";
import { AgentsSubmenu } from './AgentsSubmenu';
import { ChatPanel } from './ChatPanel';

// Lista de assistentes disponíveis - idealmente viria de uma env var ou API
const assistants = [
  { id: 'asst_MLJYtP1ZjjWlwmeIeY9UTlQx', name: 'Pedro Compositor', slug: 'pedro-compositor' },
  { id: 'asst_2', name: 'Assistente de Letras', slug: 'assistente-letras' },
  { id: 'asst_3', name: 'Consultor Musical', slug: 'consultor-musical' },
];

export const AgentsPage = () => {
  const { signOut } = useAuth();
  const { assistantSlug } = useParams();
  const navigate = useNavigate();
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  console.log("AgentsPage render:", { assistantSlug, selectedAssistant });

  // Efeito para selecionar o assistente com base no slug da URL ou usar o primeiro da lista
  useEffect(() => {
    if (assistantSlug) {
      // Se temos um slug na URL, procurar o assistente correspondente
      const assistant = assistants.find(a => a.slug === assistantSlug);
      if (assistant) {
        console.log("AgentsPage: selecionando assistente por slug", assistant);
        setSelectedAssistant(assistant);
      } else {
        // Se o slug não corresponder a nenhum assistente, redirecionar para o primeiro
        console.log("AgentsPage: slug inválido, redirecionando para o primeiro assistente");
        if (assistants.length > 0) {
          navigate(`/agents/${assistants[0].slug}`);
        } else {
          navigate('/agents');
        }
      }
    } else {
      // Se não temos slug, mas temos assistentes, redirecionar para o primeiro
      if (assistants.length > 0 && !selectedAssistant) {
        console.log("AgentsPage: sem slug, redirecionando para o primeiro assistente");
        navigate(`/agents/${assistants[0].slug}`);
      }
    }
  }, [assistantSlug, navigate, selectedAssistant]);

  // Função para lidar com a seleção de um assistente
  const handleSelectAssistant = (assistant) => {
    console.log("AgentsPage.handleSelectAssistant:", assistant);
    navigate(`/agents/${assistant.slug}`);
  };

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
        
        <div className="flex flex-col gap-4 mt-4">
          {/* Submenu de agentes */}
          <AgentsSubmenu 
            assistants={assistants} 
            selectedAssistant={selectedAssistant}
            onSelectAssistant={handleSelectAssistant}
          />
          
          {/* Painel de chat */}
          <ChatPanel 
            assistant={selectedAssistant}
          />
        </div>
      </div>
    </div>
  );
}; 