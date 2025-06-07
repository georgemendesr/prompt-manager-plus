
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { Category } from '@/types/prompt';
import type { TextPrompt } from '@/types/textPrompt';
import type { ImagePrompt } from '@/types/imagePrompt';

export interface SearchResult {
  id: string;
  title: string;
  body: string;
  type: 'music' | 'text' | 'image';
  category: string;
  tags: string[];
  score: number;
  favorite?: boolean;
}

interface UseGlobalSearchProps {
  categories: Category[];
  textPrompts: TextPrompt[];
  imagePrompts: ImagePrompt[];
}

export const useGlobalSearch = ({ categories, textPrompts, imagePrompts }: UseGlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const allResults = useMemo(() => {
    const results: SearchResult[] = [];

    // Adicionar prompts de música das categorias
    const addMusicPrompts = (cats: Category[], parentName = '') => {
      cats.forEach(category => {
        const categoryPath = parentName ? `${parentName} > ${category.name}` : category.name;
        
        category.prompts.forEach(prompt => {
          results.push({
            id: prompt.id,
            title: prompt.text.slice(0, 50) + (prompt.text.length > 50 ? '...' : ''),
            body: prompt.text,
            type: 'music',
            category: categoryPath,
            tags: prompt.tags,
            score: prompt.rating,
          });
        });

        if (category.subcategories) {
          addMusicPrompts(category.subcategories, categoryPath);
        }
      });
    };

    addMusicPrompts(categories);

    // Adicionar prompts de texto
    textPrompts.forEach(prompt => {
      const category = categories.find(c => c.id === prompt.category_id);
      results.push({
        id: prompt.id,
        title: prompt.title,
        body: prompt.body,
        type: 'text',
        category: category?.name || 'Sem categoria',
        tags: prompt.tags,
        score: prompt.score,
        favorite: prompt.favorite,
      });
    });

    // Adicionar prompts de imagem
    imagePrompts.forEach(prompt => {
      const category = categories.find(c => c.id === prompt.category_id);
      results.push({
        id: prompt.id,
        title: prompt.title,
        body: prompt.body,
        type: 'image',
        category: category?.name || 'Sem categoria',
        tags: prompt.tags,
        score: prompt.score,
        favorite: prompt.favorite,
      });
    });

    return results;
  }, [categories, textPrompts, imagePrompts]);

  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return allResults;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return allResults.filter(result => 
      result.title.toLowerCase().includes(searchLower) ||
      result.body.toLowerCase().includes(searchLower) ||
      result.category.toLowerCase().includes(searchLower) ||
      result.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [allResults, debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    results: filteredResults,
    totalResults: allResults.length,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
};
