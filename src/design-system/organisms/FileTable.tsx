import React, { useMemo } from 'react';
import { 
  Box, 
  Grid, 
  useColorModeValue,
  HStack,
  IconButton
} from '@chakra-ui/react';
import { FixedSizeList as List } from 'react-window';
import { FileRowProps } from '../molecules';
import { Text, Progress, Badge } from '../atoms';
import { CloseIcon } from '@chakra-ui/icons';
import { formatFileSize, capitalize } from '../../utils/formatters';

export interface FileTableProps {
  files: FileRowProps[];
  onFileRowClick?: (id: string) => void;
  onCancelFile?: (id: string) => void;
  emptyMessage?: string;
}

// Row height in pixels
const ROW_HEIGHT = 60;

interface VirtualizedRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    files: FileRowProps[];
    onFileRowClick?: (id: string) => void;
    onCancelFile?: (id: string) => void;
  };
}

const VirtualizedRow: React.FC<VirtualizedRowProps> = ({ index, style, data }) => {
  const { files, onFileRowClick, onCancelFile } = data;
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const file = files[index];
  
  if (!file) return null;

  const handleRowClick = () => {
    if (onFileRowClick) {
      onFileRowClick(file.id);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancelFile) {
      onCancelFile(file.id);
    }
  };

  const canCancel = file.status === 'queued' || file.status === 'uploading';

  return (
    <div style={style}>
      <Grid
        templateColumns="2fr 1fr 1fr 2fr 80px"
        gap={4}
        p={3}
        _hover={{ bg: hoverBg }}
        cursor={onFileRowClick ? 'pointer' : 'default'}
        onClick={handleRowClick}
        tabIndex={onFileRowClick ? 0 : undefined}
        role={onFileRowClick ? 'button' : 'row'}
        aria-label={onFileRowClick ? `File: ${file.name}` : undefined}
        onKeyDown={(e) => {
          if (onFileRowClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleRowClick();
          }
        }}
        borderBottom="1px"
        borderColor={borderColor}
        alignItems="center"
      >
        {/* Relative Path */}
        <Box>
          <Text
            isTruncated
            title={file.relativePath}
            variant="body"
            size="sm"
          >
            {file.relativePath}
          </Text>
        </Box>
        
        {/* Size */}
        <Box>
          <Text variant="body" size="sm">
            {formatFileSize(file.size)}
          </Text>
        </Box>
        
        {/* Status */}
        <Box>
          <Badge status={file.status}>
            {capitalize(file.status)}
          </Badge>
          {file.error && (
            <Text variant="caption" color="error" fontSize="xs" mt={1}>
              {file.error}
            </Text>
          )}
        </Box>
        
        {/* Progress */}
        <Box>
          <HStack spacing={3}>
            <Progress 
              value={file.progress}
              variant={file.status === 'error' ? 'error' : 'primary'}
              size="sm"
              flex={1}
            />
            <Text variant="caption" color="secondary" size="sm" minW="40px">
              {file.progress}%
            </Text>
          </HStack>
        </Box>
        
        {/* Actions */}
        <Box>
          {canCancel && (
            <IconButton
              aria-label={`Cancel upload of ${file.name}`}
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
        </Box>
      </Grid>
    </div>
  );
};

const FileTable: React.FC<FileTableProps> = ({
  files,
  onFileRowClick,
  onCancelFile,
  emptyMessage = 'No files selected',
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const itemData = useMemo(() => ({
    files,
    onFileRowClick,
    onCancelFile,
  }), [files, onFileRowClick, onCancelFile]);

  // Calculate total height needed for all rows
  const totalHeight = useMemo(() => {
    return files.length * ROW_HEIGHT;
  }, [files.length]);

  if (files.length === 0) {
    return (
      <Box 
        w="full" 
        p={8} 
        bg={cardBg} 
        borderRadius="lg" 
        shadow="sm" 
        textAlign="center"
      >
        <Text variant="body" color="muted" size="md">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box 
      w="full" 
      bg={cardBg} 
      borderRadius="lg" 
      shadow="sm" 
      overflow="hidden"
      role="table"
      aria-label="File upload status table"
    >
      {/* Table Header */}
      <Grid
        templateColumns="2fr 1fr 1fr 2fr 80px"
        gap={4}
        p={3}
        bg={headerBg}
        borderBottom="2px"
        borderColor={borderColor}
        fontWeight="semibold"
      >
        <Box>
          <Text variant="label" size="sm">
            Relative Path
          </Text>
        </Box>
        <Box>
          <Text variant="label" size="sm">
            Size
          </Text>
        </Box>
        <Box>
          <Text variant="label" size="sm">
            Status
          </Text>
        </Box>
        <Box>
          <Text variant="label" size="sm">
            Progress
          </Text>
        </Box>
        <Box>
          <Text variant="label" size="sm">
            Actions
          </Text>
        </Box>
      </Grid>

      {/* Virtualized List Container - No fixed height, grows with content */}
      <Box 
        role="rowgroup"
        aria-label={`${files.length} files`}
      >
        <List
          height={totalHeight}
          itemCount={files.length}
          itemSize={ROW_HEIGHT}
          itemData={itemData}
          width="100%"
          overscanCount={5}
        >
          {VirtualizedRow}
        </List>
      </Box>
    </Box>
  );
};

export default React.memo(FileTable); 