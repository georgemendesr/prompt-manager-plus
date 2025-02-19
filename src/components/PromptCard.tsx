
import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import type { Prompt, MusicStructure, Category } from "@/types/prompt";
import { RatingButtons } from "./prompt/RatingButtons";
import { CommentSection } from "./prompt/CommentSection";
import { HashtagList } from "./prompt/HashtagList";

interface PromptCardProps {
  prompt: Prompt;
  onRate: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onEditPrompt?: (id: string, newText: string) => void;
  onSelect: (id: string, selected: boolean) => void;
  selected: boolean;
  structures?: MusicStructure[];
  categories?: Category[];
}

export const PromptCard = ({ 
  prompt, 
  onRate, 
  onAddComment, 
  onEditPrompt,
  onSelect,
  selected,
  structures = [],
  categories = []
}: PromptCardProps) => {
  const [bgColor, setBgColor] = useState(prompt.backgroundColor || "bg-white/80");

  const hashtags = prompt.comments.filter(comment => comment.startsWith('#'));
  const regularComments = prompt.comments.filter(comment => !comment.startsWith('#') && !comment.startsWith('['));
  const structureRefs = prompt.comments.filter(comment => comment.startsWith('['));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.text);
    toast.success("Prompt copiado!");
  };

  // Estilização aprimorada para prompts favoritos
  const cardClasses = `${bgColor} backdrop-blur-sm transition-all duration-300 relative sm:text-base text-sm ${
    prompt.rating > 0 
      ? 'ring-2 ring-yellow-400 shadow-lg transform hover:-translate-y-1 hover:shadow-xl' 
      : 'hover:shadow-lg'
  }`;

  const textClasses = `text-gray-800 break-words ${
    prompt.rating > 0 
      ? 'font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent' 
      : ''
  }`;

  return (
    <Card 
      className={cardClasses}
      style={prompt.rating > 0 ? {
        background: 'linear-gradient(135deg, rgba(255,246,183,0.4) 0%, rgba(255,250,215,0.4) 100%)'
      } : undefined}
    >
      <div className="flex flex-col p-4 space-y-3">
        {prompt.rating > 0 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
            <span className="text-white text-xs font-bold">★</span>
          </div>
        )}
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow">
            <p className={textClasses}>{prompt.text}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={`transition-colors ${
                prompt.rating > 0 
                  ? 'hover:text-yellow-600 text-yellow-500' 
                  : 'hover:text-blue-600'
              }`}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <RatingButtons 
              rating={prompt.rating}
              onRate={(increment) => onRate(prompt.id, increment)}
              backgroundColor={bgColor}
            />
          </div>

          <div className="flex items-center gap-4">
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
              onEditPrompt={onEditPrompt ? (newText) => onEditPrompt(prompt.id, newText) : undefined}
              promptText={prompt.text}
              structures={structures}
            />
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(prompt.id, checked as boolean)}
            />
          </div>
        </div>

        {(hashtags.length > 0 || regularComments.length > 0 || structureRefs.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <HashtagList hashtags={hashtags} />
            {structureRefs.filter(ref => !ref.startsWith('[color:')).map((ref, index) => (
              <div
                key={`struct-${index}`}
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  prompt.rating > 0 
                    ? 'text-yellow-700 bg-yellow-50 border border-yellow-200' 
                    : 'text-blue-700 bg-blue-50'
                }`}
              >
                {ref}
              </div>
            ))}
            {regularComments.map((comment, index) => (
              <div
                key={`comment-${index}`}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  prompt.rating > 0 
                    ? 'text-yellow-700 bg-yellow-50 border border-yellow-200' 
                    : 'text-gray-600 bg-soft-gray'
                }`}
              >
                {comment}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
