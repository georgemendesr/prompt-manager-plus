import { useAuth } from "@/components/AuthProvider";
import { MainTabs } from "@/components/layout/MainTabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Lyrics as LyricsComponent } from "@/components/lyrics/Lyrics";

export default function Lyrics() {
  const { signOut } = useAuth();

  return (
    <div className="container mx-auto p-2 sm:p-4 relative min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-6 py-1">
          <Link 
            to="/lyrics" 
            className="flex items-center gap-1 sm:gap-2"
          >
            <img 
              src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
              alt="R10 Comunicação Criativa" 
              className="h-8 sm:h-14 w-auto"
            />
            <h1 className="text-base sm:text-2xl font-bold text-gray-800">
              Letras
            </h1>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={signOut}
              size="sm"
              className="h-8 w-8 sm:h-10 sm:w-auto sm:px-3 p-0 sm:gap-2"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
        
        {/* Tabs de navegação principal */}
        <MainTabs />
        
        {/* Conteúdo da página */}
        <LyricsComponent />
      </div>
    </div>
  );
} 