
import { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Trash, Copy, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkspaceItem } from "@/types/prompt";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const Workspace = () => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [newText, setNewText] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
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
      
      // Iniciar com todos os itens recolhidos
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

  const addItem = async () => {
    if (!newText.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('workspace_items')
        .insert([
          {
            text: newText.trim(),
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
      setNewText("");
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Área de Trabalho</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFormExpanded(!isFormExpanded)}
          className="gap-2"
        >
          {isFormExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {isFormExpanded ? "Recolher" : "Expandir"}
        </Button>
      </div>
      
      <Card className={`p-4 overflow-hidden transition-all duration-200 ${
        isFormExpanded ? 'max-h-[1000px]' : 'max-h-[60px]'
      }`}>
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => copyToClipboard(newText)}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
        </div>
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Cole seu texto aqui..."
          className="min-h-[200px] md:min-h-[300px] mb-4"
        />
        <Button onClick={addItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar à área de trabalho
        </Button>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4 relative group">
            <div className="flex justify-between items-start mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6"
                onClick={() => toggleExpand(item.id)}
              >
                {expandedItems[item.id] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {expandedItems[item.id] ? "Recolher" : "Expandir"}
                </span>
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(item.text)}
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-200 ${
              expandedItems[item.id] ? 'max-h-[1000px]' : 'max-h-[0px]'
            }`}>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{item.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
