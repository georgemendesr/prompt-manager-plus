import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PromptSearchProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export const PromptSearch: React.FC<PromptSearchProps> = ({ onSearch, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  return (
    <Card className="p-3 mb-5 bg-white/50 border border-gray-100">
      <form onSubmit={handleSearch} className="flex flex-wrap sm:flex-nowrap gap-2">
        <div className="w-full">
          <label htmlFor="search-term" className="block text-xs font-medium text-gray-600 mb-1">
            Buscar prompts por termo
          </label>
          <Input
            id="search-term"
            type="text"
            placeholder="Digite um termo para buscar (ex: reggae, vocal, guitarra...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm w-full"
          />
        </div>
        <Button 
          type="submit" 
          className="mt-auto h-8 px-3 gap-1 text-xs"
          disabled={isLoading || !searchTerm.trim()}
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </form>
    </Card>
  );
}; 