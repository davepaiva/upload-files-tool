import React from 'react';
import { HStack } from '@chakra-ui/react';
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
    <HStack spacing={4} flexWrap="wrap" justify="center">
      <Button
        variant="success"
        size="lg"
        onClick={onStartUpload}
        disabled={disabled || isUploading}
        aria-label="Start uploading all files"
      >
        Start Upload
      </Button>
      
      <Button
        variant="warning"
        size="lg"
        onClick={onPauseUpload}
        disabled={disabled || !isUploading}
        aria-label={isUploading ? 'Pause upload' : 'Resume upload'}
      >
        {isUploading ? 'Pause' : 'Resume'}
      </Button>
      
      <Button
        variant="danger"
        size="lg"
        onClick={onClearAll}
        disabled={disabled || isUploading}
        aria-label="Clear all files from upload queue"
      >
        Clear All
      </Button>
    </HStack>
  );
};

export default React.memo(ControlButtons); 