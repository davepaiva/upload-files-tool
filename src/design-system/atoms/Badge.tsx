import React from 'react';
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

export interface BadgeProps extends ChakraBadgeProps {
  variant?: 'queued' | 'uploading' | 'done' | 'error' | 'cancelled' | 'solid' | 'outline';
  status?: 'queued' | 'uploading' | 'done' | 'error' | 'cancelled';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'solid',
  status,
  children,
  ...props
}) => {
  const getColorScheme = () => {
    if (status) {
      switch (status) {
        case 'queued':
          return 'gray';
        case 'uploading':
          return 'blue';
        case 'done':
          return 'green';
        case 'error':
          return 'red';
        case 'cancelled':
          return 'orange';
        default:
          return 'gray';
      }
    }
    return 'blue';
  };

  return (
    <ChakraBadge
      colorScheme={getColorScheme()}
      variant={variant === 'outline' ? 'outline' : 'solid'}
      px={2}
      py={1}
      borderRadius="md"
      {...props}
    >
      {children}
    </ChakraBadge>
  );
};

export default React.memo(Badge); 