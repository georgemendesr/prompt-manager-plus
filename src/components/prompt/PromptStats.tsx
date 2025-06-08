
import React from 'react';

interface PromptStatsProps {
  simpleId: string;
  ratingAverage: number;
  ratingCount: number;
  copyCount: number;
}

export const PromptStats = ({ 
  simpleId, 
  ratingAverage, 
  ratingCount, 
  copyCount 
}: PromptStatsProps) => {
  return (
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span className="font-mono text-blue-600 font-medium">
        {simpleId}
      </span>
      <div className="flex items-center gap-2">
        <span>📄 {copyCount}</span>
        <span>•</span>
        <span>★ {ratingAverage.toFixed(1)} ({ratingCount})</span>
      </div>
    </div>
  );
};
