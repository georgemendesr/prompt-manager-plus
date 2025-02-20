
interface PromptCommentsProps {
  hashtags: string[];
  regularComments: string[];
  structureRefs: string[];
  rating: number;
}

export const PromptComments = ({ 
  hashtags, 
  regularComments, 
  structureRefs, 
  rating 
}: PromptCommentsProps) => {
  // Remove tags internas do sistema que não devem aparecer
  const filteredComments = regularComments.filter(comment => {
    // Remove comandos internos e tags do sistema
    return !comment.includes('male voice') && 
           !comment.includes('female voice') &&
           !comment.includes('busca') && 
           !comment.includes('selecionar todos');
  });

  const filteredHashtags = hashtags.filter(tag => {
    // Remove hashtags internas do sistema
    return !tag.includes('male voice') && 
           !tag.includes('female voice') &&
           !tag.includes('busca') && 
           !tag.includes('selecionar todos');
  });

  if (filteredHashtags.length === 0 && filteredComments.length === 0 && structureRefs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 pt-1">
      {filteredHashtags.map((tag, index) => (
        <span
          key={`tag-${index}`}
          className="inline-flex items-center px-2 py-0.5 rounded-full bg-soft-purple text-xs font-medium text-purple-700"
        >
          {tag}
        </span>
      ))}
      {structureRefs.filter(ref => !ref.startsWith('[color:')).map((ref, index) => (
        <div
          key={`struct-${index}`}
          className={`text-[10px] font-medium px-1 py-0.5 ${
            rating > 0 
              ? 'text-yellow-700 bg-yellow-50' 
              : 'text-blue-700 bg-blue-50'
          }`}
        >
          {ref}
        </div>
      ))}
      {filteredComments.map((comment, index) => (
        <div
          key={`comment-${index}`}
          className={`text-[10px] px-1 py-0.5 ${
            rating > 0 
              ? 'text-yellow-700 bg-yellow-50' 
              : 'text-gray-600 bg-soft-gray'
          }`}
        >
          {comment}
        </div>
      ))}
    </div>
  );
};
