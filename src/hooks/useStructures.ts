
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MusicStructure } from "@/types/prompt";

export const useStructures = () => {
  const [structures, setStructures] = useState<MusicStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStructures = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      console.log('Iniciando carregamento de estruturas musicais...');
      
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro do Supabase ao carregar estruturas:', error);
        throw error;
      }
      
      console.log(`${data?.length || 0} estruturas carregadas com sucesso`);
      setStructures(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar estruturas:', error);
      setLoadError(error?.message || 'Erro de conexão');
      // Não mostrar toast para evitar múltiplas notificações
      // Use um fallback de dados vazios
      setStructures([]);
    } finally {
      setLoading(false);
    }
  };

  const addStructure = async (structureOrStructures: MusicStructure | MusicStructure[]) => {
    try {
      const structuresToAdd = Array.isArray(structureOrStructures) 
        ? structureOrStructures 
        : [structureOrStructures];

      const { error } = await supabase
        .from('structures')
        .insert(structuresToAdd.map(structure => ({
          name: structure.name,
          description: structure.description,
          tags: structure.tags,
          effect: structure.effect
        })));

      if (error) throw error;

      loadStructures();
      toast.success(`${structuresToAdd.length} estrutura(s) adicionada(s) com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao adicionar estrutura:', error);
      toast.error('Erro ao adicionar estrutura: ' + (error?.message || 'Erro de conexão'));
    }
  };

  const editStructure = async (id: string, structure: MusicStructure) => {
    try {
      const { error } = await supabase
        .from('structures')
        .update({
          name: structure.name,
          description: structure.description,
          tags: structure.tags,
          effect: structure.effect
        })
        .eq('id', id);

      if (error) throw error;

      // Atualização otimista na interface
      setStructures(prev => 
        prev.map(s => s.id === id ? { ...s, ...structure } : s)
      );
      
      toast.success('Estrutura atualizada com sucesso!');
      
      // Recarregar para garantir sincronização
      loadStructures();
    } catch (error: any) {
      console.error('Erro ao atualizar estrutura:', error);
      toast.error('Erro ao atualizar estrutura: ' + (error?.message || 'Erro de conexão'));
    }
  };

  const deleteStructure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualização otimista na interface
      setStructures(prev => prev.filter(s => s.id !== id));
      toast.success('Estrutura removida com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar estrutura:', error);
      toast.error('Erro ao deletar estrutura: ' + (error?.message || 'Erro de conexão'));
    }
  };

  return {
    structures,
    loading,
    loadError,
    loadStructures,
    addStructure,
    editStructure,
    deleteStructure
  };
};
