
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

  const cardClasses = `${bgColor} backdrop-blur-sm relative sm:text-xs text-xs p-2 ${
    prompt.rating > 0 
      ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-100 bg-gradient-to-r from-yellow-50 to-amber-50' 
      : 'border-b'
  }`;

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
            {prompt.rating > 0 && (
              <div className="w-4 h-4 bg-yellow-400 flex items-center justify-center rounded-full">
                <span className="text-white text-[10px] font-bold">★</span>
              </div>
            )}
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
                toast.success("Prompt atualizado!");
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
