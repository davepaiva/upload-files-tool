import React from 'react';
import { Tr, Td, HStack, useColorModeValue, IconButton } from '@chakra-ui/react';
import { Text, Progress, Badge } from '../atoms';
import { formatFileSize, capitalize } from '../../utils/formatters';
import { CloseIcon } from '@chakra-ui/icons';

export interface FileRowProps {
  id: string;
  name: string;
  size: number;
  relativePath: string;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error' | 'cancelled';
  error?: string;
  onRowClick?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const FileRow: React.FC<FileRowProps> = ({
  id,
  name,
  size,
  relativePath,
  progress,
  status,
  error,
  onRowClick,
  onCancel,
}) => {
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(id);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancel) {
      onCancel(id);
    }
  };

  const canCancel = status === 'queued' || status === 'uploading';

  return (
    <Tr
      _hover={{ bg: hoverBg }}
      cursor={onRowClick ? 'pointer' : 'default'}
      onClick={handleRowClick}
      tabIndex={onRowClick ? 0 : undefined}
      role={onRowClick ? 'button' : undefined}
      aria-label={onRowClick ? `File: ${name}` : undefined}
      onKeyDown={(e) => {
        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      <Td maxW="300px">
        <Text
          isTruncated
          title={relativePath}
          variant="body"
          size="sm"
        >
          {relativePath}
        </Text>
      </Td>
      <Td>
        <Text variant="body" size="sm">
          {formatFileSize(size)}
        </Text>
      </Td>
      <Td>
        <Badge status={status}>
          {capitalize(status)}
        </Badge>
        {error && (
          <Text variant="caption" color="error" fontSize="xs" mt={1}>
            {error}
          </Text>
        )}
      </Td>
      <Td>
        <HStack spacing={3}>
          <Progress 
            value={progress}
            variant={status === 'error' ? 'error' : 'primary'}
            size="sm"
            flex={1}
          />
          <Text variant="caption" color="secondary" size="sm" minW="40px">
            {progress}%
          </Text>
        </HStack>
      </Td>
      <Td>
        {canCancel && (
          <IconButton
            aria-label={`Cancel upload of ${name}`}
            icon={<CloseIcon />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={handleCancel}
            minW="unset"
            h={6}
            w={6}
          />
        )}
      </Td>
    </Tr>
  );
};

export default React.memo(FileRow); 