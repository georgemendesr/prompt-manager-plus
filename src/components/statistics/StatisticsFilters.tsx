import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface StatisticsFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  timeRange: string;
  setTimeRange: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  categories: { id: string; name: string }[];
}

export const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  timeRange,
  setTimeRange,
  sortBy,
  setSortBy,
  categories,
}) => {
  return (
    <Card className="p-3 mb-5 bg-white/50 border border-gray-100">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="h-8 text-xs w-full sm:w-[180px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-gray-600 mb-1">Período</label>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="h-8 text-xs w-full sm:w-[180px]">
              <SelectValue placeholder="Todo período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-gray-600 mb-1">Ordenar por</label>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="h-8 text-xs w-full sm:w-[180px]">
              <SelectValue placeholder="Score de desempenho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance_score">Score de desempenho</SelectItem>
              <SelectItem value="rating_average">Nota média</SelectItem>
              <SelectItem value="rating_count">Nº de avaliações</SelectItem>
              <SelectItem value="copy_count">Nº de cópias</SelectItem>
              <SelectItem value="created_at">Data de criação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}; 