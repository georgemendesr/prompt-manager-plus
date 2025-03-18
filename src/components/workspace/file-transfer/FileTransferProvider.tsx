
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  created_at: string;
  url: string;
}

interface FileTransferContextType {
  files: FileInfo[];
  loading: boolean;
  uploading: boolean;
  progress: number;
  loadFiles: () => Promise<void>;
  uploadFiles: (files: FileList) => Promise<void>;
  deleteFile: (fileName: string) => Promise<void>;
  downloadFile: (url: string, fileName: string) => void;
  shareFile: (url: string, fileName: string) => Promise<void>;
  copyLinkToClipboard: (url: string) => Promise<void>;
}

const FileTransferContext = createContext<FileTransferContextType | undefined>(undefined);

export const useFileTransfer = () => {
  const context = useContext(FileTransferContext);
  if (!context) {
    throw new Error("useFileTransfer must be used within a FileTransferProvider");
  }
  return context;
};

export const FileTransferProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      // Verificar se o bucket existe, senão criar
      const { data: buckets } = await supabase.storage.listBuckets();
      const fileTransferBucket = buckets?.find(b => b.name === 'file-transfer');
      
      if (!fileTransferBucket) {
        // O bucket não existe, tentar criá-lo via API
        await supabase.storage.createBucket('file-transfer', {
          public: false,
          fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
        });
      }
      
      // Listar arquivos do usuário
      const { data, error } = await supabase.storage
        .from('file-transfer')
        .list(user?.id || '');

      if (error) throw error;

      if (data) {
        const filesWithUrls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('file-transfer')
              .createSignedUrl(`${user?.id}/${file.name}`, 3600); // 1 hour expiry

            return {
              id: file.id,
              name: file.name,
              size: file.metadata?.size || 0,
              created_at: file.created_at,
              url: urlData?.signedUrl || ''
            };
          })
        );

        setFiles(filesWithUrls);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (selectedFiles: FileList) => {
    try {
      if (!selectedFiles || selectedFiles.length === 0 || !user) return;

      setUploading(true);
      setProgress(0);

      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${user.id}/${file.name}`;

        // Upload
        const { error } = await supabase.storage
          .from('file-transfer')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;
        
        // Incremento manual de progresso
        setProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast.success("Arquivo(s) enviado(s) com sucesso!");
      await loadFiles(); // Recarregar a lista de arquivos
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase.storage
        .from('file-transfer')
        .remove([`${user.id}/${fileName}`]);

      if (error) throw error;

      setFiles(prev => prev.filter(file => file.name !== fileName));
      toast.success("Arquivo excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast.error("Erro ao excluir arquivo");
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareFile = async (url: string, fileName: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: fileName,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch (error) {
      console.error('Erro ao compartilhar arquivo:', error);
      toast.error("Erro ao compartilhar arquivo");
    }
  };

  const copyLinkToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error("Erro ao copiar link");
    }
  };

  const value = {
    files,
    loading,
    uploading,
    progress,
    loadFiles,
    uploadFiles,
    deleteFile,
    downloadFile,
    shareFile,
    copyLinkToClipboard
  };

  return (
    <FileTransferContext.Provider value={value}>
      {children}
    </FileTransferContext.Provider>
  );
};
