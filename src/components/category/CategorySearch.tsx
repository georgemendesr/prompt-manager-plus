
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CategorySearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryName: string;
}

export const CategorySearch = ({ searchTerm, setSearchTerm, categoryName }: CategorySearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
  };

  const handleBlur = () => {
    if (!searchTerm) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative mb-4">
      {isExpanded ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar prompts..."
            value={searchTerm}
            onChange={handleChange}
            onBlur={handleBlur}
            className="pl-10 w-full transition-all duration-200 ease-in-out"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsExpanded(true)}
        >
          <Search className="h-4 w-4" />
          Buscar
        </Button>
      )}
    </div>
  );
};
