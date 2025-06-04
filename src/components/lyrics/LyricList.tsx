import type { Lyric } from "@/types/lyric";
import { Button } from "@/components/ui/button";

interface LyricListProps {
  lyrics: Lyric[];
  onDelete: (id: string) => void;
}

export const LyricList = ({ lyrics, onDelete }: LyricListProps) => {
  if (lyrics.length === 0) {
    return <div className="text-gray-500 text-center">Nenhuma letra</div>;
  }
  return (
    <ul className="space-y-4">
      {lyrics.map((lyric) => (
        <li key={lyric.id} className="bg-gray-50 p-3 rounded-lg space-y-2">
          {lyric.title && (
            <div className="font-semibold text-gray-700">{lyric.title}</div>
          )}
          {lyric.artist && (
            <div className="text-sm text-gray-500">{lyric.artist}</div>
          )}
          <pre className="whitespace-pre-wrap text-sm">{lyric.text}</pre>
          <Button variant="ghost" onClick={() => onDelete(lyric.id)}>
            Excluir
          </Button>
        </li>
      ))}
    </ul>
  );
};
