
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface RatingButtonsProps {
  rating: number;
  onRate: (increment: boolean) => void;
  backgroundColor?: string;
}

export const RatingButtons = ({ rating, onRate, backgroundColor }: RatingButtonsProps) => {
  const handleClick = () => {
    // Se rating é 0, vamos incrementar (true)
    // Se rating é 1, vamos decrementar (false)
    const shouldIncrement = rating === 0;
    onRate(shouldIncrement);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`hover:text-yellow-500 transition-colors ${rating > 0 ? 'text-yellow-500' : 'text-gray-400'}`}
    >
      <Star className="h-4 w-4" />
    </Button>
  );
};
