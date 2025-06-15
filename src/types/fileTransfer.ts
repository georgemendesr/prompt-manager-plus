
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  created_at: string;
  url: string;
}

export interface FailedUpload {
  file: File;
  error: string;
}

export interface FileTransferContextType {
  files: FileInfo[];
  failedUploads: FailedUpload[];
  loading: boolean;
  uploading: boolean;
  progress: number;
  loadFiles: () => Promise<void>;
  uploadFiles: (files: FileList) => Promise<void>;
  retryFailedUploads: () => Promise<void>;
  deleteFile: (fileName: string) => Promise<void>;
  downloadFile: (url: string, fileName: string) => void;
  shareFile: (url: string, fileName: string) => Promise<void>;
  copyLinkToClipboard: (url: string) => Promise<void>;
}
