
import { useState } from "react";
import { toast } from "sonner";
import { Copy, MessageSquare, Plus, Minus, Palette, Hash } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";
import type { Prompt } from "@/types/prompt";

interface PromptCardProps {
  prompt: Prompt;
  onRate: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onSelect: (id: string, selected: boolean) => void;
  selected: boolean;
}

const COLORS = [
  "bg-soft-green",
  "bg-soft-yellow",
  "bg-soft-orange",
  "bg-soft-purple",
  "bg-soft-pink",
  "bg-soft-peach",
  "bg-soft-blue",
  "bg-soft-gray",
];

export const PromptCard = ({ prompt, onRate, onAddComment, onSelect, selected }: PromptCardProps) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [bgColor, setBgColor] = useState("bg-white/80");
  const [hashtag, setHashtag] = useState("");
  const [hashtags, setHashtags] = useState<string[]>(prompt.hashtags || []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.text);
    toast.success("Prompt copiado!");
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onAddComment(prompt.id, comment);
      setComment("");
      setShowCommentInput(false);
      toast.success("Comentário adicionado!");
    }
  };

  const handleHashtagSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hashtag.trim()) {
      const newHashtag = hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`;
      if (!hashtags.includes(newHashtag)) {
        setHashtags([...hashtags, newHashtag]);
        setHashtag("");
        toast.success("Hashtag adicionada!");
      }
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card className={`p-4 space-y-4 ${bgColor} backdrop-blur-sm hover:shadow-lg transition-all duration-300 relative sm:text-base text-sm`}>
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
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {hashtags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => removeHashtag(tag)}
                  className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-purple-600 transition-colors"
              >
                <Hash className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <Input
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                onKeyDown={handleHashtagSubmit}
                placeholder="Digite uma hashtag e pressione Enter"
                className="w-full"
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-purple-600 transition-colors"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-12 h-12 rounded-lg ${color} hover:ring-2 ring-offset-2 ring-purple-500 transition-all`}
                    onClick={() => setBgColor(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRate(prompt.id, true)}
            className="hover:text-green-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="min-w-[2rem] text-center">{prompt.rating}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRate(prompt.id, false)}
            className="hover:text-red-600 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="hover:text-purple-600 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showCommentInput && (
        <div className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentInput(false)}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCommentSubmit}>
              Salvar
            </Button>
          </div>
        </div>
      )}

      {prompt.comments.length > 0 && (
        <div className="mt-4 space-y-2">
          {prompt.comments.map((comment, index) => (
            <div
              key={index}
              className="text-sm text-gray-600 bg-gray-50/80 p-2 rounded-md"
            >
              {comment}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
