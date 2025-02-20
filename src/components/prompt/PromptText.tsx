
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

  const textClasses = `text-gray-800 break-words line-clamp-2 ${
    rating > 0 
      ? 'font-medium bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent' 
      : ''
  }`;

  return (
    <p className={textClasses}>
      {highlightSearchTerm(text, searchTerm)}
    </p>
  );
};
