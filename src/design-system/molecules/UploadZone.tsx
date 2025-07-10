import React, { useCallback, useState } from 'react';
import { Box, VStack, HStack, useColorModeValue } from '@chakra-ui/react';
import { Text, Button } from '../atoms';

export interface UploadZoneProps {
  onFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent) => void;
  disabled?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  onFolderSelect,
  onFileSelect,
  onDrop,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dragOverBg = useColorModeValue('blue.50', 'blue.900');

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    
    if (!disabled) {
      onDrop(event);
    }
  }, [disabled, onDrop]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Focus on the folder input
      const folderInput = document.getElementById('folder-input');
      if (folderInput) {
        folderInput.click();
      }
    }
  }, []);

  return (
    <Box
      w="full"
      p={10}
      border="2px dashed"
      borderColor={dragOver ? 'blue.400' : borderColor}
      borderRadius="lg"
      bg={dragOver ? dragOverBg : bgColor}
      textAlign="center"
      _hover={!disabled ? {
        borderColor: 'blue.400',
        bg: dragOverBg,
      } : {}}
      transition="all 0.3s"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="Drag and drop files or folders here, or press Enter to choose folder"
      aria-disabled={disabled}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      opacity={disabled ? 0.6 : 1}
    >
      <VStack spacing={6}>
        <Text 
          variant="body" 
          size="lg" 
          color="secondary"
        >
          Drag and drop files or folders here
        </Text>
        
        <HStack spacing={4} flexWrap="wrap" justify="center">
          <Button
            as="label"
            htmlFor="folder-input"
            variant="primary"
            size="lg"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            disabled={disabled}
            aria-label="Choose folder to upload"
          >
            Choose Folder
          </Button>
          
          <input
            id="folder-input"
            type="file"
            {...({ webkitdirectory: '' } as any)}
            multiple
            onChange={onFolderSelect}
            disabled={disabled}
            style={{ display: 'none' }}
            aria-label="Select folder"
          />
          
          <Button
            as="label"
            htmlFor="file-input"
            variant="secondary"
            size="lg"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            disabled={disabled}
            aria-label="Choose individual files to upload"
          >
            Choose Files
          </Button>
          
          <input
            id="file-input"
            type="file"
            multiple
            onChange={onFileSelect}
            disabled={disabled}
            style={{ display: 'none' }}
            aria-label="Select files"
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default React.memo(UploadZone); 