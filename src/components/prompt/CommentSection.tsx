
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, Hash, Palette, X } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { HashtagInput } from "./HashtagInput";
import type { MusicStructure } from "@/types/prompt";

interface CommentSectionProps {
  comments: string[];
  hashtags: string[];
  onAddComment: (comment: string) => void;
  onColorSelect: (color: string) => void;
  onHashtagAdd: (hashtag: string) => void;
  onStructureAdd?: (structureName: string) => void;
  onEditPrompt?: (newText: string) => void;
  promptText?: string;
  structures?: MusicStructure[];
}

export const CommentSection = ({ 
  comments, 
  hashtags, 
  onAddComment, 
  onColorSelect,
  onHashtagAdd,
  onStructureAdd,
  onEditPrompt,
  promptText,
  structures = []
}: CommentSectionProps) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [editedText, setEditedText] = useState(promptText || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setShowCommentInput(!showCommentInput);
    if (onEditPrompt) {
      setIsEditing(true);
      setEditedText(promptText || "");
    }
  };

  const handleSave = () => {
    if (isEditing && editedText.trim() && onEditPrompt) {
      onEditPrompt(editedText);
      setIsEditing(false);
    }
    if (comment.trim()) {
      onAddComment(comment);
      setComment("");
    }
    setShowCommentInput(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="hover:text-purple-600 transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>

      {showCommentInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[400px] max-h-[90vh] overflow-y-auto relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowCommentInput(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {onEditPrompt && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Editar prompt</div>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[100px] resize-none mb-4"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <HashtagInput 
                  onHashtagAdd={onHashtagAdd}
                  existingHashtags={hashtags}
                />
                <ColorPicker onColorSelect={onColorSelect} />
              </div>
              {structures.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      Estrutura
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      {structures.map((structure) => (
                        <Button
                          key={structure.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            onStructureAdd?.(structure.name);
                            setShowCommentInput(false);
                          }}
                        >
                          {structure.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="mt-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCommentInput(false);
                  setIsEditing(false);
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                Salvar
              </Button>
            </div>
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
    </div>
  );
};
