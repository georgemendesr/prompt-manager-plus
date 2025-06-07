import { useState } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Award, Trophy, Star } from "lucide-react";
import type { Prompt, MusicStructure, Category } from "@/types/prompt";
import { RatingButtons } from "./prompt/RatingButtons";
import { CommentSection } from "./prompt/CommentSection";
import { PromptText } from "./prompt/PromptText";
import { ActionButtons } from "./prompt/ActionButtons";
import { PromptComments } from "./prompt/PromptComments";

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
  searchTerm = ""
}: PromptCardProps) => {
  const [bgColor, setBgColor] = useState(prompt.backgroundColor || "bg-blue-50/30");

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
    
    // Aplicar cores baseadas no ranking
    if (prompt.rank && prompt.rank <= 5) {
      return "bg-gradient-to-r from-amber-100 to-yellow-100 shadow-md shadow-amber-100/50 ring-2 ring-amber-300";
    }
    if (prompt.rank && prompt.rank > 5 && prompt.rank <= 8) {
      return "bg-gradient-to-r from-gray-100 to-slate-100 shadow-md shadow-gray-100/50 ring-2 ring-gray-300";
    }
    if (prompt.rank && prompt.rank > 8 && prompt.rank <= 10) {
      return "bg-gradient-to-r from-orange-50 to-amber-50 shadow-md shadow-orange-100/50 ring-2 ring-orange-200";
    }
    if (prompt.rating >= 10) {
      return "bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md shadow-purple-100/50 ring-1 ring-purple-200";
    }
    
    // Estilo padrão para outros prompts - usando cinza bem claro, próximo do branco
    return "bg-gray-50/70 backdrop-blur-sm";
  };

  // Determina o ícone de ranking
  const getRankIcon = () => {
    if (prompt.rank && prompt.rank <= 5) return <Trophy className="h-4 w-4 text-amber-500" />;
    if (prompt.rank && prompt.rank > 5 && prompt.rank <= 8) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (prompt.rank && prompt.rank > 8 && prompt.rank <= 10) return <Trophy className="h-4 w-4 text-orange-400" />;
    if (prompt.rating >= 10) return <Star className="h-4 w-4 text-purple-400" />;
    return null;
  };

  // Ajusta a classe CSS com base na pontuação
  const getScoreClass = (score: number) => {
    if (score > 5) return 'shadow-lg shadow-green-100';
    if (score > 0) return 'shadow-md shadow-blue-50';
    if (score < 0) return 'shadow-md shadow-red-50';
    return 'border-b';
  };

  const rankingClass = getRankingClass();
  const rankIcon = getRankIcon();
  const scoreClass = getScoreClass(prompt.rating);

  const cardClasses = `relative sm:text-xs text-xs p-2 ${rankingClass} ${scoreClass}`;

  return (
    <Card className={cardClasses}>
      <div className="flex flex-col space-y-1">
        <div className="flex items-start gap-1">
          {rankIcon && (
            <div className="mt-1 mr-1">{rankIcon}</div>
          )}
          <div className="flex-grow">
            <PromptText 
              text={prompt.text}
              searchTerm={searchTerm}
              rating={prompt.rating}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <ActionButtons
            text={prompt.text}
          />
          <div className="flex items-center gap-1">
            <RatingButtons 
              rating={prompt.rating}
              onRate={(increment) => onRate(prompt.id, increment)}
              backgroundColor={bgColor}
            />
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
