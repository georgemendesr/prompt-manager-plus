
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchTextPrompts, addTextPrompt, updateTextPrompt, deleteTextPrompt } from '@/services/textPromptService';
import type { TextPrompt, TextPromptInsert, TextPromptUpdate } from '@/types/textPrompt';

export const useTextPrompts = () => {
  const [textPrompts, setTextPrompts] = useState<TextPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTextPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const prompts = await fetchTextPrompts();
      setTextPrompts(prompts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar prompts de texto';
      setError(errorMessage);
      console.error('Erro ao carregar prompts de texto:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTextPrompt = async (prompt: TextPromptInsert): Promise<void> => {
    try {
      const newPrompt = await addTextPrompt(prompt);
      setTextPrompts(prev => [newPrompt, ...prev]);
      toast.success('Prompt de texto criado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar prompt de texto';
      toast.error(errorMessage);
      throw err;
    }
  };

  const editTextPrompt = async (id: string, updates: TextPromptUpdate): Promise<void> => {
    try {
      const updatedPrompt = await updateTextPrompt(id, updates);
      setTextPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));
      toast.success('Prompt de texto atualizado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar prompt de texto';
      toast.error(errorMessage);
      throw err;
    }
  };

  const removeTextPrompt = async (id: string): Promise<void> => {
    try {
      await deleteTextPrompt(id);
      setTextPrompts(prev => prev.filter(p => p.id !== id));
      toast.success('Prompt de texto removido com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover prompt de texto';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    loadTextPrompts();
  }, []);

  return {
    textPrompts,
    loading,
    error,
    loadTextPrompts,
    createTextPrompt,
    editTextPrompt,
    removeTextPrompt
  };
};
