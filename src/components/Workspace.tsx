
import { useState, useEffect } from "react";
import type { WorkspaceItem } from "@/types/prompt";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { WorkspaceForm } from "./workspace/WorkspaceForm";
import { WorkspaceList } from "./workspace/WorkspaceList";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTransfer } from "./workspace/FileTransfer";

export const Workspace = () => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWorkspaceItems();
    }
  }, [user]);

  const loadWorkspaceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const workspaceItems = data.map(item => ({
        id: item.id,
        text: item.text,
        createdAt: new Date(item.created_at)
      }));

      setItems(workspaceItems);
      
      const expandedState: Record<string, boolean> = {};
      workspaceItems.forEach(item => {
        expandedState[item.id] = false;
      });
      setExpandedItems(expandedState);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error("Erro ao carregar itens do workspace");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (text: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workspace_items')
        .insert([
          {
            text: text.trim(),
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newItem: WorkspaceItem = {
        id: data.id,
        text: data.text,
        createdAt: new Date(data.created_at)
      };

      setItems(prev => [newItem, ...prev]);
      setExpandedItems(prev => ({ ...prev, [newItem.id]: true }));
      toast.success("Texto adicionado à área de trabalho");
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error("Erro ao adicionar texto");
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workspace_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      setExpandedItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast.success("Texto removido da área de trabalho");
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error("Erro ao remover texto");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado para a área de transferência");
    } catch (err) {
      toast.error("Erro ao copiar texto");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!user) {
    return (
      <div className="text-center py-12 text-gray-500">
        Faça login para acessar a área de trabalho
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="files">Transferir Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <WorkspaceForm onAdd={addItem} />
          <WorkspaceList
            items={items}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpand}
            onCopy={copyToClipboard}
            onRemove={removeItem}
          />
        </TabsContent>

        <TabsContent value="files">
          <FileTransfer />
        </TabsContent>
      </Tabs>
    </div>
  );
};
