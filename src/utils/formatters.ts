/**
 * Format file size in bytes to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Extract root directory from file path
 */
export const extractRootDirectory = (path: string): string => {
  const parts = path.split('/');
  return parts.length > 1 ? parts[0] : '';
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate unique ID for files
 */
export const generateFileId = (name: string, size: number): string => {
  return `${name}-${size}-${Date.now()}-${Math.random()}`;
};

/**
 * Check if file path exceeds maximum directory depth
 */
export const isValidFileDepth = (path: string, maxDepth: number = 3): boolean => {
  const pathParts = path.split('/');
  return pathParts.length <= maxDepth;
}; 