import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ImagePrompt } from "@/types/imagePrompt";

interface ImageDisplayProps {
  prompt: ImagePrompt;
}

export const ImageDisplay = ({ prompt }: ImageDisplayProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {prompt.type === 'photo' && <Badge>Foto</Badge>}
        {prompt.type === 'video' && <Badge>Vídeo</Badge>}
        {prompt.type === 'design' && <Badge>Design</Badge>}
        {prompt.ai_hint && <Badge variant="secondary">{prompt.ai_hint}</Badge>}
      </div>

      {prompt.blocks.map((block, index) => (
        <section key={index} className="mb-4">
          <h4 className="font-medium">{block.label}</h4>
          <pre className="bg-muted rounded p-4 whitespace-pre-wrap">
            {block.text}
          </pre>
        </section>
      ))}
    </Card>
  );
}; 