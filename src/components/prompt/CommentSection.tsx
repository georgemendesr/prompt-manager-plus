
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface CommentSectionProps {
  comments: string[];
  onAddComment: (comment: string) => void;
}

export const CommentSection = ({ comments, onAddComment }: CommentSectionProps) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment);
      setComment("");
      setShowCommentInput(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowCommentInput(!showCommentInput)}
        className="hover:text-purple-600 transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>

      {showCommentInput && (
        <div className="space-y-2 mt-4">
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

      {comments.length > 0 && (
        <div className="mt-4 space-y-2">
          {comments.map((comment, index) => (
            <div
              key={index}
              className="text-sm text-gray-600 bg-gray-50/80 p-2 rounded-md"
            >
              {comment}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
