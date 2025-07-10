import React from 'react';
import { Box, VStack, Flex, useColorModeValue } from '@chakra-ui/react';
import { Text, Progress } from '../atoms';

export interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  additionalInfo?: string;
  isIndeterminate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  showPercentage = true,
  variant = 'primary',
  size = 'md',
  additionalInfo,
  isIndeterminate = false,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const percentage = Math.round((value / max) * 100);

  return (
    <Box 
      w="full" 
      p={6} 
      bg={cardBg} 
      borderRadius="lg" 
      shadow="sm"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={`${percentage}% complete`}
    >
      <VStack spacing={4}>
        <Flex w="full" justify="space-between" align="center" flexWrap="wrap">
          <Text variant="label" size="md">
            {label}
          </Text>
          {showPercentage && (
            <Text variant="body" color="secondary" size="sm">
              {percentage}%
            </Text>
          )}
        </Flex>
        
        {additionalInfo && (
          <Flex w="full" justify="flex-end">
            <Text variant="caption" color="muted" size="sm">
              {additionalInfo}
            </Text>
          </Flex>
        )}
        
        <Progress 
          value={value}
          max={max}
          variant={variant}
          size={size}
          w="full"
          isIndeterminate={isIndeterminate}
        />
      </VStack>
    </Box>
  );
};

export default React.memo(ProgressBar); 