
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
  if (hashtags.length === 0 && regularComments.length === 0 && structureRefs.length === 0) {
    return null;
  }

  // Determina as classes para os comentários com base na pontuação
  const getCommentClasses = () => {
    if (rating >= 20) return 'text-yellow-700 bg-yellow-50/70';
    if (rating >= 15) return 'text-orange-700 bg-orange-50/70';
    if (rating >= 10) return 'text-purple-700 bg-purple-50/70';
    if (rating >= 5) return 'text-green-700 bg-green-50/70';
    if (rating > 0) return 'text-blue-700 bg-blue-50/70';
    return 'text-gray-600 bg-gray-50/70';
  };

  // Classes para hashtags
  const getHashtagClasses = () => {
    if (rating >= 20) return 'bg-yellow-100 text-yellow-700';
    if (rating >= 15) return 'bg-orange-100 text-orange-700';
    if (rating >= 10) return 'bg-purple-100 text-purple-700';
    if (rating >= 5) return 'bg-green-100 text-green-700';
    return 'bg-soft-purple text-purple-700';
  };

  const commentClasses = getCommentClasses();
  const hashtagClasses = getHashtagClasses();

  return (
    <div className="flex flex-wrap items-center gap-0.5 pt-1">
      {hashtags.map((tag, index) => (
        <span
          key={`tag-${index}`}
          className={`inline-flex items-center px-2 py-0.5 rounded-full ${hashtagClasses} text-xs font-medium`}
        >
          {tag}
        </span>
      ))}
      {structureRefs.filter(ref => !ref.startsWith('[color:')).map((ref, index) => (
        <div
          key={`struct-${index}`}
          className={`text-[10px] font-medium px-1 py-0.5 ${commentClasses}`}
        >
          {ref}
        </div>
      ))}
      {regularComments.map((comment, index) => (
        <div
          key={`comment-${index}`}
          className={`text-[10px] px-1 py-0.5 ${commentClasses}`}
        >
          {comment}
        </div>
      ))}
    </div>
  );
};
