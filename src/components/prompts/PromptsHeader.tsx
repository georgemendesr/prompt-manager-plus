
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface PromptsHeaderProps {
  onSignOut: () => void;
}

export const PromptsHeader = ({ onSignOut }: PromptsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <Link 
        to="/prompts" 
        className="flex items-center gap-2"
      >
        <img 
          src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
          alt="R10 Comunicação Criativa" 
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
    </div>
  );
};
