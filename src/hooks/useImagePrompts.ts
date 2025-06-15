
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchImagePrompts, addImagePrompt, updateImagePrompt, deleteImagePrompt } from '@/services/imagePromptService';
import type { ImagePrompt, ImagePromptInsert, ImagePromptUpdate } from '@/types/imagePrompt';

export const useImagePrompts = () => {
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImagePrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const prompts = await fetchImagePrompts();
      setImagePrompts(prompts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar prompts de imagem';
      setError(errorMessage);
      console.error('Erro ao carregar prompts de imagem:', err);
    } finally {
      setLoading(false);
    }
  };

  const createImagePrompt = async (prompt: ImagePromptInsert): Promise<void> => {
    try {
      const newPrompt = await addImagePrompt(prompt);
      setImagePrompts(prev => [newPrompt, ...prev]);
      toast.success('Prompt de imagem criado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar prompt de imagem';
      toast.error(errorMessage);
      throw err;
    }
  };

  const editImagePrompt = async (id: string, updates: ImagePromptUpdate): Promise<void> => {
    try {
      const updatedPrompt = await updateImagePrompt(id, updates);
      setImagePrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));
      toast.success('Prompt de imagem atualizado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar prompt de imagem';
      toast.error(errorMessage);
      throw err;
    }
  };

  const removeImagePrompt = async (id: string): Promise<void> => {
    try {
      await deleteImagePrompt(id);
      setImagePrompts(prev => prev.filter(p => p.id !== id));
      toast.success('Prompt de imagem removido com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover prompt de imagem';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    loadImagePrompts();
  }, []);

  return {
    imagePrompts,
    loading,
    error,
    loadImagePrompts,
    createImagePrompt,
    editImagePrompt,
    removeImagePrompt
  };
};
