
import { toast } from "sonner";
import { Copy, Music2, Music4 } from "lucide-react";
import { Button } from "../ui/button";

interface ActionButtonsProps {
  text: string;
  onAddComment: (comment: string) => void;
  hasMaleVoice: boolean;
  hasFemaleVoice: boolean;
}

export const ActionButtons = ({ 
  text, 
  onAddComment, 
  hasMaleVoice, 
  hasFemaleVoice 
}: ActionButtonsProps) => {
  const handleCopy = async () => {
    const textToCopy = `português, brasil\n${text}`;
    await navigator.clipboard.writeText(textToCopy);
    toast.success("Prompt copiado!");
  };

  const handleAddMaleVoice = () => {
    if (!hasMaleVoice) {
      onAddComment("male voice");
      toast.success("Voz masculina adicionada!");
    }
  };

  const handleAddFemaleVoice = () => {
    if (!hasFemaleVoice) {
      onAddComment("female voice");
      toast.success("Voz feminina adicionada!");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-7 w-7 transition-colors hover:text-blue-600"
      >
        <Copy className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleAddMaleVoice}
        className={`h-7 w-7 transition-colors hover:text-blue-600 ${
          hasMaleVoice ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <Music2 className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleAddFemaleVoice}
        className={`h-7 w-7 transition-colors hover:text-pink-600 ${
          hasFemaleVoice ? 'text-pink-600' : 'text-gray-400'
        }`}
      >
        <Music4 className="h-3 w-3" />
      </Button>
    </div>
  );
};
