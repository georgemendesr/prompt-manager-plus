import React from 'react';
import { Card } from "@/components/ui/card";
import { PromptStatCard } from './PromptStatCard';
import { PromptStat } from '@/services/statistics/statisticsService';

interface SearchResultsCardProps {
  prompts: PromptStat[];
  searchTerm: string;
  isLoading: boolean;
}

export const SearchResultsCard: React.FC<SearchResultsCardProps> = ({ 
  prompts, 
  searchTerm,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="p-5 bg-white/90 border border-gray-100">
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Buscando prompts com "{searchTerm}"...</p>
        </div>
      </Card>
    );
  }

  if (!searchTerm) {
    return (
      <Card className="p-5 bg-white/90 border border-gray-100">
        <div className="text-center py-10">
          <p className="text-gray-600">Digite um termo para buscar prompts.</p>
        </div>
      </Card>
    );
  }

  if (prompts.length === 0) {
    return (
      <Card className="p-5 bg-white/90 border border-gray-100">
        <div className="text-center py-10">
          <p className="text-gray-600">Nenhum prompt encontrado com o termo "{searchTerm}".</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-white/90 border border-gray-100">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-base font-medium">
          Resultados para "{searchTerm}" ({prompts.length} prompts)
        </h2>
      </div>

      <div className="space-y-3">
        {prompts.map(prompt => (
          <PromptStatCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </Card>
  );
}; 