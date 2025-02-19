
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MusicStructure } from "@/types/prompt";

export const useStructures = () => {
  const [structures, setStructures] = useState<MusicStructure[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStructures = async () => {
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStructures(data);
    } catch (error) {
      console.error('Erro ao carregar estruturas:', error);
      toast.error('Erro ao carregar estruturas');
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
    } catch (error) {
      console.error('Erro ao adicionar estrutura:', error);
      toast.error('Erro ao adicionar estrutura');
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

      loadStructures();
      toast.success('Estrutura atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar estrutura:', error);
      toast.error('Erro ao atualizar estrutura');
    }
  };

  const deleteStructure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStructures(prev => prev.filter(s => s.id !== id));
      toast.success('Estrutura removida com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar estrutura:', error);
      toast.error('Erro ao deletar estrutura');
    }
  };

  return {
    structures,
    loading,
    loadStructures,
    addStructure,
    editStructure,
    deleteStructure
  };
};
