
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import type { Category } from "@/types/prompt";
import type { TextPrompt } from "@/types/textPrompt";
import type { ImagePrompt } from "@/types/imagePrompt";

interface SearchResult {
  id: string;
  type: 'music' | 'text' | 'image';
  title: string;
  body: string;
  category: string;
  tags: string[];
  favorite: boolean;
  score: number;
}

interface UseGlobalSearchProps {
  categories: Category[];
  textPrompts: TextPrompt[];
  imagePrompts: ImagePrompt[];
}

export const useGlobalSearch = ({ categories, textPrompts, imagePrompts }: UseGlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setResults([]);
      setTotalResults(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const searchInPrompts = () => {
      const allResults: SearchResult[] = [];

      // Search in music prompts (using existing categories/prompts structure)
      categories.forEach(category => {
        if (category.prompts) {
          category.prompts.forEach(prompt => {
            const matchesSearch = 
              prompt.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              prompt.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

            if (matchesSearch) {
              allResults.push({
                id: prompt.id,
                type: 'music',
                title: prompt.text.substring(0, 50) + (prompt.text.length > 50 ? '...' : ''),
                body: prompt.text,
                category: category.name,
                tags: prompt.tags,
                favorite: false, // music prompts don't have favorite field
                score: Math.floor(prompt.rating / 20) // convert 0-100 rating to 0-5 score
              });
            }
          });
        }
      });

      // Search in text prompts
      textPrompts.forEach(prompt => {
        const matchesSearch = 
          prompt.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          prompt.body.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

        if (matchesSearch) {
          const category = categories.find(c => c.id === prompt.category_id);
          allResults.push({
            id: prompt.id,
            type: 'text',
            title: prompt.title,
            body: prompt.body,
            category: category?.name || 'Sem categoria',
            tags: prompt.tags,
            favorite: prompt.favorite,
            score: prompt.score
          });
        }
      });

      // Search in image prompts
      imagePrompts.forEach(prompt => {
        const matchesSearch = 
          prompt.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          prompt.body.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

        if (matchesSearch) {
          const category = categories.find(c => c.id === prompt.category_id);
          allResults.push({
            id: prompt.id,
            type: 'image',
            title: prompt.title,
            body: prompt.body,
            category: category?.name || 'Sem categoria',
            tags: prompt.tags,
            favorite: prompt.favorite,
            score: prompt.score
          });
        }
      });

      // Sort by score and favorite status
      allResults.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return b.score - a.score;
      });

      setTotalResults(allResults.length);
      setResults(allResults);
      setIsSearching(false);
    };

    searchInPrompts();
  }, [debouncedSearchTerm, categories, textPrompts, imagePrompts]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    totalResults,
    isSearching
  };
};
