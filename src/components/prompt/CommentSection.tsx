
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, Trash } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { HashtagInput } from "./HashtagInput";
import type { MusicStructure } from "@/types/prompt";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommentSectionProps {
  comments: string[];
  hashtags: string[];
  onAddComment: (comment: string) => void;
  onColorSelect: (color: string) => void;
  onHashtagAdd: (hashtag: string) => void;
  onStructureAdd?: (structureName: string) => void;
  onEditPrompt?: (newText: string) => void;
  onDeletePrompt?: () => void;
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
  onDeletePrompt,
  promptText,
  structures = []
}: CommentSectionProps) => {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [editedText, setEditedText] = useState(promptText || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (isEditing && editedText.trim() && onEditPrompt) {
      onEditPrompt(editedText);
      setIsEditing(false);
    }
    if (comment.trim()) {
      onAddComment(comment);
      setComment("");
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setOpen(true);
          if (onEditPrompt) {
            setIsEditing(true);
            setEditedText(promptText || "");
          }
        }}
        className="hover:text-purple-600 transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Adicionar Comentário</span>
              {onDeletePrompt && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-red-600 transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Prompt</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este prompt? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onDeletePrompt();
                          setOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DialogTitle>
          </DialogHeader>

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
                          setOpen(false);
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setIsEditing(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
