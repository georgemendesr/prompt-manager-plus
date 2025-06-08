
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addPromptRating } from '@/services/rating/ratingService';
import { toast } from 'sonner';

interface StarRatingProps {
  promptId: string;
  currentRating: number;
  ratingCount: number;
  copyCount: number;
  onRatingUpdate: () => void;
}

export const StarRating = ({ 
  promptId, 
  currentRating, 
  ratingCount, 
  copyCount,
  onRatingUpdate 
}: StarRatingProps) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = async (rating: number) => {
    setIsSubmitting(true);
    try {
      const { error } = await addPromptRating(promptId, rating);
      if (error) throw error;
      
      toast.success(`Avaliação de ${rating} estrela${rating > 1 ? 's' : ''} adicionada!`);
      onRatingUpdate();
    } catch (error) {
      console.error('Erro ao avaliar:', error);
      toast.error('Erro ao adicionar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredStar || currentRating;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const isHalfFilled = i === Math.ceil(displayRating) && displayRating % 1 !== 0;
      
      stars.push(
        <button
          key={i}
          className={`relative transition-colors duration-150 ${
            isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
          }`}
          onMouseEnter={() => !isSubmitting && setHoveredStar(i)}
          onMouseLeave={() => !isSubmitting && setHoveredStar(0)}
          onClick={() => !isSubmitting && handleStarClick(i)}
          disabled={isSubmitting}
        >
          <Star 
            className={`h-4 w-4 ${
              isFilled || (hoveredStar >= i)
                ? 'fill-yellow-400 text-yellow-400' 
                : isHalfFilled
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      );
    }
    
    return stars;
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        {renderStars()}
      </div>
      
      <div className="flex items-center gap-2 text-gray-600">
        <span className="font-medium">
          {currentRating > 0 ? currentRating.toFixed(1) : '0.0'}
        </span>
        
        <span className="text-gray-400">•</span>
        
        <span>
          {ratingCount} avaliação{ratingCount !== 1 ? 'ões' : ''}
        </span>
        
        <span className="text-gray-400">•</span>
        
        <span>
          {copyCount} cópia{copyCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
        onClick={() => handleStarClick(currentRating > 0 ? currentRating : 5)}
        disabled={isSubmitting}
      >
        {currentRating > 0 ? 'Reavaliar' : 'Avaliar'}
      </Button>
    </div>
  );
};
