
import { useRef, useState } from "react";
import { useFileTransfer } from "./FileTransferProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FileUploader = () => {
  const { uploading, progress, uploadFiles } = useFileTransfer();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: FileList | null): boolean => {
    if (!files || files.length === 0) return false;
    
    // Check file size limits (50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50 MB
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        setError(`O arquivo "${files[i].name}" excede o limite de 50MB.`);
        toast.error(`Arquivo muito grande: ${files[i].name}`);
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (validateFiles(files)) {
      uploadFiles(files!);
    }
    
    // Reset input value to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Input
            ref={inputRef}
            type="file"
            multiple
            disabled={uploading}
            onChange={handleFileUpload}
            className="cursor-pointer"
            accept="*/*"  // Accept all file types
            aria-label="Selecionar arquivos para upload"
          />
          
          <Button 
            onClick={handleButtonClick}
            disabled={uploading}
            type="button"
            size="sm"
          >
            <FileUp className="h-4 w-4 mr-1" />
            Procurar
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-xs text-gray-500">
          Limite de 50MB por arquivo
        </div>
      </div>
      
      {uploading && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Enviando... {Math.round(progress)}%</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
