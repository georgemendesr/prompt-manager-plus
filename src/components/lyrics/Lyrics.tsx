import { useEffect, useState } from "react";
import type { Lyric } from "@/types/lyric";
import { fetchLyrics, deleteLyricFromDb } from "@/services/lyric/lyricService";
import { LyricForm } from "./LyricForm";
import { LyricList } from "./LyricList";
import { toast } from "sonner";

export const Lyrics = () => {
  const [lyrics, setLyrics] = useState<Lyric[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLyrics = async () => {
    const { data, error } = await fetchLyrics();
    if (error) {
      toast.error("Erro ao carregar letras");
    } else if (data) {
      setLyrics(
        data.map((l: any) => ({
          id: l.id,
          text: l.text,
          title: l.title,
          artist: l.artist,
          createdAt: l.created_at,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLyrics();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await deleteLyricFromDb(id);
    if (error) {
      toast.error("Erro ao excluir letra");
    } else {
      setLyrics((prev) => prev.filter((l) => l.id !== id));
    }
  };

  if (loading) return <div className="text-center">Carregando...</div>;

  return (
    <div className="space-y-4">
      <LyricForm onAdded={loadLyrics} />
      <LyricList lyrics={lyrics} onDelete={handleDelete} />
    </div>
  );
};
