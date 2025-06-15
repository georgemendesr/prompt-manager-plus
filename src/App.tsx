
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Prompts from "./pages/Prompts";
import LinksPage from "./pages/Links";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";
import AgentsRoute from "./routes/agents";
import { AuthProvider } from "./components/AuthProvider";
import { useAuth } from "./components/AuthProvider";
import { Toaster } from "sonner";
import { executeMigrations } from "./integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Clipboard, Copy } from "lucide-react";
import Home from './pages/Home';
import Text from './pages/Text';
import Image from './pages/Image';
import Workspace from './pages/Workspace';
import Lyrics from './pages/Lyrics';

// Componente para executar migrações
function MigrationHandler() {
  const [migrationAttempted, setMigrationAttempted] = useState(false);

  useEffect(() => {
    const runMigrations = async () => {
      if (!migrationAttempted) {
        try {
          const result = await executeMigrations();
          if (result.success) {
            console.log("Verificação de tabelas concluída.");
            // Não exibir toast de sucesso para não confundir o usuário
          } else {
            console.error("Erro na verificação:", result.error);
            // Não exibir erro para o usuário
          }
        } catch (error) {
          console.error("Erro ao verificar tabelas:", error);
          // Não exibir erro para o usuário
        } finally {
          setMigrationAttempted(true);
        }
      }
    };

    runMigrations();
  }, [migrationAttempted]);

  return null; // Não renderiza nada visualmente
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MigrationHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/prompts"
            element={
              <ProtectedRoute>
                <Prompts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/links"
            element={
              <ProtectedRoute>
                <LinksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents"
            element={
              <ProtectedRoute>
                <AgentsRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents/:assistantSlug"
            element={
              <ProtectedRoute>
                <AgentsRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/text"
            element={
              <ProtectedRoute>
                <Text />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image"
            element={
              <ProtectedRoute>
                <Image />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lyrics"
            element={
              <ProtectedRoute>
                <Lyrics />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
