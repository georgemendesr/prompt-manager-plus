
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Award, Trophy, Star } from "lucide-react";
import type { Prompt, MusicStructure, Category } from "@/types/prompt";
import { CommentSection } from "./prompt/CommentSection";
import { PromptText } from "./prompt/PromptText";
import { ActionButtons } from "./prompt/ActionButtons";
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

  // Determina a classe de estilo com base na classificação e pontuação
  const getRankingClass = () => {
    // Se o prompt já tem uma cor de fundo definida, mantemos ela
    if (prompt.backgroundColor && prompt.backgroundColor !== "bg-blue-50/30") {
      return `${prompt.backgroundColor} backdrop-blur-sm`;
    }
    
    // Aplicar cores baseadas no ranking por estrelas
    if (prompt.ratingAverage && prompt.ratingAverage >= 4.5) {
      return "bg-gradient-to-r from-amber-100 to-yellow-100 shadow-md shadow-amber-100/50 ring-2 ring-amber-300";
    }
    if (prompt.ratingAverage && prompt.ratingAverage >= 4.0) {
      return "bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md shadow-blue-100/50 ring-2 ring-blue-200";
    }
    if (prompt.ratingAverage && prompt.ratingAverage >= 3.5) {
      return "bg-gradient-to-r from-green-50 to-emerald-50 shadow-md shadow-green-100/50 ring-2 ring-green-200";
    }
    
    // Estilo padrão para outros prompts - usando cinza bem claro, próximo do branco
    return "bg-gray-50/70 backdrop-blur-sm";
  };

  // Determina o ícone de ranking baseado na avaliação por estrelas
  const getRankIcon = () => {
    if (prompt.ratingAverage && prompt.ratingAverage >= 4.5) return <Trophy className="h-4 w-4 text-amber-500" />;
    if (prompt.ratingAverage && prompt.ratingAverage >= 4.0) return <Star className="h-4 w-4 text-blue-500" />;
    if (prompt.ratingAverage && prompt.ratingAverage >= 3.5) return <Award className="h-4 w-4 text-green-500" />;
    return null;
  };

  const rankingClass = getRankingClass();
  const rankIcon = getRankIcon();

  const cardClasses = `relative sm:text-xs text-xs p-3 ${rankingClass} border rounded-lg`;

  return (
    <Card className={cardClasses}>
      <div className="flex flex-col space-y-3">
        {/* Cabeçalho com ID e Avaliação por Estrelas */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {rankIcon}
            <span className="text-xs font-mono text-blue-600 font-medium">
              {prompt.simpleId || 'ID-000'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>📄 {prompt.copyCount || 0}</span>
            <span>•</span>
            <StarRating
              promptId={prompt.id}
              currentRating={prompt.ratingAverage || 0}
              ratingCount={prompt.ratingCount || 0}
              copyCount={prompt.copyCount || 0}
              onRatingUpdate={onPromptUpdate || (() => {})}
              compact={true}
            />
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

        {/* Ações e Seleção */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <ActionButtons
            text={prompt.text}
            onCopyText={handleCopyText}
          />
          
          <div className="flex items-center gap-2">
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
