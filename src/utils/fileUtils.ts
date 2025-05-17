/**
 * Utility functions for file operations
 */

/**
 * Checks if a file URL is from our file manager system
 * @param fileUrl - The URL to check
 * @returns True if the URL is from our file manager, false otherwise
 */
export const isFileManagerUrl = (fileUrl: string): boolean => {
  const fileManagerUrl = process.env.NEXT_PUBLIC_FILE_STORAGE_URL || '';
  // Use Boolean() to ensure the return type is always boolean
  return Boolean(fileUrl && fileUrl.startsWith(fileManagerUrl));
};

/**
 * Extracts the file name from a URL
 * @param fileUrl - The URL to extract the file name from
 * @returns The file name or the original URL if it couldn't be extracted
 */
export const getFileNameFromUrl = (fileUrl: string): string => {
  if (!fileUrl) return '';
  
  try {
    // Try to get the file name from the URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    return fileName || fileUrl;
  } catch (error) {
    console.error('Error extracting file name from URL:', error);
    return fileUrl;
  }
};
