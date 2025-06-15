import { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { SecurityProvider } from "@/components/SecurityProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  fetchPromptStats, 
  fetchCategories, 
  calculateCategoryStats,
  type PromptStat,
  type CategoryStat,
  searchPromptsByTerm
} from '@/services/statistics/statisticsService';
import { PromptStatCard } from '@/components/statistics/PromptStatCard';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { StatisticsFilters } from '@/components/statistics/StatisticsFilters';
import { PromptSearch } from '@/components/statistics/PromptSearch';
import { SearchResultsCard } from '@/components/statistics/SearchResultsCard';
import { toast } from "sonner";

// Componente principal da página de estatísticas
const StatisticsContent = () => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [promptStats, setPromptStats] = useState<PromptStat[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('performance_score');

  // Estados para a pesquisa por termo
  const [searchResults, setSearchResults] = useState<PromptStat[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Buscar dados quando o componente carregar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar prompts com estatísticas
      const prompts = await fetchPromptStats();
      setPromptStats(prompts);
      
      // Buscar lista de categorias para o filtro
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar prompts com base nos critérios selecionados
  const getFilteredPrompts = () => {
    let filtered = [...promptStats];
    
    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }
    
    // Filtrar por intervalo de tempo
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === '7days') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === '30days') {
        startDate.setDate(now.getDate() - 30);
      } else if (timeRange === '90days') {
        startDate.setDate(now.getDate() - 90);
      }
      
      filtered = filtered.filter(p => new Date(p.created_at) >= startDate);
    }
    
    // Ordenar resultados
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating_average':
          return b.rating_average - a.rating_average;
        case 'rating_count':
          return b.rating_count - a.rating_count;
        case 'copy_count':
          return b.copy_count - a.copy_count;
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'performance_score':
        default:
          return b.performance_score - a.performance_score;
      }
    });
    
    return filtered;
  };

  // Função para realizar a pesquisa por termo
  const handleSearch = async (term: string) => {
    if (!term) {
      setSearchResults([]);
      setCurrentSearchTerm('');
      return;
    }

    try {
      setIsSearching(true);
      setCurrentSearchTerm(term);
      const results = await searchPromptsByTerm(term);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info(`Nenhum prompt encontrado com o termo "${term}"`);
      } else {
        toast.success(`Encontrado(s) ${results.length} prompt(s)`);
      }
    } catch (error) {
      console.error('Erro ao buscar prompts:', error);
      toast.error(`Erro ao buscar prompts: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredPrompts = getFilteredPrompts();

  // Colunas para as diferentes categorias de ranking
  const renderRankingColumn = (title: string, icon: string, sortFn: (a: PromptStat, b: PromptStat) => number) => {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-100">
        <h2 className="text-base font-medium mb-4 pb-2 border-b border-gray-100 flex items-center">
          <span className="mr-2">{icon}</span>
          {title}
        </h2>
        <div className="space-y-3">
          {filteredPrompts
            .sort(sortFn)
            .slice(0, 8)
            .map(prompt => (
              <PromptStatCard key={prompt.id} prompt={prompt} />
            ))}
        </div>
      </div>
    );
  };

  return (
    <SecurityProvider>
      <div className="container mx-auto p-2 sm:p-4 relative min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <StatisticsHeader onSignOut={signOut} />

          {/* Conteúdo principal */}
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
            </div>
          ) : (
            <Tabs defaultValue="rankings" className="mt-5">
              <TabsList className="mb-6 w-full bg-white border border-gray-100">
                <TabsTrigger value="rankings" className="flex-1">Rankings de Prompts</TabsTrigger>
                <TabsTrigger value="search" className="flex-1">Busca por Termo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rankings" className="mt-2 space-y-6">
                {/* Filtros para a aba de rankings */}
                <StatisticsFilters
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categories={categories}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {renderRankingColumn("Melhor Desempenho", "🏆", (a, b) => b.performance_score - a.performance_score)}
                  {renderRankingColumn("Melhor Avaliados", "⭐", (a, b) => b.rating_average - a.rating_average)}
                  {renderRankingColumn("Mais Copiados", "📄", (a, b) => b.copy_count - a.copy_count)}
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="mt-2">
                {/* Componente de pesquisa */}
                <PromptSearch onSearch={handleSearch} isLoading={isSearching} />
                
                {/* Exibir resultados da pesquisa */}
                <SearchResultsCard 
                  prompts={searchResults} 
                  searchTerm={currentSearchTerm} 
                  isLoading={isSearching} 
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </SecurityProvider>
  );
};

// Componente principal envolvido no provedor de query (se necessário)
const Statistics = () => {
  return <StatisticsContent />;
};

export default Statistics; 