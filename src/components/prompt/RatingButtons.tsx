
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface RatingButtonsProps {
  rating: number;
  onRate: (increment: boolean) => void;
  backgroundColor?: string;
}

export const RatingButtons = ({ rating, onRate, backgroundColor }: RatingButtonsProps) => {
  return (
    <div className="flex items-center space-x-1">
      <div className="text-xs font-medium mx-1">{rating}</div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRate(true)}
        className="h-6 w-6 hover:text-green-500 transition-colors"
        title="Votar positivamente"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRate(false)}
        className="h-6 w-6 hover:text-red-500 transition-colors"
        title="Votar negativamente"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
