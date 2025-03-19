
import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useFileOperations } from "@/hooks/fileTransfer/useFileOperations";
import { FileInfo, FileTransferContextType } from "@/types/fileTransfer";

const FileTransferContext = createContext<FileTransferContextType | undefined>(undefined);

export const useFileTransfer = () => {
  const context = useContext(FileTransferContext);
  if (!context) {
    throw new Error("useFileTransfer must be used within a FileTransferProvider");
  }
  return context;
};

export { type FileInfo };

export const FileTransferProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const fileOperations = useFileOperations();
  
  useEffect(() => {
    if (user) {
      fileOperations.loadFiles();
    }
  }, [user]);

  return (
    <FileTransferContext.Provider value={fileOperations}>
      {children}
    </FileTransferContext.Provider>
  );
};
