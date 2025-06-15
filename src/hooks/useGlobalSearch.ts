
import { useMemo } from 'react';
import type { Category, Prompt } from '@/types/prompt';
import type { TextPrompt } from '@/types/textPrompt';
import type { ImagePrompt } from '@/types/imagePrompt';

export interface GlobalSearchResult {
  type: 'music' | 'text' | 'image';
  category: string;
  prompt: Prompt | TextPrompt | ImagePrompt;
  matchedText: string;
}

export const useGlobalSearch = (
  categories: Category[],
  textPrompts: TextPrompt[],
  imagePrompts: ImagePrompt[],
  searchTerm: string
) => {
  const searchResults = useMemo((): GlobalSearchResult[] => {
    if (!searchTerm.trim()) return [];

    const results: GlobalSearchResult[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Search in music categories
    const searchInCategories = (cats: Category[], parentCategory?: string) => {
      cats.forEach(category => {
        const categoryPath = parentCategory ? `${parentCategory} > ${category.name}` : category.name;
        
        // Search in prompts
        category.prompts.forEach(prompt => {
          if (prompt.text.toLowerCase().includes(lowerSearchTerm) ||
              prompt.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) {
            results.push({
              type: 'music',
              category: categoryPath,
              prompt: prompt,
              matchedText: prompt.text
            });
          }
        });

        // Search in subcategories
        if (category.subcategories && category.subcategories.length > 0) {
          searchInCategories(category.subcategories, categoryPath);
        }
      });
    };

    searchInCategories(categories);

    // Search in text prompts
    textPrompts.forEach(textPrompt => {
      const fullText = textPrompt.blocks.map(block => block.text).join(' ');
      if (fullText.toLowerCase().includes(lowerSearchTerm) ||
          (textPrompt.title && textPrompt.title.toLowerCase().includes(lowerSearchTerm))) {
        results.push({
          type: 'text',
          category: 'Text Prompts',
          prompt: textPrompt as any,
          matchedText: textPrompt.title || fullText.substring(0, 100)
        });
      }
    });

    // Search in image prompts
    imagePrompts.forEach(imagePrompt => {
      const fullText = imagePrompt.blocks.map(block => block.text).join(' ');
      if (fullText.toLowerCase().includes(lowerSearchTerm) ||
          (imagePrompt.title && imagePrompt.title.toLowerCase().includes(lowerSearchTerm))) {
        results.push({
          type: 'image',
          category: 'Image Prompts',
          prompt: imagePrompt as any,
          matchedText: imagePrompt.title || fullText.substring(0, 100)
        });
      }
    });

    return results.slice(0, 20);
  }, [categories, textPrompts, imagePrompts, searchTerm]);

  const groupedResults = useMemo(() => {
    const grouped = searchResults.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, GlobalSearchResult[]>);

    return grouped;
  }, [searchResults]);

  return {
    searchResults,
    groupedResults,
    totalResults: searchResults.length,
    hasResults: searchResults.length > 0
  };
};
