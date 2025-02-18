
import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { Prompt, MusicStructure } from "@/types/prompt";
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
}

export const PromptCard = ({ 
  prompt, 
  onRate, 
  onAddComment, 
  onEditPrompt,
  onSelect, 
  selected,
  structures = []
}: PromptCardProps) => {
  const [bgColor, setBgColor] = useState("bg-white/80");

  const hashtags = prompt.comments.filter(comment => comment.startsWith('#'));
  const regularComments = prompt.comments.filter(comment => !comment.startsWith('#') && !comment.startsWith('['));
  const structureRefs = prompt.comments.filter(comment => comment.startsWith('['));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.text);
    toast.success("Prompt copiado!");
  };

  return (
    <Card className={`p-4 space-y-2 ${bgColor} backdrop-blur-sm hover:shadow-lg transition-all duration-300 relative sm:text-base text-sm`}>
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="hover:text-blue-600 transition-colors shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <div className="flex-grow">
          <p className="text-gray-800 break-words">{prompt.text}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            <HashtagList hashtags={hashtags} />
            {(regularComments.length > 0 || structureRefs.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                {structureRefs.map((ref, index) => (
                  <div
                    key={`struct-${index}`}
                    className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full"
                  >
                    {ref}
                  </div>
                ))}
                {regularComments.map((comment, index) => (
                  <div
                    key={`comment-${index}`}
                    className="text-xs text-gray-600 bg-soft-gray px-2 py-0.5 rounded-full"
                  >
                    {comment}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <RatingButtons 
            rating={prompt.rating}
            onRate={(increment) => onRate(prompt.id, increment)}
          />
          <CommentSection
            comments={[]}
            hashtags={hashtags}
            onAddComment={(comment) => {
              onAddComment(prompt.id, comment);
              toast.success("Comentário adicionado!");
            }}
            onColorSelect={setBgColor}
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
        </div>
      </div>
    </Card>
  );
};
