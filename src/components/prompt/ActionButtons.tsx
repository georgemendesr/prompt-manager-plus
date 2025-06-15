
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  text: string;
  onCopyText?: (text: string) => Promise<void>;
}

export const ActionButtons = ({ text, onCopyText }: ActionButtonsProps) => {
  const handleCopy = async () => {
    if (onCopyText) {
      await onCopyText(text);
    } else {
      // Fallback para o comportamento antigo
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('Erro ao copiar:', error);
      }
    }
  };

  const handleOpenInSuno = () => {
    const sunoUrl = `https://suno.com/create?prompt=${encodeURIComponent(text)}`;
    window.open(sunoUrl, '_blank');
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleCopy}
        title="Copiar prompt"
      >
        <Copy className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleOpenInSuno}
        title="Abrir no Suno"
      >
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
};
