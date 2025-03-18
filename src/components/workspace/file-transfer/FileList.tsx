
import { useFileTransfer } from "./FileTransferProvider";
import { FileItem } from "./FileItem";

export const FileList = () => {
  const { files, loading } = useFileTransfer();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando arquivos...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum arquivo disponível</p>
        <p className="text-sm text-gray-400 mt-1">
          Faça upload de arquivos usando o botão acima
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
};
