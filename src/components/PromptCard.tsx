
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Music2, Music4 } from "lucide-react";
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
  const [bgColor, setBgColor] = useState(prompt.backgroundColor || "bg-blue-50/30");

  const hashtags = prompt.comments.filter(comment => comment.startsWith('#'));
  const regularComments = prompt.comments.filter(comment => !comment.startsWith('#') && !comment.startsWith('['));
  const structureRefs = prompt.comments.filter(comment => comment.startsWith('['));

  const handleCopy = async () => {
    const textToCopy = `português, brasil\n${prompt.text}`;
    await navigator.clipboard.writeText(textToCopy);
    toast.success("Prompt copiado!");
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return <span key={i} className="bg-yellow-200 px-0.5">{part}</span>;
      }
      return part;
    });
  };

  const cardClasses = `${bgColor} backdrop-blur-sm relative sm:text-xs text-xs p-2 ${
    prompt.rating > 0 ? 'ring-1 ring-yellow-400' : 'border-b'
  }`;

  const textClasses = `text-gray-800 break-words line-clamp-2 ${
    prompt.rating > 0 
      ? 'font-medium bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent' 
      : ''
  }`;

  const hasMaleVoice = regularComments.some(comment => 
    comment.toLowerCase().includes('male voice')
  );
  
  const hasFemaleVoice = regularComments.some(comment => 
    comment.toLowerCase().includes('female voice')
  );

  return (
    <Card className={cardClasses}>
      <div className="flex flex-col space-y-1">
        <div className="flex items-start gap-1">
          <div className="flex-grow">
            <p className={textClasses}>
              {hasMaleVoice && (
                <Music2 className="inline-block w-3 h-3 mr-1 text-blue-600" />
              )}
              {hasFemaleVoice && (
                <Music4 className="inline-block w-3 h-3 mr-1 text-pink-600" />
              )}
              {highlightSearchTerm(prompt.text, searchTerm)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-5 w-5 -ml-1 transition-colors hover:text-blue-600"
          >
            <Copy className="h-3 w-3" />
          </Button>

          <div className="flex items-center gap-1">
            {prompt.rating > 0 && (
              <div className="w-3.5 h-3.5 bg-yellow-400 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">★</span>
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
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(prompt.id, checked as boolean)}
              className="h-3.5 w-3.5"
            />
          </div>
        </div>

        {(hashtags.length > 0 || regularComments.length > 0 || structureRefs.length > 0) && (
          <div className="flex flex-wrap items-center gap-0.5 pt-1">
            <HashtagList hashtags={hashtags} />
            {structureRefs.filter(ref => !ref.startsWith('[color:')).map((ref, index) => (
              <div
                key={`struct-${index}`}
                className={`text-[10px] font-medium px-1 py-0.5 ${
                  prompt.rating > 0 
                    ? 'text-yellow-700 bg-yellow-50' 
                    : 'text-blue-700 bg-blue-50'
                }`}
              >
                {ref}
              </div>
            ))}
            {regularComments.map((comment, index) => (
              <div
                key={`comment-${index}`}
                className={`text-[10px] px-1 py-0.5 ${
                  prompt.rating > 0 
                    ? 'text-yellow-700 bg-yellow-50' 
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
