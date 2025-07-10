import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import FileUploadTool from './components/FileUploadTool';

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <FileUploadTool />
    </ChakraProvider>
  );
};

export default App;
