import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Lyric } from "@/types/lyric";
import * as lyricService from "@/services/lyric/lyricService";

export const useLyrics = () => {
  const [lyrics, setLyrics] = useState<Lyric[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadLyrics = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await lyricService.fetchLyrics();
      if (error) throw error;
      setLyrics(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar letras:', error);
      setLoadError(error?.message || 'Erro de conexão');
      setLyrics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLyrics();
  }, []);

  const addLyric = async (lyric: Lyric) => {
    try {
      const { data, error } = await lyricService.addLyric(lyric);
      if (error) throw error;
      if (data) setLyrics(prev => [data, ...prev]);
      toast.success('Letra adicionada!');
    } catch (error: any) {
      console.error('Erro ao adicionar letra:', error);
      toast.error('Erro ao adicionar letra');
    }
  };

  const editLyric = async (id: string, lyric: Lyric) => {
    try {
      const { error } = await lyricService.updateLyric(id, lyric);
      if (error) throw error;
      setLyrics(prev => prev.map(l => l.id === id ? { ...l, ...lyric } : l));
      toast.success('Letra atualizada!');
    } catch (error: any) {
      console.error('Erro ao atualizar letra:', error);
      toast.error('Erro ao atualizar letra');
      loadLyrics();
    }
  };

  const deleteLyric = async (id: string) => {
    try {
      const { error } = await lyricService.deleteLyric(id);
      if (error) throw error;
      setLyrics(prev => prev.filter(l => l.id !== id));
      toast.success('Letra removida!');
    } catch (error: any) {
      console.error('Erro ao remover letra:', error);
      toast.error('Erro ao remover letra');
    }
  };

  return { lyrics, loading, loadError, loadLyrics, addLyric, editLyric, deleteLyric };
};
