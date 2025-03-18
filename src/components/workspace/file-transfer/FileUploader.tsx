
import { useRef } from "react";
import { useFileTransfer } from "./FileTransferProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileUp } from "lucide-react";

export const FileUploader = () => {
  const { uploading, progress, uploadFiles } = useFileTransfer();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      uploadFiles(files);
    }
    
    // Reset input value to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Input
        ref={inputRef}
        type="file"
        multiple
        disabled={uploading}
        onChange={handleFileUpload}
        className="cursor-pointer"
      />
      
      {uploading && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Enviando...</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
