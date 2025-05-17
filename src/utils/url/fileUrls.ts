/**
 * URL utilities for file URLs
 */

/**
 * Constructs a proper file URL by adding the base URL if needed
 * @param fileUrl - The file URL or path
 * @returns The complete file URL
 */
export const constructFileUrl = (fileUrl: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Return the URL as is if it's already a complete URL
  if (fileUrl && fileUrl.startsWith('http')) {
    return fileUrl;
  }

  // Ensure correct formatting between base URL and file path
  if (!fileUrl) return '';

  return fileUrl.startsWith('/')
    ? `${baseUrl}${fileUrl}`
    : `${baseUrl}/${fileUrl}`;
};

/**
 * Determines if a file URL is from the file management system
 * @param fileUrl - The file URL to check
 * @returns Boolean indicating if the URL is from the file management system
 */
export const isFileManagerUrl = (fileUrl: string): boolean => {
  const fileManagerUrl = process.env.NEXT_PUBLIC_FILE_STORAGE_URL || '';
  return Boolean(fileUrl && fileUrl.startsWith(fileManagerUrl));
};

/**
 * Extracts a filename from a file URL or path
 * @param fileUrl - The file URL or path
 * @returns The extracted filename
 */
export const getFilenameFromUrl = (fileUrl: string): string => {
  if (!fileUrl) return 'Unknown File';

  // Extract the filename from the URL path
  const parts = fileUrl.split('/');
  let filename = parts[parts.length - 1];

  // Remove any query parameters
  if (filename.includes('?')) {
    filename = filename.split('?')[0];
  }

  return decodeURIComponent(filename);
};
