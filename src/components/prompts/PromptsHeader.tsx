<<<<<<< HEAD
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, BarChart } from "lucide-react";
=======

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

interface PromptsHeaderProps {
  onSignOut: () => void;
}

export const PromptsHeader = ({ onSignOut }: PromptsHeaderProps) => {
  return (
<<<<<<< HEAD
    <div className="flex items-center justify-between mb-3 sm:mb-6 py-1">
      <Link 
        to="/prompts" 
        className="flex items-center gap-1 sm:gap-2"
=======
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <Link 
        to="/prompts" 
        className="flex items-center gap-2"
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
      >
        <img 
          src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
          alt="R10 Comunicação Criativa" 
<<<<<<< HEAD
          className="h-8 sm:h-14 w-auto"
        />
        <h1 className="text-base sm:text-2xl font-bold text-gray-800">
          Prompts
        </h1>
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        <Link to="/statistics">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 sm:h-10 sm:w-auto sm:px-3 p-0 sm:gap-2"
            title="Estatísticas"
          >
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Estatísticas</span>
          </Button>
        </Link>
        <Link to="/settings">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 sm:h-10 sm:w-auto sm:px-3 p-0 sm:gap-2"
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={onSignOut}
          size="sm"
          className="h-8 w-8 sm:h-10 sm:w-auto sm:px-3 p-0 sm:gap-2"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
=======
          className="h-10 sm:h-14 w-auto"
        />
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
          Prompts
        </h1>
      </Link>
      <Button 
        variant="outline" 
        onClick={onSignOut}
        size="sm"
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </Button>
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
    </div>
  );
};
