
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Share2, Copy } from "lucide-react";
import { useFileTransfer, FileInfo } from "./FileTransferProvider";
import { cn } from "@/lib/utils";
import { formatFileSize } from "./utils";

interface FileItemProps {
  file: FileInfo;
}

export const FileItem = ({ file }: FileItemProps) => {
  const { deleteFile, downloadFile, shareFile, copyLinkToClipboard } = useFileTransfer();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>{formatFileSize(file.size)}</span>
              <span className="mx-1">•</span>
              <span>{new Date(file.created_at).toLocaleDateString()}</span>
            </p>
          </div>
          <div className={cn(
            "flex flex-wrap gap-2",
            "sm:flex-nowrap"
          )}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(file.url, file.name)}
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Baixar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => shareFile(file.url, file.name)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Compartilhar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyLinkToClipboard(file.url)}
            >
              <Copy className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Copiar Link</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteFile(file.name)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Excluir</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
