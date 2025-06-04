import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Link } from "@/types/link";
import * as linkService from "@/services/link/linkService";

export const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadLinks = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await linkService.fetchLinks();
      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar links:', error);
      setLoadError(error?.message || 'Erro de conexão');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const addLink = async (link: Link) => {
    try {
      const { data, error } = await linkService.addLink(link);
      if (error) throw error;
      if (data) setLinks(prev => [data, ...prev]);
      toast.success('Link adicionado!');
    } catch (error: any) {
      console.error('Erro ao adicionar link:', error);
      toast.error('Erro ao adicionar link');
    }
  };

  const editLink = async (id: string, link: Link) => {
    try {
      const { error } = await linkService.updateLink(id, link);
      if (error) throw error;
      setLinks(prev => prev.map(l => l.id === id ? { ...l, ...link } : l));
      toast.success('Link atualizado!');
    } catch (error: any) {
      console.error('Erro ao atualizar link:', error);
      toast.error('Erro ao atualizar link');
      loadLinks();
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await linkService.deleteLink(id);
      if (error) throw error;
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success('Link removido!');
    } catch (error: any) {
      console.error('Erro ao remover link:', error);
      toast.error('Erro ao remover link');
    }
  };

  return { links, loading, loadError, loadLinks, addLink, editLink, deleteLink };
};
