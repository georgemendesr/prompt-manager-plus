
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
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
        'voice:female'
      ];
      return !systemTags.some(tag => 
        lowerComment.includes(tag.toLowerCase())
      );
    });
  };

  const hashtags = filterComments(
    prompt.comments.filter(comment => comment.startsWith('#'))
  );

  const regularComments = filterComments(
    prompt.comments.filter(comment => !comment.startsWith('#'))
  );

  // Ajusta a classe CSS com base na pontuação
  const getScoreClass = (score: number) => {
    if (score > 5) return 'ring-2 ring-green-400 shadow-lg shadow-green-100 bg-gradient-to-r from-green-50 to-emerald-50';
    if (score > 0) return 'ring-1 ring-blue-300 shadow-md shadow-blue-50 bg-gradient-to-r from-blue-50 to-sky-50';
    if (score < 0) return 'ring-1 ring-red-300 shadow-md shadow-red-50 bg-gradient-to-r from-red-50 to-pink-50';
    return 'border-b';
  };

  const cardClasses = `${bgColor} backdrop-blur-sm relative sm:text-xs text-xs p-2 ${getScoreClass(prompt.rating)}`;

  return (
    <Card className={cardClasses}>
      <div className="flex flex-col space-y-1">
        <div className="flex items-start gap-1">
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
            onAddComment={(comment) => onAddComment(prompt.id, comment)}
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
