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
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const handleAdd = async () => {
    if (!text.trim()) return;

    const { error } = await addLyricToDb({ text, title, artist });
    if (error) {
      toast.error("Erro ao adicionar letra");
    } else {
      toast.success("Letra adicionada");
      setText("");
      setTitle("");
      setArtist("");
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
      <Input
        placeholder="Artista"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <Textarea
        placeholder="Letra"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={handleAdd}>Adicionar</Button>
    </div>
  );
};
