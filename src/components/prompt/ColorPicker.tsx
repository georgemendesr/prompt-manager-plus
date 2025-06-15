
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
}

const COLORS = [
  "bg-soft-green",
  "bg-soft-yellow",
  "bg-soft-orange",
  "bg-soft-purple",
  "bg-soft-pink",
  "bg-soft-peach",
  "bg-soft-blue",
  "bg-soft-gray",
];

export const ColorPicker = ({ onColorSelect }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-purple-600 transition-colors"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`w-12 h-12 rounded-lg ${color} hover:ring-2 ring-offset-2 ring-purple-500 transition-all`}
              onClick={() => onColorSelect(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
