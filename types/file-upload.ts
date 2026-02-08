import { LucideIcon } from 'lucide-react';

export interface FileUploadProgress {
  filename: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  retryCount: number;
}

export interface StorageInfo {
  used: number; // bytes
  limit: number; // bytes
  available: number; // bytes
  percentage: number; // 0-100
}

export interface ChunkedUploadMetadata {
  uploadId: string;
  filename: string;
  totalChunks: number;
  chunkSize: number;
}

export type AllowedMimeType =
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/gif'
  | 'video/mp4'
  | 'video/quicktime'
  | 'video/x-msvideo'
  | 'application/zip'
  | 'application/x-rar-compressed';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: AllowedMimeType;
}

export interface FileUploadInput {
  filename: string;
  filesize: number;
  mimetype: AllowedMimeType;
  projectId: string;
}

export interface FileCategory {
  mimeTypes: AllowedMimeType[];
  maxSize: number; // bytes
  icon: LucideIcon;
  label: string;
}

export interface StorageCheckResult {
  valid: boolean;
  error?: string;
  storageInfo?: {
    used: number;
    limit: number;
    available: number;
  };
}

export interface SavedFileResult {
  filepath: string;
  filename: string;
  filesize: number;
}

export interface UploadFileState {
  uploading: boolean;
  progress: number;
  error: string | null;
  retryCount: number;
  uploadedFiles: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  filename: string;
  filesize: number;
  filepath: string;
  mimetype: string;
  uploadedAt: Date;
}
