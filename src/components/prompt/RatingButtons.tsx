
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface RatingButtonsProps {
  rating: number;
  onRate: (increment: boolean) => void;
}

export const RatingButtons = ({ rating, onRate }: RatingButtonsProps) => {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRate(true)}
        className="hover:text-green-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <span className="min-w-[2rem] text-center">{rating}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRate(false)}
        className="hover:text-red-600 transition-colors"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </>
  );
};
