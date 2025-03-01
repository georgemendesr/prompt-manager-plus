
import { toast } from "sonner";
import { Copy, Music2, Music4 } from "lucide-react";
import { Button } from "../ui/button";

interface ActionButtonsProps {
  text: string;
  onAddComment: (comment: string) => void;
}

export const ActionButtons = ({ 
  text, 
  onAddComment
}: ActionButtonsProps) => {
  const handleCopy = async () => {
    try {
      // Just copy the text without adding any tags
      await navigator.clipboard.writeText(text);
      toast.success("Prompt copiado!");
    } catch (error) {
      toast.error("Erro ao copiar prompt");
    }
  };

  const handleAddMaleVoice = async () => {
    try {
      await navigator.clipboard.writeText(`male voice\nportuguês, brasil\n${text}`);
      onAddComment("voice:male");
      onAddComment("português, brasil");
      toast.success("Prompt copiado com voz masculina!");
    } catch (error) {
      toast.error("Erro ao copiar prompt");
    }
  };

  const handleAddFemaleVoice = async () => {
    try {
      await navigator.clipboard.writeText(`female voice\nportuguês, brasil\n${text}`);
      onAddComment("voice:female");
      onAddComment("português, brasil");
      toast.success("Prompt copiado com voz feminina!");
    } catch (error) {
      toast.error("Erro ao copiar prompt");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-7 w-7 transition-colors hover:text-blue-600"
        title="Copiar"
      >
        <Copy className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleAddMaleVoice}
        className="h-7 w-7 transition-colors hover:text-blue-600"
        title="Voz masculina"
      >
        <Music2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleAddFemaleVoice}
        className="h-7 w-7 transition-colors hover:text-pink-600"
        title="Voz feminina"
      >
        <Music4 className="h-3 w-3" />
      </Button>
    </div>
  );
};
