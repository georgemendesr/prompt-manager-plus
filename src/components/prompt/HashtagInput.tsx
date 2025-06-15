
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hash } from "lucide-react";
import { useState } from "react";

interface HashtagInputProps {
  onHashtagAdd: (hashtag: string) => void;
  existingHashtags: string[];
}

export const HashtagInput = ({ onHashtagAdd, existingHashtags }: HashtagInputProps) => {
  const [hashtag, setHashtag] = useState("");

  const handleHashtagSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hashtag.trim()) {
      const newHashtag = hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`;
      if (!existingHashtags.includes(newHashtag)) {
        onHashtagAdd(newHashtag);
        setHashtag("");
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-purple-600 transition-colors"
        >
          <Hash className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <Input
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
          onKeyDown={handleHashtagSubmit}
          placeholder="Digite uma hashtag e pressione Enter"
          className="w-full"
        />
      </PopoverContent>
    </Popover>
  );
};
