import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { PromptStat } from '@/services/statistics/statisticsService';
import { toast } from "sonner";

interface PromptStatCardProps {
  prompt: PromptStat;
}

export const PromptStatCard: React.FC<PromptStatCardProps> = ({ prompt }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Truncar texto longo (apenas para visualização compacta)
  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Obter um ID curto e legível
  const getShortId = () => {
    if (prompt.uniqueId) {
      // Se for um ID formatado como XXX-YYY, pegar apenas a parte inicial
      const parts = prompt.uniqueId.split('-');
      return parts[0];
    }
    // Se for um UUID, pegar apenas os primeiros 4 caracteres
    return prompt.id.substring(0, 4);
  };
  
  // Função para copiar o texto do prompt
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      toast.success("Prompt copiado!");
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      toast.error("Erro ao copiar o texto");
    }
  };

  return (
    <Card className="mb-3 hover:shadow-sm transition-shadow border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="flex flex-col space-y-1.5">
          {/* Título, Score e botões de ação */}
          <div className="flex justify-between items-start gap-2">
            <h3 
              className={`font-medium text-sm ${expanded ? '' : 'line-clamp-1'} flex-1 cursor-pointer`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? prompt.text : truncateText(prompt.text)}
            </h3>
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-blue-50"
                onClick={handleCopyText}
                title="Copiar texto"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <div className="bg-blue-50 text-blue-700 font-medium py-0.5 px-2 rounded text-xs whitespace-nowrap shrink-0">
                {prompt.performance_score.toFixed(0)}
              </div>
            </div>
          </div>
          
          {/* Texto completo quando expandido */}
          {expanded && (
            <div className="text-sm text-gray-700 py-2">
              {prompt.text}
            </div>
          )}
          
          {/* ID e categoria em linha com as estatísticas */}
          <div className="flex items-center justify-between">
            {/* Estatísticas */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center text-yellow-600">
                <span className="font-medium">★</span>
                <span className="ml-1">{prompt.rating_average.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">({prompt.rating_count})</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-medium">📄</span>
                <span className="ml-1">{prompt.copy_count}</span>
              </div>
              
              {/* Botão para expandir/colapsar */}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 p-0 hover:bg-gray-50"
                onClick={() => setExpanded(!expanded)}
                title={expanded ? "Colapsar" : "Expandir"}
              >
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            
            {/* ID curto */}
            <div className="text-xs text-gray-400 shrink-0">
              <span className="hidden sm:inline-block text-gray-400">ID:</span> {getShortId()}
              {prompt.category_name && <span className="hidden sm:inline-block ml-1">· {prompt.category_name}</span>}
              {prompt.category_name && <span className="sm:hidden ml-1">· {prompt.category_name.split(' ')[0]}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 