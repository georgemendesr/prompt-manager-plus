import type { Link } from "@/types/link";
import { Button } from "@/components/ui/button";

interface LinkListProps {
  links: Link[];
  onDelete: (id: string) => void;
}

export const LinkList = ({ links, onDelete }: LinkListProps) => {
  if (links.length === 0) {
    return <div className="text-gray-500 text-center">Nenhum link</div>;
  }
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li
          key={link.id}
          className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
        >
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {link.description || link.url}
          </a>
          <Button variant="ghost" onClick={() => onDelete(link.id)}>
            Excluir
          </Button>
        </li>
      ))}
    </ul>
  );
};
