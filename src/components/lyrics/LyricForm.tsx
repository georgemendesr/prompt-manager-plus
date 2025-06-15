
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addLyricToDb } from "@/services/lyric/lyricService";
import { toast } from "sonner";

interface LyricFormProps {
  onAdded: () => void;
}

export const LyricForm = ({ onAdded }: LyricFormProps) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const handleAdd = async () => {
    if (!content.trim()) return;

    const { error } = await addLyricToDb({ title, content });
    if (error) {
      toast.error("Erro ao adicionar letra");
    } else {
      toast.success("Letra adicionada");
      setContent("");
      setTitle("");
      onAdded();
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Letra"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button onClick={handleAdd}>Adicionar</Button>
    </div>
  );
};
