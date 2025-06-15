import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addLinkToDb } from "@/services/link/linkService";
import { toast } from "sonner";

interface LinkFormProps {
  onAdded: () => void;
}

export const LinkForm = ({ onAdded }: LinkFormProps) => {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    if (!url.trim()) return;

    const { error } = await addLinkToDb({ url, description });
    if (error) {
      toast.error("Erro ao adicionar link");
    } else {
      toast.success("Link adicionado");
      setUrl("");
      setDescription("");
      onAdded();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Input
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button onClick={handleAdd}>Adicionar</Button>
    </div>
  );
};
