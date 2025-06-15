import { CategorySearch } from "./CategorySearch";
import { CategoryActions } from "@/components/CategoryActions";
import { PromptCard } from "@/components/PromptCard";
import { Input } from '@/components/ui/input';
import type { Category, Prompt } from "@/types/prompt";
import { toast } from "sonner";

interface CategoryContentProps {
  category: Category;
  level: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categories: Category[];
  onRatePrompt: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onMovePrompt: (id: string, targetCategoryId: string) => void;
  onTogglePromptSelection: (id: string, selected: boolean) => void;
  onToggleSelectAll: (selected: boolean) => void;
  onDeleteSelectedPrompts: () => void;
  onUpdatePrompt?: (id: string, newText: string) => void;
  onRefreshRequired: () => void;
}

export const CategoryContent = ({
  category,
  level,
  searchTerm,
  setSearchTerm,
  categories,
  onRatePrompt,
  onAddComment,
  onMovePrompt,
  onTogglePromptSelection,
  onToggleSelectAll,
  onDeleteSelectedPrompts,
  onUpdatePrompt,
  onRefreshRequired,
}: CategoryContentProps) => {
  // Função para gerar o ID sequencial
  const generateUniqueId = (prompt: Prompt, allPromptsInCategory: Prompt[]) => {
    let categoryName = 'PROMPT';
    const structureComment = prompt.comments.find(c => c.startsWith('[') && c.endsWith(']'));
      
    if (structureComment) {
      categoryName = structureComment.slice(1, -1);
    } else if (prompt.category) {
      categoryName = prompt.category;
    }

    const words = categoryName.toUpperCase().replace(/[^A-Z\s]/g, '').split(' ').filter(Boolean);
    let categoryCode = '';

    if (words.length >= 2) {
      categoryCode = words[0].substring(0, 3) + words[1].substring(0, 3);
    } else if (words.length === 1) {
      categoryCode = words[0].substring(0, 6);
    } else {
      categoryCode = 'GEN';
    }

    // Filtra os prompts da mesma "subcategoria" para encontrar o índice sequencial
    const promptsInSameSubcategory = allPromptsInCategory.filter(p => {
      let pCategoryName = 'PROMPT';
      const pStructureComment = p.comments.find(c => c.startsWith('[') && c.endsWith(']'));
      if (pStructureComment) {
        pCategoryName = pStructureComment.slice(1, -1);
      } else if (p.category) {
        pCategoryName = p.category;
      }
      return pCategoryName === categoryName;
    });

    const sequentialIndex = promptsInSameSubcategory.findIndex(p => p.id === prompt.id);
    // Adiciona 1 para o índice não ser zero-based e formata
    const promptNumber = String(sequentialIndex + 1).padStart(3, '0');

    return `${categoryCode}-${promptNumber}`;
  };
  
  // Atribui o uniqueId a cada prompt ANTES de filtrar ou ordenar
  const promptsWithUniqueId = category.prompts.map(p => ({
    ...p,
    uniqueId: generateUniqueId(p, category.prompts)
  }));

  // Filtrar os prompts se houver termo de busca
  const filteredPrompts = searchTerm
    ? promptsWithUniqueId.filter(prompt => 
        prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.comments.some(comment => 
          comment.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        prompt.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : promptsWithUniqueId;

  // Ordenar prompts primeiro por avaliação média (ratingAverage) e depois por número de cópias (copyCount) - do maior para o menor
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    const ratingA = a.ratingAverage || 0;
    const ratingB = b.ratingAverage || 0;
    
    // Se as avaliações forem diferentes, ordena por avaliação
    if (ratingA !== ratingB) {
      return ratingB - ratingA; // Maior para menor
    }
    
    // Se as avaliações forem iguais, ordena por número de cópias
    const copyA = a.copyCount || 0;
    const copyB = b.copyCount || 0;
    return copyB - copyA; // Maior para menor
  });

  // Função para lidar com atualizações de prompt incluindo traduções
  const handleUpdatePrompt = (id: string, updates: any) => {
    console.log('[CATEGORY] Atualizando prompt:', id, updates);
    
    // Se tiver uma função de atualização de texto e o update inclui texto
    if (onUpdatePrompt && 'text' in updates) {
      onUpdatePrompt(id, updates.text);
    }
    
    // Para outras atualizações, como traduções, precisamos apenas atualizar o estado
    if ('translatedText' in updates) {
      console.log('[CATEGORY] Atualizando tradução do prompt:', id, updates.translatedText.substring(0, 30) + '...');
      // O PromptCard já salvou a tradução no banco, só precisamos atualizar a UI
      // Podemos fazer isso chamando o refresh se necessário
      onRefreshRequired();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {level === 0 && (
        <Input
          type="text"
          placeholder="Buscar prompts nesta categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3 sm:mb-4"
        />
      )}

      <CategoryActions
        prompts={category.prompts}
        onSelectAll={(checked) => onToggleSelectAll(checked)}
        onDelete={() => onDeleteSelectedPrompts()}
        onMove={(targetCategoryId) => {
          const selectedPrompts = category.prompts.filter(p => p.selected);
          selectedPrompts.forEach(prompt => onMovePrompt(prompt.id, targetCategoryId));
        }}
        categories={categories}
        currentCategoryId={category.id}
      />

      <div className="grid gap-3 sm:gap-6">
        {sortedPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onRate={onRatePrompt}
            onAddComment={onAddComment}
            onSelect={onTogglePromptSelection}
            selected={prompt.selected || false}
            categories={categories}
            searchTerm={searchTerm}
            onPromptUpdate={onRefreshRequired}
            onUpdatePrompt={handleUpdatePrompt}
            onDeletePrompt={() => {}}
            onMovePrompt={onMovePrompt}
          />
        ))}
      </div>

      {sortedPrompts.length === 0 && (!category.subcategories || category.subcategories.length === 0) && (
        <div className="text-center py-4 sm:py-6 text-gray-500 bg-gray-50/50 rounded-lg">
          {searchTerm ? "Nenhum prompt encontrado" : "Nenhum prompt nesta categoria ainda"}
        </div>
      )}
    </div>
  );
};
