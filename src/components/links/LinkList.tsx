import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, X, Pencil, Trash } from "lucide-react";
import type { Link as LinkType } from "@/types/link";

interface LinkListProps {
  links: LinkType[];
  loadError?: string | null;
  onAddLink: (link: LinkType) => void;
  onEditLink: (id: string, link: LinkType) => void;
  onDeleteLink: (id: string) => void;
}

export const LinkList = ({
  links,
  loadError,
  onAddLink,
  onEditLink,
  onDeleteLink
}: LinkListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ url: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edited, setEdited] = useState({ url: "", description: "" });

  const handleAdd = () => {
    if (!newLink.url.trim()) return;
    const link: LinkType = {
      id: crypto.randomUUID(),
      url: newLink.url.trim(),
      description: newLink.description.trim(),
      created_at: new Date().toISOString()
    };
    onAddLink(link);
    setNewLink({ url: "", description: "" });
    setIsAdding(false);
  };

  const handleEditSave = (id: string) => {
    onEditLink(id, { ...edited, id, created_at: new Date().toISOString() });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Links</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>Novo Link</Button>
      </div>

      {loadError && (
        <div className="text-red-500 text-sm">{loadError}</div>
      )}

      {isAdding && (
        <Card className="p-4 space-y-4">
          <Input
            placeholder="URL"
            value={newLink.url}
            onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
          />
          <Input
            placeholder="Descrição"
            value={newLink.description}
            onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleAdd}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {links.map(link => (
          <Card key={link.id} className="p-4 flex items-center justify-between">
            {editingId === link.id ? (
              <div className="flex-1 space-y-2">
                <Input
                  value={edited.url}
                  onChange={(e) => setEdited(prev => ({ ...prev, url: e.target.value }))}
                />
                <Input
                  value={edited.description}
                  onChange={(e) => setEdited(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" size="icon" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={() => handleEditSave(link.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                    {link.url}
                  </a>
                  {link.description && (
                    <p className="text-sm text-gray-600">{link.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => { setEditingId(link.id); setEdited({ url: link.url, description: link.description || "" }); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => onDeleteLink(link.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
