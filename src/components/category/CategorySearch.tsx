
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategorySearch = ({ value, onChange }: CategorySearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Search value changing to:', newValue); // Debug log
    onChange(newValue);
  };

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Buscar prompts..."
        value={value}
        onChange={handleChange}
        className="pl-10"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
      />
    </div>
  );
};
