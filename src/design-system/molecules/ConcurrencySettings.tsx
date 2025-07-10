import React, { useState, useCallback } from 'react';
import { 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  HStack, 
  VStack, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormHelperText,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { Text, Button } from '../atoms';

export interface ConcurrencySettingsProps {
  maxConcurrentUploads: number;
  onMaxConcurrentUploadsChange: (value: number) => void;
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const ConcurrencySettings: React.FC<ConcurrencySettingsProps> = ({
  maxConcurrentUploads,
  onMaxConcurrentUploadsChange,
  disabled = false,
  isOpen,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState(maxConcurrentUploads.toString());
  
  const handleInputChange = useCallback((valueString: string) => {
    setInputValue(valueString);
    
    const numValue = parseInt(valueString, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      onMaxConcurrentUploadsChange(numValue);
    }
  }, [onMaxConcurrentUploadsChange]);

  const handleInputBlur = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 10) {
      setInputValue(maxConcurrentUploads.toString());
    }
  }, [inputValue, maxConcurrentUploads]);

  const handleSave = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      onMaxConcurrentUploadsChange(numValue);
      onClose();
    }
  }, [inputValue, onMaxConcurrentUploadsChange, onClose]);

  // Update input value when prop changes
  React.useEffect(() => {
    setInputValue(maxConcurrentUploads.toString());
  }, [maxConcurrentUploads]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <SettingsIcon />
            <Text variant="heading" size="md">
              Upload Settings
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel htmlFor="concurrent-uploads">
                <Text variant="label" size="sm">
                  Maximum Concurrent Uploads
                </Text>
              </FormLabel>
              <NumberInput
                id="concurrent-uploads"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                min={1}
                max={10}
                step={1}
                isDisabled={disabled}
                size="md"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                <Text variant="caption" color="secondary">
                  Control how many files upload simultaneously. Higher values may improve speed but use more bandwidth.
                </Text>
              </FormHelperText>
            </FormControl>

            {/* Current Status */}
            <Box 
              p={3} 
              bg={useColorModeValue('blue.50', 'blue.900')} 
              borderRadius="md"
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
            >
              <Text variant="caption" color="primary" textAlign="center">
                Currently allowing up to {maxConcurrentUploads} concurrent upload{maxConcurrentUploads !== 1 ? 's' : ''}
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={disabled}
            >
              Save
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(ConcurrencySettings); 