import React from 'react';
import { Box, VStack, IconButton, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { 
  Text, 
  UploadZone, 
  ProgressBar, 
  ControlButtons, 
  FileTable,
  ConcurrencySettings,
} from '../design-system';
import { useFileUpload } from '../hooks/useFileUpload';

// Import Uppy styles
import '@uppy/core/dist/style.min.css';

const FileUploadTool: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Use the custom hook for file upload management
  const {
    files,
    isUploading,
    maxConcurrentUploads,
    setMaxConcurrentUploads,
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
    <Box minH="100vh" bg={bgColor} p={6} position="relative">
      <VStack spacing={8} maxW="1200px" mx="auto">
        {/* Header with Settings Icon */}
        <Box w="full" position="relative">
          <VStack spacing={4} textAlign="center">
            <Text variant="heading" size="xl" color="primary">
              Bulk File Upload Tool
            </Text>
            <Text variant="body" size="lg" color="secondary">
              Upload multiple files and folders with drag-and-drop support
            </Text>
          </VStack>
          
          {/* Settings Icon in Top Right */}
          <IconButton
            aria-label="Open upload settings"
            icon={<SettingsIcon />}
            size="lg"
            variant="outline"
            colorScheme="gray"
            position="absolute"
            top={0}
            right={0}
            onClick={onOpen}
            disabled={isUploading}
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          />
        </Box>

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

      {/* Settings Modal */}
      <ConcurrencySettings
        maxConcurrentUploads={maxConcurrentUploads}
        onMaxConcurrentUploadsChange={setMaxConcurrentUploads}
        disabled={isUploading}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
};

export default FileUploadTool; 