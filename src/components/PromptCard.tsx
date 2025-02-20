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
  const [bgColor, setBgColor] = useState(prompt.backgroundColor || "bg-white/80");

  const hashtags = prompt.comments.filter(comment => comment.startsWith('#'));
  const regularComments = prompt.comments.filter(comment => !comment.startsWith('#') && !comment.startsWith('['));
  const structureRefs = prompt.comments.filter(comment => comment.startsWith('['));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.text);
    toast.success("Prompt copiado!");
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return <span key={i} className="bg-yellow-200 rounded px-0.5">{part}</span>;
      }
      return part;
    });
  };

  const cardClasses = `${bgColor} backdrop-blur-sm transition-all duration-300 relative sm:text-base text-sm p-6 ${
    prompt.rating > 0 
      ? 'ring-2 ring-yellow-400 shadow-lg transform hover:-translate-y-1 hover:shadow-xl' 
      : 'hover:shadow-lg'
  }`;

  const textClasses = `text-gray-800 break-words text-lg ${
    prompt.rating > 0 
      ? 'font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent' 
      : ''
  }`;

  return (
    <Card className={cardClasses}>
      <div className="flex flex-col space-y-4">
        {prompt.rating > 0 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-lg">
            <span className="text-white text-xs font-bold">★</span>
          </div>
        )}
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow">
            <p className={textClasses}>
              {highlightSearchTerm(prompt.text, searchTerm)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
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
              onEditPrompt={(newText) => {
                onEditPrompt?.(prompt.id, newText);
                toast.success("Prompt atualizado!");
              }}
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
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <HashtagList hashtags={hashtags} />
            {structureRefs.filter(ref => !ref.startsWith('[color:')).map((ref, index) => (
              <div
                key={`struct-${index}`}
                className={`text-xs font-medium px-3 py-1 rounded-full ${
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
                className={`text-xs px-3 py-1 rounded-full ${
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
