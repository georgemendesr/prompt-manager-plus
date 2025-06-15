
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/prompt";
import type { TextPrompt } from "@/types/textPrompt";
import type { ImagePrompt } from "@/types/imagePrompt";

interface GlobalSearchProps {
  categories: Category[];
  textPrompts: TextPrompt[];
  imagePrompts: ImagePrompt[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const GlobalSearch = ({
  categories,
  textPrompts,
  imagePrompts,
  searchTerm,
  setSearchTerm
}: GlobalSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { prompts: [], textPrompts: [], imagePrompts: [] };

    const term = searchTerm.toLowerCase();
    
    const musicPrompts = categories.flatMap(category => 
      category.prompts.filter(prompt => 
        prompt.text.toLowerCase().includes(term) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(term))
      ).map(prompt => ({ ...prompt, categoryName: category.name, type: 'music' as const }))
    );

    const filteredTextPrompts = textPrompts.filter(prompt =>
      prompt.text.toLowerCase().includes(term) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(term))
    ).map(prompt => ({ ...prompt, type: 'text' as const }));

    const filteredImagePrompts = imagePrompts.filter(prompt =>
      prompt.text.toLowerCase().includes(term) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(term))
    ).map(prompt => ({ ...prompt, type: 'image' as const }));

    return {
      prompts: musicPrompts,
      textPrompts: filteredTextPrompts,
      imagePrompts: filteredImagePrompts
    };
  }, [searchTerm, categories, textPrompts, imagePrompts]);

  const totalResults = searchResults.prompts.length + 
                     searchResults.textPrompts.length + 
                     searchResults.imagePrompts.length;

  const handleSearchClick = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!searchTerm) {
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleSearchClick}
        >
          <Search className="h-4 w-4" />
          Busca Global
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar em todos os prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onBlur={handleBlur}
          className="pl-10 w-full"
          autoFocus
        />
      </div>
      
      {searchTerm && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-2">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
            </div>
            
            {totalResults === 0 ? (
              <p className="text-gray-500 italic">Nenhum prompt encontrado.</p>
            ) : (
              <div className="space-y-4">
                {searchResults.prompts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-blue-600">Prompts de Música ({searchResults.prompts.length})</h4>
                    <div className="space-y-2">
                      {searchResults.prompts.slice(0, 5).map((prompt) => (
                        <div key={prompt.id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium">{prompt.categoryName}</div>
                          <div className="text-gray-600 truncate">{prompt.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.textPrompts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-green-600">Prompts de Texto ({searchResults.textPrompts.length})</h4>
                    <div className="space-y-2">
                      {searchResults.textPrompts.slice(0, 5).map((prompt) => (
                        <div key={prompt.id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="text-gray-600 truncate">{prompt.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.imagePrompts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-purple-600">Prompts de Imagem ({searchResults.imagePrompts.length})</h4>
                    <div className="space-y-2">
                      {searchResults.imagePrompts.slice(0, 5).map((prompt) => (
                        <div key={prompt.id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="text-gray-600 truncate">{prompt.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
