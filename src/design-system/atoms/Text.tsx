import React from 'react';
import { Text as ChakraText, Heading, TextProps as ChakraTextProps, HeadingProps } from '@chakra-ui/react';

export interface TextProps extends ChakraTextProps {
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  size = 'md',
  color = 'primary',
  children,
  ...props
}) => {
  const getColor = () => {
    switch (color) {
      case 'primary':
        return 'gray.700';
      case 'secondary':
        return 'gray.600';
      case 'muted':
        return 'gray.500';
      case 'error':
        return 'red.500';
      case 'success':
        return 'green.500';
      case 'warning':
        return 'yellow.500';
      default:
        return 'gray.700';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'xs':
        return 'xs';
      case 'sm':
        return 'sm';
      case 'md':
        return 'md';
      case 'lg':
        return 'lg';
      case 'xl':
        return 'xl';
      case '2xl':
        return '2xl';
      default:
        return 'md';
    }
  };

  if (variant === 'heading') {
    return (
      <Heading
        size={getSize()}
        color={getColor()}
        {...(props as HeadingProps)}
      >
        {children}
      </Heading>
    );
  }

  return (
    <ChakraText
      fontSize={getSize()}
      color={getColor()}
      fontWeight={variant === 'label' ? 'semibold' : 'normal'}
      {...props}
    >
      {children}
    </ChakraText>
  );
};

export default React.memo(Text); 