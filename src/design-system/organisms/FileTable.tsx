import React from 'react';
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  TableContainer, 
  useColorModeValue 
} from '@chakra-ui/react';
import { FileRow, FileRowProps } from '../molecules';
import { Text } from '../atoms';

export interface FileTableProps {
  files: FileRowProps[];
  onFileRowClick?: (id: string) => void;
  onCancelFile?: (id: string) => void;
  emptyMessage?: string;
}

const FileTable: React.FC<FileTableProps> = ({
  files,
  onFileRowClick,
  onCancelFile,
  emptyMessage = 'No files selected',
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');

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
      <TableContainer>
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>
                <Text variant="label" size="sm">
                  Relative Path
                </Text>
              </Th>
              <Th>
                <Text variant="label" size="sm">
                  Size
                </Text>
              </Th>
              <Th>
                <Text variant="label" size="sm">
                  Status
                </Text>
              </Th>
              <Th>
                <Text variant="label" size="sm">
                  Progress
                </Text>
              </Th>
              <Th>
                <Text variant="label" size="sm">
                  Actions
                </Text>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {files.map((file) => (
              <FileRow
                key={file.id}
                {...file}
                onRowClick={onFileRowClick}
                onCancel={onCancelFile}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(FileTable); 