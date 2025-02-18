
interface HashtagListProps {
  hashtags: string[];
}

export const HashtagList = ({ hashtags }: HashtagListProps) => {
  if (hashtags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {hashtags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};
