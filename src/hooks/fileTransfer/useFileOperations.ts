
import { useState } from "react";
import { useRetry } from "@/hooks/utils/useRetry";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { isNetworkError } from "@/hooks/utils/errorUtils";
import * as fileTransferService from "@/services/fileTransfer/fileTransferService";
import { FileInfo, FailedUpload } from "@/types/fileTransfer";

export function useFileOperations() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>([]);
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

  const uploadSingleFile = async (file: File): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await fileTransferService.uploadFile(file, user.id!);
      return true;
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      
      // Store the failed upload
      setFailedUploads(prev => [...prev, { 
        file, 
        error: isNetworkError(error) 
          ? "Falha na conexão" 
          : ((error as Error).message || 'Erro desconhecido')
      }]);
      
      // Show specific error for this file
      if (isNetworkError(error)) {
        toast.error(`Falha na conexão ao enviar "${file.name}". Verifique sua internet.`);
      } else {
        toast.error(`Erro ao enviar "${file.name}": ${(error as Error).message || 'Erro desconhecido'}`);
      }
      
      return false;
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

      // Clear previous failed uploads before starting new ones
      setFailedUploads([]);
      
      let uploadedCount = 0;
      const totalFiles = selectedFiles.length;
      
      // Upload files one by one
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const success = await uploadSingleFile(file);
        
        if (success) {
          uploadedCount++;
        }
        
        // Update progress after each file upload attempt
        setProgress(((i + 1) / totalFiles) * 100);
      }

      if (uploadedCount > 0) {
        if (uploadedCount === totalFiles) {
          toast.success(`${totalFiles > 1 ? 'Arquivos enviados' : 'Arquivo enviado'} com sucesso!`);
        } else {
          toast.success(`${uploadedCount} de ${totalFiles} arquivos enviados com sucesso.`);
        }
        await loadFiles(); // Reload the file list
      } else if (totalFiles > 0) {
        toast.error(`Nenhum arquivo foi enviado. Tente novamente.`);
      }
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

  const retryFailedUploads = async () => {
    if (failedUploads.length === 0 || !user) return;
    
    try {
      setUploading(true);
      setProgress(0);
      
      // Ensure bucket exists before retrying uploads
      const bucketExists = await fileTransferService.ensureBucketExists();
      if (!bucketExists) {
        throw new Error('Could not access storage bucket');
      }
      
      const filesToRetry = [...failedUploads];
      setFailedUploads([]); // Clear failed uploads list before retrying
      
      let uploadedCount = 0;
      const totalFiles = filesToRetry.length;
      
      // Retry each failed upload
      for (let i = 0; i < totalFiles; i++) {
        const { file } = filesToRetry[i];
        const success = await uploadSingleFile(file);
        
        if (success) {
          uploadedCount++;
        }
        
        // Update progress after each file upload attempt
        setProgress(((i + 1) / totalFiles) * 100);
      }
      
      if (uploadedCount > 0) {
        if (uploadedCount === totalFiles) {
          toast.success(`Todas as ${totalFiles} tentativas de reenvio foram bem-sucedidas!`);
        } else {
          toast.success(`${uploadedCount} de ${totalFiles} arquivos reenviados com sucesso.`);
        }
        await loadFiles(); // Reload the file list
      } else {
        toast.error(`Falha no reenvio. Tente novamente mais tarde.`);
      }
    } catch (error) {
      console.error('Erro ao reenviar arquivos:', error);
      toast.error(`Erro ao reenviar arquivos: ${(error as Error).message || 'Erro desconhecido'}`);
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
    failedUploads,
    loading,
    uploading,
    progress,
    loadFiles,
    uploadFiles,
    retryFailedUploads,
    deleteFile,
    downloadFile: fileTransferService.downloadFile,
    shareFile: shareFileWithUser,
    copyLinkToClipboard
  };
}
