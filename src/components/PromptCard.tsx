
import { useState } from "react";
import { toast } from "sonner";
import { Copy, MessageSquare, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import type { Prompt } from "@/types/prompt";

interface PromptCardProps {
  prompt: Prompt;
  onRate: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onSelect: (id: string, selected: boolean) => void;
  selected: boolean;
}

export const PromptCard = ({ prompt, onRate, onAddComment, onSelect, selected }: PromptCardProps) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");

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

  return (
    <Card className="p-4 space-y-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <p className="text-gray-800 flex-grow">{prompt.text}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="hover:text-blue-600 transition-colors"
          >
            <Copy className="h-4 w-4" />
          </Button>
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
          <Checkbox 
            checked={selected}
            onCheckedChange={(checked) => onSelect(prompt.id, checked as boolean)}
          />
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
              className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md"
            >
              {comment}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
