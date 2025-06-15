import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";
import { useState } from "react";
import type { TextPrompt } from "@/types/textPrompt";

interface TextPromptDisplayProps {
  prompt: TextPrompt;
}

export const TextPromptDisplay = ({ prompt }: TextPromptDisplayProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar texto:', err);
    }
  };

  return (
    <div className="space-y-6">
      {prompt.title && (
        <h3 className="text-xl font-semibold mb-4">{prompt.title}</h3>
      )}

      {prompt.blocks.map((block, index) => (
        <section key={index} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">{block.label}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-8"
              onClick={() => copyToClipboard(block.text, index)}
            >
              {copiedIndex === index ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-xs">Copiado</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-4 w-4" />
                  <span className="text-xs">Copiar</span>
                </>
              )}
            </Button>
          </div>
          <pre className="bg-muted rounded p-4 overflow-x-auto whitespace-pre-wrap text-sm">
            {block.text}
          </pre>
        </section>
      ))}
    </div>
  );
}; 