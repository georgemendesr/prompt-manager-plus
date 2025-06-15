import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart, ArrowLeft } from "lucide-react";

interface StatisticsHeaderProps {
  onSignOut: () => void;
}

export const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({ onSignOut }) => {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-2">
        <Link to="/prompts" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img
            src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png"
            alt="R10 Comunicação Criativa"
            className="h-10 sm:h-14 w-auto"
          />
          <div className="flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-blue-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Estatísticas de Uso</h1>
          </div>
        </div>
      </div>
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