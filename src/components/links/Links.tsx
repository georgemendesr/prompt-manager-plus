
import { useEffect, useState } from "react";
import type { Link as LinkType } from "@/types/link";
import { fetchLinks, deleteLinkFromDb } from "@/services/link/linkService";
import { LinkForm } from "./LinkForm";
import { LinkList } from "./LinkList";
import { toast } from "sonner";

export const Links = () => {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLinks = async () => {
    const { data, error } = await fetchLinks();
    if (error) {
      toast.error("Erro ao carregar links");
    } else if (data) {
      setLinks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await deleteLinkFromDb(id);
    if (error) {
      toast.error("Erro ao excluir link");
    } else {
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast.success("Link removido!");
    }
  };

  const handleAdd = async (link: LinkType) => {
    setLinks((prev) => [link, ...prev]);
    toast.success("Link adicionado!");
  };

  const handleEdit = async (id: string, link: LinkType) => {
    setLinks((prev) => prev.map((l) => l.id === id ? { ...l, ...link } : l));
    toast.success("Link atualizado!");
  };

  if (loading) return <div className="text-center">Carregando...</div>;

  return (
    <div className="space-y-4">
      <LinkForm onAdded={loadLinks} />
      <LinkList
        links={links}
        onAddLink={handleAdd}
        onEditLink={handleEdit}
        onDeleteLink={handleDelete}
        onDelete={handleDelete}
      />
    </div>
  );
};
