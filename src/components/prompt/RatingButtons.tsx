
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface RatingButtonsProps {
  rating: number;
  onRate: (increment: boolean) => void;
  backgroundColor?: string;
}

export const RatingButtons = ({ rating, onRate, backgroundColor }: RatingButtonsProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onRate(!rating)} // Alterna entre 0 e 1
      className={`hover:text-yellow-500 transition-colors ${rating ? 'text-yellow-500' : 'text-gray-400'}`}
    >
      <Star className="h-4 w-4" />
    </Button>
  );
};
