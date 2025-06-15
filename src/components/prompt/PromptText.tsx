
import { type ReactNode } from "react";

interface PromptTextProps {
  text: string;
  searchTerm: string;
  rating: number;
}

export const PromptText = ({ text, searchTerm, rating }: PromptTextProps) => {
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return <span key={i} className="bg-yellow-200 px-0.5">{part}</span>;
      }
      return part;
    });
  };

  // Determina a classe de texto com base na pontuação
  const getTextClasses = () => {
    if (rating >= 20) return 'font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent';
    if (rating >= 15) return 'font-medium bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent';
    if (rating >= 10) return 'font-medium bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent';
    if (rating >= 5) return 'font-medium bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent';
    if (rating > 0) return 'text-gray-800';
    if (rating < 0) return 'text-gray-600';
    return 'text-gray-800';
  };

  const textClasses = `${getTextClasses()} break-words line-clamp-2`;

  return (
    <p className={textClasses}>
      {highlightSearchTerm(text, searchTerm)}
    </p>
  );
};
