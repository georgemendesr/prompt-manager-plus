
interface HashtagListProps {
  hashtags: string[];
}

export const HashtagList = ({ hashtags }: HashtagListProps) => {
  if (hashtags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {hashtags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded-full bg-soft-purple text-xs font-medium text-purple-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};
