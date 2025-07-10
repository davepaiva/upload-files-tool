import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { extractRootDirectory, generateFileId, isValidFileDepth } from '../utils/formatters';

export interface FileUploadItem {
  id: string;
  name: string;
  size: number;
  relativePath: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error' | 'cancelled';
  error?: string;
}

export interface UseFileUploadReturn {
  files: FileUploadItem[];
  isUploading: boolean;
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

export const useFileUpload = (): UseFileUploadReturn => {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Initialize Uppy instance
  const [uppy] = useState(() => 
    new Uppy({
      meta: { type: 'bulk-upload' },
      restrictions: {
        maxNumberOfFiles: 1000,
        allowedFileTypes: null,
      },
      autoProceed: false,
    })
    .use(XHRUpload, {
      endpoint: '/api/upload',
      fieldName: 'file',
      limit: 3,
      bundle: false,
      formData: true,
    })
  );

  // Set up Uppy event listeners
  useEffect(() => {
    const onUploadProgress = (file: any, progress: any) => {
      if (file?.id) {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: progress.percentage || 0, status: 'uploading' as const }
            : f
        ));
      }
    };

    const onUploadSuccess = (file: any) => {
      if (file?.id) {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: 100, status: 'done' as const }
            : f
        ));
      }
    };

    const onUploadError = (file: any, error: any) => {
      if (file?.id) {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error' as const, error: error.message }
            : f
        ));
      }
    };

    const onUpload = () => {
      setIsUploading(true);
    };

    const onComplete = () => {
      setIsUploading(false);
    };

    uppy.on('upload-progress', onUploadProgress);
    uppy.on('upload-success', onUploadSuccess);
    uppy.on('upload-error', onUploadError);
    uppy.on('upload', onUpload);
    uppy.on('complete', onComplete);

    return () => {
      uppy.off('upload-progress', onUploadProgress);
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

    // Create file upload items
    const fileItems: FileUploadItem[] = validFiles.map(file => ({
      id: generateFileId(file.name, file.size),
      name: file.name,
      size: file.size,
      relativePath: file.webkitRelativePath || file.name,
      progress: 0,
      status: 'queued' as const,
    }));

    // Add files to local state
    setFiles(prev => [...prev, ...fileItems]);

    // Add files to Uppy
    validFiles.forEach(file => {
      const relativePath = file.webkitRelativePath || file.name;
      const rootDirectory = extractRootDirectory(relativePath);
      
      uppy.addFile({
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

    toast({
      title: 'Files Added',
      description: message,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [uppy, toast]);

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
    // Only upload non-cancelled files
    const validFiles = files.filter(f => f.status !== 'cancelled');
    if (validFiles.length === 0) {
      toast({
        title: 'No Files to Upload',
        description: 'All files have been cancelled',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    uppy.upload();
  }, [uppy, files, toast]);

  const handlePauseUpload = useCallback(() => {
    uppy.cancelAll();
    setIsUploading(false);
  }, [uppy]);

  const handleClearAll = useCallback(() => {
    uppy.cancelAll();
    uppy.getFiles().forEach(file => uppy.removeFile(file.id));
    setFiles([]);
    setIsUploading(false);
    
    const message = 'All files cleared from upload queue';
    announceToScreenReader(message);

    toast({
      title: 'Queue Cleared',
      description: message,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [uppy, toast]);

  const handleCancelFile = useCallback((fileId: string) => {
    // Find the file in our local state
    const fileToCancel = files.find(f => f.id === fileId);
    if (!fileToCancel) return;

    // If file is currently uploading, cancel it in Uppy
    if (fileToCancel.status === 'uploading') {
      const uppyFile = uppy.getFile(fileId);
      if (uppyFile) {
        uppy.removeFile(fileId);
      }
    }

    // Update file status to cancelled
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'cancelled' as const, progress: 0 }
        : f
    ));

    // Remove from Uppy if still in queue
    try {
      const uppyFile = uppy.getFile(fileId);
      if (uppyFile) {
        uppy.removeFile(fileId);
      }
    } catch (error) {
      // File might not exist in Uppy anymore, which is fine
    }

    const message = `File "${fileToCancel.name}" cancelled`;
    announceToScreenReader(message);

    toast({
      title: 'File Cancelled',
      description: message,
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  }, [files, uppy, toast]);

  // Calculate global progress (excluding cancelled files)
  const activeFiles = files.filter(f => f.status !== 'cancelled');
  const globalProgress = activeFiles.length > 0 
    ? Math.round(activeFiles.reduce((sum, file) => sum + file.progress, 0) / activeFiles.length)
    : 0;

  const completedFiles = files.filter(f => f.status === 'done').length;

  return {
    files,
    isUploading,
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
    activeFiles: activeFiles.length,
  };
}; 