
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, Hash, Palette } from "lucide-react";
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

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment);
      setComment("");
      setShowCommentInput(false);
    }
  };

  const handleStructureSelect = (structure: MusicStructure) => {
    if (onStructureAdd) {
      onStructureAdd(structure.name);
      setShowCommentInput(false);
    }
  };

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
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="hover:text-purple-600 transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>

      {showCommentInput && (
        <div className="space-y-4 mt-4">
          {onEditPrompt && (
            <>
              <div className="text-sm font-medium text-gray-700 mb-2">Editar prompt</div>
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[80px] resize-none mb-4"
              />
            </>
          )}

          <div className="flex items-center justify-center gap-2 pb-2 border-b">
            <HashtagInput 
              onHashtagAdd={onHashtagAdd}
              existingHashtags={hashtags}
            />
            <ColorPicker onColorSelect={onColorSelect} />
            {structures.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Adicionar Estrutura
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    {structures.map((structure) => (
                      <Button
                        key={structure.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleStructureSelect(structure)}
                      >
                        {structure.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
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
