
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface RatingButtonsProps {
  rating: number;
  onRate: (increment: boolean) => void;
  backgroundColor?: string;
}

export const RatingButtons = ({ rating, onRate, backgroundColor }: RatingButtonsProps) => {
  const handleClick = () => {
    const shouldIncrement = rating === 0;
    console.log('RatingButtons click:', { currentRating: rating, shouldIncrement });
    onRate(shouldIncrement);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`h-6 w-6 hover:text-yellow-500 transition-colors ${
        rating > 0 ? 'text-yellow-500' : 'text-gray-400'
      }`}
    >
      <Star className="h-3.5 w-3.5" />
    </Button>
  );
};
