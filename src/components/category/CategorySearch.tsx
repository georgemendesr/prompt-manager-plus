
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategorySearch = ({ value, onChange }: CategorySearchProps) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar prompts..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        autoComplete="off"
      />
    </div>
  );
};
