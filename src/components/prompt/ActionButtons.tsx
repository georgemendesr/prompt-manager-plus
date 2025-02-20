
import { toast } from "sonner";
import { Copy } from "lucide-react";
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
    const textToCopy = `português, brasil\n${text}`;
    await navigator.clipboard.writeText(textToCopy);
    toast.success("Prompt copiado!");
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
    </div>
  );
};
