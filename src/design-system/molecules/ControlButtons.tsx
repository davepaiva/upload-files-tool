import React from 'react';
import { Stack } from '@chakra-ui/react';
import { Button } from '../atoms';

export interface ControlButtonsProps {
  onStartUpload: () => void;
  onPauseUpload: () => void;
  onClearAll: () => void;
  isUploading: boolean;
  hasFiles: boolean;
  disabled?: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  onStartUpload,
  onPauseUpload,
  onClearAll,
  isUploading,
  hasFiles,
  disabled = false,
}) => {
  if (!hasFiles) {
    return null;
  }

  return (
    <Stack 
      direction={{ base: 'column', md: 'row' }} 
      spacing={4} 
      align="center"
      justify="center"
      w="full"
    >
      <Button
        variant="success"
        size="lg"
        onClick={onStartUpload}
        disabled={disabled || isUploading}
        aria-label="Start uploading all files"
        w={{ base: 'full', md: 'auto' }}
        maxW={{ base: '280px', md: 'none' }}
      >
        Start Upload
      </Button>
      
      <Button
        variant="warning"
        size="lg"
        onClick={onPauseUpload}
        disabled={disabled || !isUploading}
        aria-label={isUploading ? 'Pause upload' : 'Resume upload'}
        w={{ base: 'full', md: 'auto' }}
        maxW={{ base: '280px', md: 'none' }}
      >
        {isUploading ? 'Pause' : 'Resume'}
      </Button>
      
      <Button
        variant="danger"
        size="lg"
        onClick={onClearAll}
        disabled={disabled || isUploading}
        aria-label="Clear all files from upload queue"
        w={{ base: 'full', md: 'auto' }}
        maxW={{ base: '280px', md: 'none' }}
      >
        Clear All
      </Button>
    </Stack>
  );
};

export default React.memo(ControlButtons); 