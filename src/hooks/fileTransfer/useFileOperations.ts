
import { useState } from "react";
import { useRetry } from "@/hooks/utils/useRetry";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { isNetworkError } from "@/hooks/utils/errorUtils";
import * as fileTransferService from "@/services/fileTransfer/fileTransferService";
import { FileInfo } from "@/types/fileTransfer";

export function useFileOperations() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Use retry hook for file operations
  const { executeWithRetry } = useRetry({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    retryOnNetworkError: true
  });

  const loadFiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Use retry logic for loading files
      await executeWithRetry(async () => {
        const loadedFiles = await fileTransferService.loadUserFiles(user.id);
        setFiles(loadedFiles);
      }, "Carregar Arquivos");
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (selectedFiles: FileList) => {
    if (!selectedFiles || selectedFiles.length === 0 || !user) return;

    try {
      setUploading(true);
      setProgress(0);
      
      // Ensure bucket exists before uploading
      const bucketExists = await fileTransferService.ensureBucketExists();
      if (!bucketExists) {
        throw new Error('Could not access storage bucket');
      }

      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          // Attempt upload with retry logic
          await executeWithRetry(async () => {
            await fileTransferService.uploadFile(file, user.id!);
          }, `Upload ${file.name}`);
          
          // Update progress after each successful file upload
          setProgress(((i + 1) / selectedFiles.length) * 100);
        } catch (error) {
          // Handle individual file upload errors
          console.error(`Error uploading ${file.name}:`, error);
          
          // Show specific error for this file but continue with others
          if (isNetworkError(error)) {
            toast.error(`Falha na conexão ao enviar "${file.name}". Verifique sua internet.`);
          } else {
            toast.error(`Erro ao enviar "${file.name}": ${(error as Error).message || 'Erro desconhecido'}`);
          }
        }
      }
      
      toast.success("Arquivo(s) enviado(s) com sucesso!");
      await loadFiles(); // Reload the file list
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      
      // Show appropriate error message based on error type
      if (isNetworkError(error)) {
        toast.error("Falha na conexão. Verifique sua internet e tente novamente.");
      } else {
        toast.error(`Erro ao enviar arquivo: ${(error as Error).message || 'Erro desconhecido'}`);
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!user) return;
    
    try {
      await executeWithRetry(async () => {
        await fileTransferService.deleteUserFile(fileName, user.id);
        setFiles(prev => prev.filter(file => file.name !== fileName));
      }, "Excluir Arquivo");
      
      toast.success("Arquivo excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast.error("Erro ao excluir arquivo");
    }
  };

  const shareFileWithUser = async (url: string, fileName: string) => {
    try {
      await fileTransferService.shareFile(url, fileName);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      console.error('Erro ao compartilhar arquivo:', error);
      toast.error("Erro ao compartilhar arquivo");
    }
  };

  const copyLinkToClipboard = async (url: string) => {
    try {
      await fileTransferService.copyLinkToClipboard(url);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error("Erro ao copiar link");
    }
  };

  return {
    files,
    loading,
    uploading,
    progress,
    loadFiles,
    uploadFiles,
    deleteFile,
    downloadFile: fileTransferService.downloadFile,
    shareFile: shareFileWithUser,
    copyLinkToClipboard
  };
}
