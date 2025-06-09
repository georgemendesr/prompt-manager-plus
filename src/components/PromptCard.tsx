import { useState } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Copy, ExternalLink, Star } from "lucide-react";
import { Button } from "./ui/button";
import type { Prompt, MusicStructure, Category } from "@/types/prompt";
import { CommentSection } from "./prompt/CommentSection";
import { PromptText } from "./prompt/PromptText";
import { PromptComments } from "./prompt/PromptComments";
import { incrementCopyCount, addPromptRating } from "@/services/rating/ratingService";

interface PromptCardProps {
  prompt: Prompt;
  onRate: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onEditPrompt?: (id: string, newText: string) => void;
  onDeletePrompt?: (id: string) => void;
  onSelect: (id: string, selected: boolean) => void;
  selected: boolean;
  structures?: MusicStructure[];
  categories?: Category[];
  searchTerm?: string;
  onPromptUpdate?: () => void;
}

export const PromptCard = ({ 
  prompt, 
  onRate, 
  onAddComment, 
  onEditPrompt,
  onDeletePrompt,
  onSelect,
  selected,
  structures = [],
  categories = [],
  searchTerm = "",
  onPromptUpdate
}: PromptCardProps) => {
  const [bgColor, setBgColor] = useState(prompt.backgroundColor || "bg-blue-50/30");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Incrementar contador de cópias
      await incrementCopyCount(prompt.id);
      
      toast.success("Prompt copiado!");
      
      // Atualizar os dados do prompt
      if (onPromptUpdate) {
        onPromptUpdate();
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error("Erro ao copiar prompt");
    }
  };

  const handleOpenInSuno = () => {
    const sunoUrl = `https://suno.com/create?prompt=${encodeURIComponent(prompt.text)}`;
    window.open(sunoUrl, '_blank');
  };

  const handleStarClick = async (rating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await addPromptRating(prompt.id, rating);
      if (error) throw error;
      
      toast.success(`Avaliação de ${rating} estrela${rating > 1 ? 's' : ''} adicionada!`);
      
      if (onPromptUpdate) {
        onPromptUpdate();
      }
    } catch (error) {
      console.error('Erro ao avaliar:', error);
      toast.error('Erro ao adicionar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterComments = (comments: string[]) => {
    return comments.filter(comment => {
      const lowerComment = comment.toLowerCase();
      const systemTags = [
        'male voice',
        'female voice',
        'busca',
        'selecionar todos',
        '[color:',
        'voice:male',
        'voice:female',
        'português',
        'brasil'
      ];
      return !systemTags.some(tag => 
        lowerComment.includes(tag.toLowerCase())
      );
    });
  };

  const commentTags = filterComments(
    prompt.comments.filter(comment => comment.startsWith('#'))
  ).map(tag => tag.replace(/^#/, '').trim());

  const hashtags = Array.from(
    new Set([...(prompt.tags || []), ...commentTags])
  ).map(t => `#${t}`);

  const regularComments = filterComments(
    prompt.comments.filter(comment => !comment.startsWith('#'))
  );

  // Usar o uniqueId se disponível, caso contrário gerar um
  const displayId = prompt.uniqueId || `GEN-GEN-${String(prompt.rating + 1).padStart(3, '0')}`;

  // Determinar destaque visual para Top 10
  const getCardClasses = () => {
    const baseClasses = "relative text-xs p-3 border transition-all duration-200";
    const avgRating = prompt.ratingAverage || 0;
    
    // Top 3 - Destaque dourado
    if (avgRating >= 4.5) {
      return `${baseClasses} bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-lg ring-1 ring-amber-200`;
    }
    // Top 4-10 - Destaque azul
    if (avgRating >= 4.0) {
      return `${baseClasses} bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md ring-1 ring-blue-200`;
    }
    // Top 11-20 - Destaque sutil
    if (avgRating >= 3.5) {
      return `${baseClasses} bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 shadow-sm`;
    }
    // Padrão
    return `${baseClasses} bg-white border-gray-200 hover:shadow-sm`;
  };

  const renderStars = () => {
    const rating = prompt.ratingAverage || 0;
    const displayRating = hoveredStar || rating;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const isHalfFilled = i === Math.ceil(displayRating) && displayRating % 1 !== 0;
      
      stars.push(
        <button
          key={i}
          className={`transition-all duration-150 ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
          onMouseEnter={() => !isSubmitting && setHoveredStar(i)}
          onMouseLeave={() => !isSubmitting && setHoveredStar(0)}
          onClick={() => !isSubmitting && handleStarClick(i)}
          disabled={isSubmitting}
        >
          <Star
            className={`h-4 w-4 ${
              isFilled || (hoveredStar >= i)
                ? 'fill-yellow-400 text-yellow-400' 
                : isHalfFilled
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    }
    
    return stars;
  };

  return (
    <Card className={getCardClasses()}>
      <div className="flex flex-col space-y-3">
        {/* Header com ID, Contadores e Avaliação */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="text-xs text-gray-500 font-mono font-medium">
              {displayId}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              📄 {prompt.copyCount || 0} · ⭐ {prompt.ratingCount || 0}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 mb-1">
              {renderStars()}
            </div>
            <div className="text-xs font-medium text-gray-600">
              {(prompt.ratingAverage || 0).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Texto do Prompt */}
        <div className="flex-grow">
          <PromptText 
            text={prompt.text}
            searchTerm={searchTerm}
            rating={prompt.rating}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-blue-50"
              onClick={() => handleCopyText(prompt.text)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-blue-50"
              onClick={handleOpenInSuno}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <CommentSection
              comments={[]}
              hashtags={[]}
              onAddComment={(comment) => {
                onAddComment(prompt.id, comment);
                toast.success("Comentário adicionado!");
              }}
              onColorSelect={(color) => {
                setBgColor(color);
                onAddComment(prompt.id, `[color:${color}]`);
              }}
              onHashtagAdd={(hashtag) => {
                onAddComment(prompt.id, hashtag);
                toast.success("Hashtag adicionada!");
              }}
              onStructureAdd={(structureName) => {
                onAddComment(prompt.id, `[${structureName}]`);
                toast.success("Estrutura adicionada!");
              }}
              onEditPrompt={(newText) => {
                onEditPrompt?.(prompt.id, newText);
              }}
              onDeletePrompt={() => {
                onDeletePrompt?.(prompt.id);
              }}
              promptText={prompt.text}
              structures={structures}
            />
            <div className="h-5 w-5 flex items-center justify-center">
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect(prompt.id, checked as boolean)}
                className="h-4 w-4 rounded-sm border-[1.5px] border-gray-400 cursor-pointer data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Comentários e Hashtags */}
        {(hashtags.length > 0 || regularComments.length > 0) && (
          <PromptComments 
            hashtags={hashtags}
            regularComments={regularComments}
            structureRefs={[]}
            rating={prompt.rating}
          />
        )}
      </div>
    </Card>
  );
};
