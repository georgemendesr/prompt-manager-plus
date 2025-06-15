import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CategoryStat } from '@/services/statistics/statisticsService';

interface CategoryStatCardProps {
  category: CategoryStat;
}

export const CategoryStatCard: React.FC<CategoryStatCardProps> = ({ category }) => {
  // Truncar texto longo em telas pequenas
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <Card className="mb-3 hover:shadow-sm transition-shadow border-l-4 border-l-green-500">
      <CardContent className="p-3">
        <div className="flex flex-col space-y-1.5">
          {/* Nome da categoria e contador de prompts */}
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-medium text-sm truncate flex-1">
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{truncateName(category.name)}</span>
            </h3>
            <div className="bg-green-50 text-green-700 font-medium py-0.5 px-2 rounded text-xs whitespace-nowrap shrink-0">
              {category.promptCount}
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center text-yellow-600">
                <span className="font-medium">★</span>
                <span className="ml-1">{category.avgRating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">média</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-medium">🔄</span>
                <span className="ml-1">{category.engagement}</span>
                <span className="hidden sm:inline text-gray-500 ml-1">engajamento</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 