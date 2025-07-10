import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export interface ButtonProps extends ChakraButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  children,
  ...props
}) => {
  const getColorScheme = () => {
    switch (variant) {
      case 'primary':
        return 'blue';
      case 'secondary':
        return 'gray';
      case 'danger':
        return 'red';
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  return (
    <ChakraButton
      colorScheme={getColorScheme()}
      size={size}
      width={isFullWidth ? 'full' : 'auto'}
      minW="120px"
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default React.memo(Button); 