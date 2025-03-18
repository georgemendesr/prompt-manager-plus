
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Download, Trash2, FileUp, Share2, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileInfo {
  id: string;
  name: string;
  size: number;
  created_at: string;
  url: string;
}

export const FileTransfer = () => {
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
        // Nota: isso pode não funcionar dependendo das permissões, melhor fazer por SQL
        await supabase.storage.createBucket('file-transfer', {
          public: false,
          fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
        });
      }
      
      // Listar arquivos do usuário
      const { data, error } = await supabase.storage
        .from('file-transfer')
        .list(user.id);

      if (error) throw error;

      if (data) {
        const filesWithUrls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('file-transfer')
              .createSignedUrl(`${user.id}/${file.name}`, 3600); // 1 hour expiry

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFiles = event.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;

      setUploading(true);
      setProgress(0);

      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${user?.id}/${file.name}`;

        // Upload - observe que não usamos mais onUploadProgress (que estava causando o erro)
        const { error } = await supabase.storage
          .from('file-transfer')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;
        
        // Incremento manual de progresso já que não temos mais o onUploadProgress
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
      // Limpar o campo de input para permitir upload do mesmo arquivo novamente
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('file-transfer')
        .remove([`${user?.id}/${fileName}`]);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando arquivos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium mb-4">Transferência Rápida de Arquivos</h3>
        <p className="text-sm text-gray-500 mb-4">
          Faça upload de arquivos para transferir entre dispositivos. Acesse esta mesma página em outro dispositivo para baixá-los.
        </p>
        
        <div className="space-y-4">
          <Input
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
      </div>

      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
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
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhum arquivo disponível</p>
          <p className="text-sm text-gray-400 mt-1">
            Faça upload de arquivos usando o botão acima
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Dica: Os arquivos ficarão disponíveis por 7 dias.</p>
      </div>
    </div>
  );
};
