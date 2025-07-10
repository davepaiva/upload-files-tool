import React from 'react';
import { Box, VStack, useColorModeValue } from '@chakra-ui/react';
import { 
  Text, 
  UploadZone, 
  ProgressBar, 
  ControlButtons, 
  FileTable 
} from '../design-system';
import { useFileUpload } from '../hooks/useFileUpload';

// Import Uppy styles
import '@uppy/core/dist/style.min.css';

const FileUploadTool: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  // Use the custom hook for file upload management
  const {
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
    activeFiles,
  } = useFileUpload();

  const hasFiles = files.length > 0;

  return (
    <Box minH="100vh" bg={bgColor} p={6}>
      <VStack spacing={8} maxW="1200px" mx="auto">
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <Text variant="heading" size="xl" color="primary">
            Bulk File Upload Tool
          </Text>
          <Text variant="body" size="lg" color="secondary">
            Upload multiple files and folders with drag-and-drop support
          </Text>
        </VStack>

        {/* Upload Zone */}
        <UploadZone
          onFolderSelect={handleFolderSelect}
          onFileSelect={handleFileSelect}
          onDrop={handleDrop}
          disabled={isUploading}
        />

        {/* Global Progress Bar */}
        {hasFiles && (
          <ProgressBar
            label="Overall Progress"
            value={globalProgress}
            additionalInfo={`${completedFiles} of ${activeFiles} files completed`}
            variant="primary"
            size="lg"
          />
        )}

        {/* Upload Controls */}
        <ControlButtons
          onStartUpload={handleStartUpload}
          onPauseUpload={handlePauseUpload}
          onClearAll={handleClearAll}
          isUploading={isUploading}
          hasFiles={hasFiles}
        />

        {/* File List Table */}
        <FileTable
          files={files}
          onCancelFile={handleCancelFile}
          emptyMessage="No files selected. Use the upload zone above to add files."
        />

        {/* ARIA Live Region for Screen Readers */}
        <Box
          ref={liveRegionRef}
          position="absolute"
          left="-10000px"
          top="auto"
          width="1px"
          height="1px"
          overflow="hidden"
          aria-live="polite"
          aria-atomic="true"
        />
      </VStack>
    </Box>
  );
};

export default FileUploadTool; 