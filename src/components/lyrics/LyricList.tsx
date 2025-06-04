import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Check, X, Pencil, Trash } from "lucide-react";
import type { Lyric } from "@/types/lyric";

interface LyricListProps {
  lyrics: Lyric[];
  loadError?: string | null;
  onAddLyric: (lyric: Lyric) => void;
  onEditLyric: (id: string, lyric: Lyric) => void;
  onDeleteLyric: (id: string) => void;
}

export const LyricList = ({
  lyrics,
  loadError,
  onAddLyric,
  onEditLyric,
  onDeleteLyric
}: LyricListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLyric, setNewLyric] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edited, setEdited] = useState({ title: "", content: "" });

  const handleAdd = () => {
    if (!newLyric.title.trim()) return;
    const lyric: Lyric = {
      id: crypto.randomUUID(),
      title: newLyric.title.trim(),
      content: newLyric.content.trim(),
      created_at: new Date().toISOString()
    };
    onAddLyric(lyric);
    setNewLyric({ title: "", content: "" });
    setIsAdding(false);
  };

  const handleEditSave = (id: string) => {
    onEditLyric(id, { ...edited, id, created_at: new Date().toISOString() });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Letras de Músicas</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>Nova Letra</Button>
      </div>

      {loadError && (
        <div className="text-red-500 text-sm">{loadError}</div>
      )}

      {isAdding && (
        <Card className="p-4 space-y-4">
          <Input
            placeholder="Título"
            value={newLyric.title}
            onChange={(e) => setNewLyric(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="Letra"
            value={newLyric.content}
            onChange={(e) => setNewLyric(prev => ({ ...prev, content: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleAdd}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {lyrics.map(lyric => (
          <Card key={lyric.id} className="p-4 space-y-2">
            {editingId === lyric.id ? (
              <div className="space-y-2">
                <Input
                  value={edited.title}
                  onChange={(e) => setEdited(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  value={edited.content}
                  onChange={(e) => setEdited(prev => ({ ...prev, content: e.target.value }))}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={() => handleEditSave(lyric.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{lyric.title}</h3>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => { setEditingId(lyric.id); setEdited({ title: lyric.title, content: lyric.content }); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => onDeleteLyric(lyric.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{lyric.content}</pre>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
