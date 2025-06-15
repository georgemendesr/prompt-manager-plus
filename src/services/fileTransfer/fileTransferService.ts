
import { supabase } from "@/integrations/supabase/client";
import { FileInfo } from "@/types/fileTransfer";
import { toast } from "sonner";
import { isNetworkError } from "@/hooks/utils/errorUtils";

export async function ensureBucketExists() {
  try {
    // Check if bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const fileTransferBucket = buckets?.find(b => b.name === 'file-transfer');
    
    if (!fileTransferBucket) {
      // Bucket doesn't exist, try to create it via API
      await supabase.storage.createBucket('file-transfer', {
        public: false,
        fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
      });
      console.log('Created new file-transfer bucket');
    }
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
}

export async function loadUserFiles(userId: string | undefined): Promise<FileInfo[]> {
  if (!userId) return [];
  
  // Ensure bucket exists
  const bucketExists = await ensureBucketExists();
  if (!bucketExists) throw new Error('Could not access storage bucket');
  
  // List user's files
  const { data, error } = await supabase.storage
    .from('file-transfer')
    .list(userId || '');

  if (error) throw error;

  if (data) {
    const filesWithUrls = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from('file-transfer')
          .createSignedUrl(`${userId}/${file.name}`, 3600); // 1 hour expiry

        return {
          id: file.id,
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          url: urlData?.signedUrl || ''
        };
      })
    );

    return filesWithUrls;
  }
  
  return [];
}

export async function uploadFile(file: File, userId: string): Promise<void> {
  const filePath = `${userId}/${file.name}`;
  
  const { error } = await supabase.storage
    .from('file-transfer')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;
}

export async function deleteUserFile(fileName: string, userId: string | undefined): Promise<void> {
  if (!userId) throw new Error('User not authenticated');
  
  const { error } = await supabase.storage
    .from('file-transfer')
    .remove([`${userId}/${fileName}`]);

  if (error) throw error;
}

export function downloadFile(url: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareFile(url: string, fileName: string): Promise<void> {
  try {
    if (navigator.share) {
      await navigator.share({
        title: fileName,
        url: url
      });
    } else {
      await copyLinkToClipboard(url);
    }
  } catch (error) {
    console.error('Erro ao compartilhar arquivo:', error);
    throw error;
  }
}

export async function copyLinkToClipboard(url: string): Promise<void> {
  await navigator.clipboard.writeText(url);
}
