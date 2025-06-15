import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useEffect } from "react";
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
  const { results, totalResults, isSearching, search } = useGlobalSearch({
    categories,
    textPrompts,
    imagePrompts
  });

  // Usar useEffect para realizar a busca quando o termo de busca mudar
  useEffect(() => {
    search(searchTerm);
  }, [search, searchTerm]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'music': return 'bg-blue-100 text-blue-800';
      case 'text': return 'bg-green-100 text-green-800';
      case 'image': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'music': return 'Música';
      case 'text': return 'Texto';
      case 'image': return 'Imagem';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar em todos os prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchTerm && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {isSearching ? 'Buscando...' : `${results.length} de ${totalResults} resultados`}
            </p>
          </div>

          {results.length > 0 && (
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {results.slice(0, 20).map((result) => (
                <Card key={`${result.type}-${result.id}`} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getTypeColor(result.type)}>
                          {getTypeLabel(result.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">{result.category}</span>
                      </div>
                      <h4 className="text-sm font-medium truncate">{result.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {result.body}
                      </p>
                      {result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {result.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {result.favorite && <span className="text-yellow-500">⭐</span>}
                      <span className="text-xs text-gray-500">⭐ {result.score}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {results.length === 0 && !isSearching && (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum resultado encontrado para "{searchTerm}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};
