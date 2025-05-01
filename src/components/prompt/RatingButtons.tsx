
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface RatingButtonsProps {
  rating: number;
  onRate: (increment: boolean) => void;
  backgroundColor?: string;
}

export const RatingButtons = ({ rating, onRate, backgroundColor }: RatingButtonsProps) => {
  // Determina a cor do texto da pontuação com base no valor
  const getRatingTextColor = (score: number) => {
    if (score >= 20) return "text-amber-600 font-bold";
    if (score >= 15) return "text-orange-600 font-bold";
    if (score >= 10) return "text-purple-600 font-bold";
    if (score >= 5) return "text-green-600 font-bold";
    if (score > 0) return "text-blue-600";
    if (score < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="flex items-center space-x-1">
      <div className={`text-xs font-medium mx-1 ${getRatingTextColor(rating)}`}>
        {rating}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRate(true)}
        className="h-6 w-6 hover:text-green-500 hover:bg-green-50 transition-colors"
        title="Votar positivamente"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRate(false)}
        className="h-6 w-6 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Votar negativamente"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
