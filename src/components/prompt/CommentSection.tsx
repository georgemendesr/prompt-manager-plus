
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Hash, Palette } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { HashtagInput } from "./HashtagInput";

interface CommentSectionProps {
  comments: string[];
  hashtags: string[];
  onAddComment: (comment: string) => void;
  onColorSelect: (color: string) => void;
  onHashtagAdd: (hashtag: string) => void;
}

export const CommentSection = ({ 
  comments, 
  hashtags, 
  onAddComment, 
  onColorSelect,
  onHashtagAdd 
}: CommentSectionProps) => {
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
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <HashtagInput 
              onHashtagAdd={onHashtagAdd}
              existingHashtags={hashtags}
            />
            <ColorPicker onColorSelect={onColorSelect} />
            <span className="text-sm text-gray-500">Personalize seu prompt</span>
          </div>

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
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {comments.map((comment, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 bg-soft-gray px-2 py-0.5 rounded-full"
            >
              {comment}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
