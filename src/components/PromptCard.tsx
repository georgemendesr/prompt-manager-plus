
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
import { StarRating } from "./rating/StarRating";
import { incrementCopyCount } from "@/services/rating/ratingService";

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

  // Gerar ID único no formato CAT-SUB-### 
  const generatePromptId = () => {
    const category = categories.find(cat => cat.id === prompt.category || cat.name === prompt.category);
    const catCode = category?.name.substring(0, 3).toUpperCase() || 'GEN';
    const promptNumber = String(prompt.rating + 1).padStart(3, '0');
    return `${catCode}-${promptNumber}`;
  };

  const promptId = generatePromptId();

  // Determinar destaque visual para Top 10
  const getCardClasses = () => {
    const baseClasses = "relative sm:text-xs text-xs p-2";
    const avgRating = prompt.ratingAverage || 0;
    
    // Top 3 - Destaque dourado
    if (avgRating >= 4.5) {
      return `${baseClasses} bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-md`;
    }
    // Top 4-10 - Destaque azul
    if (avgRating >= 4.0) {
      return `${baseClasses} bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md`;
    }
    // Padrão
    return `${baseClasses} bg-gray-50/70 backdrop-blur-sm border-gray-100`;
  };

  const renderStars = () => {
    const rating = prompt.ratingAverage || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rating);
      const isHalfFilled = i === Math.ceil(rating) && rating % 1 !== 0;
      
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 cursor-pointer transition-colors ${
            isFilled 
              ? 'fill-yellow-400 text-yellow-400' 
              : isHalfFilled
              ? 'fill-yellow-200 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => onRate(prompt.id, true)} // Simplificado para sempre incrementar
        />
      );
    }
    
    return stars;
  };

  return (
    <Card className={getCardClasses()}>
      <div className="flex flex-col space-y-2">
        {/* Header com ID e Avaliação */}
        <div className="flex items-start justify-between">
          <div className="text-xs text-gray-500 font-mono">
            {promptId} · 📄 {prompt.copyCount || 0} · ★ {(prompt.ratingAverage || 0).toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="text-xs text-gray-600 ml-1">
              {(prompt.ratingAverage || 0).toFixed(1)}
            </span>
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
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleCopyText(prompt.text)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleOpenInSuno}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <CommentSection
              comments={[]}
              hashtags={hashtags}
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
