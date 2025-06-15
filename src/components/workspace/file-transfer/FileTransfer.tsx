
import { FileTransferProvider } from "./FileTransferProvider";
import { FileUploader } from "./FileUploader";
import { FileList } from "./FileList";

export const FileTransfer = () => {
  return (
    <FileTransferProvider>
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-medium mb-4">Transferência Rápida de Arquivos</h3>
          <p className="text-sm text-gray-500 mb-4">
            Faça upload de arquivos para transferir entre dispositivos. Acesse esta mesma página em outro dispositivo para baixá-los.
          </p>
          
          <FileUploader />
        </div>

        <FileList />

        <div className="mt-4 text-sm text-gray-500">
          <p>Dica: Os arquivos ficarão disponíveis por 7 dias.</p>
        </div>
      </div>
    </FileTransferProvider>
  );
};
