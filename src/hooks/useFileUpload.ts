import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Uppy, { UppyFile, UploadResult } from '@uppy/core';
import Tus, { TusDetailedError } from '@uppy/tus';
import { useUppyState } from '@uppy/react';
import { extractRootDirectory, generateFileId, isValidFileDepth } from '../utils/formatters';

interface UppyError {
  message: string;
  details?: string;
}

interface UploadResponse {
  body?: Record<string, never>;
  status: number;
  bytesUploaded?: number;
  uploadURL?: string;
}

const supabaseStorageURL = `https://${process.env.REACT_APP_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;

export interface FileUploadItem {
  id: string;
  name: string;
  size: number;
  relativePath: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error' | 'cancelled';
  error?: string;
}

export interface UseFileUploadConfig {
  maxConcurrentUploads?: number;
}

export interface UseFileUploadReturn {
  files: FileUploadItem[];
  isUploading: boolean;
  maxConcurrentUploads: number;
  setMaxConcurrentUploads: (limit: number) => void;
  handleFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent) => void;
  handleStartUpload: () => void;
  handlePauseUpload: () => void;
  handleClearAll: () => void;
  handleCancelFile: (fileId: string) => void;
  liveRegionRef: React.RefObject<HTMLDivElement | null>;
  globalProgress: number;
  completedFiles: number;
  activeFiles: number;
}

export const useFileUpload = (config: UseFileUploadConfig = {}): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [maxConcurrentUploads, setMaxConcurrentUploads] = useState(config.maxConcurrentUploads || 3);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Initialize Uppy instance with configurable concurrency
  const [uppy] = useState(() => 
    new Uppy({
      meta: { type: 'bulk-upload' },
      restrictions: {
        maxNumberOfFiles: 1000,
        allowedFileTypes: null,
      },
      autoProceed: false,
    })
  );

  // Update Uppy plugin configuration when concurrency changes
  useEffect(() => {
    // Remove existing Tus plugin if it exists
    if (uppy.getPlugin('Tus')) {
      uppy.removePlugin(uppy.getPlugin('Tus')!);
    }

    // Add Tus plugin with new configuration
    uppy.use(Tus, {
      endpoint: supabaseStorageURL,
      headers: {
        authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        apikey: process.env.REACT_APP_SUPABASE_ANON_KEY || "",
      },
      uploadDataDuringCreation: true,
      chunkSize: 6 * 1024 * 1024, // 6MB chunks for better performance
      allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl', 'originalFilename', 'rootDirectory'],
      limit: maxConcurrentUploads,
      retryDelays: [500, 1000], // Retry delays for failed uploads
      onError: function (error) {
        console.error('Upload failed:', error);
      },
      onShouldRetry: (err: TusDetailedError, retryAttempt: number)=>{
        if(retryAttempt > 2){
            // if this attenpt is 3 and above do not proceed
            return false
        }
        if((err.originalResponse?.getStatus()||0) >= 500 && (err.originalResponse?.getStatus()||0)< 600){
            console.log(`Retrying upload due to server error (attempt ${retryAttempt + 1})`)
            return true
        }
        return false
      }
    });

    return () => {
      if (uppy.getPlugin('Tus')) {
        uppy.removePlugin(uppy.getPlugin('Tus')!);
      }
    };
  }, [maxConcurrentUploads, uppy]);

  // Handle concurrency limit changes
  const handleSetMaxConcurrentUploads = useCallback((limit: number) => {
    if (limit < 1 || limit > 10) {
      return;
    }
    
    setMaxConcurrentUploads(limit);
  }, []);

  // Use Uppy's state directly
  const uppyFiles = useUppyState(uppy, (state) => state.files);
  const totalProgress = useUppyState(uppy, (state) => state.totalProgress);

  // Convert Uppy files to FileUploadItem format
  const files = useMemo(() => {
    if (!uppyFiles) return [];
    
    return Object.values(uppyFiles).map((uppyFile): FileUploadItem => {
      const meta = uppyFile.meta as any;
      const relativePath = meta?.relativePath || uppyFile.name;
      
      // Determine status based on Uppy's file state
      let status: FileUploadItem['status'] = 'queued';
      if (uppyFile.progress?.uploadComplete) {
        status = 'done';
      } else if (uppyFile.progress?.uploadStarted) {
        status = 'uploading';
      } else if (uppyFile.error) {
        status = 'error';
      }

      return {
        id: uppyFile.id,
        name: uppyFile.name || 'Unknown',
        size: uppyFile.size || 0,
        relativePath,
        progress: Math.round(uppyFile.progress?.percentage || 0),
        status,
        error: uppyFile.error ? String(uppyFile.error) : undefined,
      };
    });
  }, [uppyFiles]);

  // Set up Uppy event listeners
  useEffect(() => {
    const onFileAdded = (file: UppyFile<{ type: string; }, Record<string, never>>) => {
      // Get existing metadata
      const existingMeta = file.meta as any;
      const relativePath = existingMeta?.relativePath || file.name;
      const rootDirectory = existingMeta?.rootDirectory || '';
      const originalFilename = existingMeta?.originalFilename || file.name;
      const objectName = rootDirectory ? `${rootDirectory}/${relativePath}` : relativePath;
      
      // Preserve existing metadata and add Supabase-specific fields
      const supabaseMetadata = {
        bucketName: process.env.REACT_APP_SUPABASE_STORAGE_BUCKET,
        objectName: objectName,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
      };

      file.meta = {
        ...existingMeta,
        ...supabaseMetadata,
        originalFilename,
        rootDirectory,
      };

      console.log('File added with metadata:', file);
    };

    const onUploadSuccess = (file: UppyFile<{ type: string; }, Record<string, never>> | undefined, response: UploadResponse) => {
      if (file?.id) {
        // Announce success to screen readers
        const fileName = file.name || 'File';
        announceToScreenReader(`${fileName} uploaded successfully`);
      }
    };

    const onUploadError = (file: UppyFile<{ type: string; }, Record<string, never>> | undefined, error: UppyError) => {
      if (file?.id) {
        // Announce error to screen readers
        const fileName = file?.name || 'File';
        announceToScreenReader(`${fileName} upload failed: ${error.message || 'Unknown error'}`);
      }
    };

    const onUpload = () => {
      setIsUploading(true);
      console.log('Upload batch started');
    };

    const onComplete = (result: UploadResult<{ type: string; }, Record<string, never>>) => {
      setIsUploading(false);
      console.log('Upload complete! Successful files:', result.successful);
      console.log('Failed files:', result.failed);
    };

    uppy.on('file-added', onFileAdded);
    uppy.on('upload-success', onUploadSuccess);
    uppy.on('upload-error', onUploadError);
    uppy.on('upload', onUpload);
    uppy.on('complete', onComplete);

    return () => {
      uppy.off('file-added', onFileAdded);
      uppy.off('upload-success', onUploadSuccess);
      uppy.off('upload-error', onUploadError);
      uppy.off('upload', onUpload);
      uppy.off('complete', onComplete);
    };
  }, [uppy]);

  // Utility functions
  const announceToScreenReader = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  const addFilesToUpload = useCallback((selectedFiles: File[], isFolder: boolean = false) => {
    // Filter files based on directory depth (max 2 levels) if it's a folder
    const validFiles = isFolder 
      ? selectedFiles.filter(file => {
          const path = file.webkitRelativePath || file.name;
          return isValidFileDepth(path, 3);
        })
      : selectedFiles;

    // Add files to Uppy with metadata
    validFiles.forEach((file) => {
      const relativePath = file.webkitRelativePath || file.name;
      const rootDirectory = extractRootDirectory(relativePath);
      const fileId = generateFileId(file.name, file.size);
      
      uppy.addFile({
        id: fileId,
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          originalFilename: file.name,
          rootDirectory: rootDirectory,
          relativePath: relativePath,
        } as any,
      });
    });

    // Announce to screen readers
    const message = `${validFiles.length} file${validFiles.length !== 1 ? 's' : ''} added to upload queue`;
    announceToScreenReader(message);
  }, [uppy]);

  // Handle folder selection
  const handleFolderSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const selectedFiles = Array.from(fileList);
    addFilesToUpload(selectedFiles, true);
  }, [addFilesToUpload]);

  // Handle individual file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const selectedFiles = Array.from(fileList);
    addFilesToUpload(selectedFiles, false);
  }, [addFilesToUpload]);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    addFilesToUpload(droppedFiles, false);
  }, [addFilesToUpload]);

  // Upload control handlers
  const handleStartUpload = useCallback(() => {
    if (files.length === 0) {
      return;
    }
    uppy.upload();
  }, [uppy, files.length]);

  const handlePauseUpload = useCallback(() => {
    uppy.cancelAll();
    setIsUploading(false);
  }, [uppy]);

  const handleClearAll = useCallback(() => {
    uppy.cancelAll();
    uppy.getFiles().forEach(file => uppy.removeFile(file.id));
    setIsUploading(false);
    
    const message = 'All files cleared from upload queue';
    announceToScreenReader(message);
  }, [uppy]);

  const handleCancelFile = useCallback((fileId: string) => {
    const uppyFile = uppy.getFile(fileId);
    if (!uppyFile) return;

    // Remove from Uppy
    uppy.removeFile(fileId);

    const message = `File "${uppyFile.name}" cancelled`;
    announceToScreenReader(message);
  }, [uppy]);

  // Calculate global progress and stats
  const globalProgress = totalProgress || 0;

  const completedFiles = useMemo(() => {
    return files.filter(f => f.status === 'done').length;
  }, [files]);

  const activeFiles = useMemo(() => {
    return files.length;
  }, [files]);

  return {
    files,
    isUploading,
    maxConcurrentUploads,
    setMaxConcurrentUploads: handleSetMaxConcurrentUploads,
    handleFolderSelect,
    handleFileSelect,
    handleDrop,
    handleStartUpload,
    handlePauseUpload,
    handleClearAll,
    handleCancelFile,
    liveRegionRef,
    globalProgress,
    completedFiles,
    activeFiles,
  };
}; 