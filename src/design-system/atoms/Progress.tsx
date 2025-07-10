import React from 'react';
import { Progress as ChakraProgress, ProgressProps as ChakraProgressProps } from '@chakra-ui/react';

export interface ProgressProps extends ChakraProgressProps {
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  value: number;
  max?: number;
  isIndeterminate?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  variant = 'primary',
  size = 'md',
  value,
  max = 100,
  isIndeterminate = false,
  ...props
}) => {
  const getColorScheme = () => {
    switch (variant) {
      case 'primary':
        return 'blue';
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <ChakraProgress
      value={value}
      max={max}
      size={size}
      colorScheme={getColorScheme()}
      borderRadius="full"
      isIndeterminate={isIndeterminate}
      {...props}
    />
  );
};

export default React.memo(Progress); 