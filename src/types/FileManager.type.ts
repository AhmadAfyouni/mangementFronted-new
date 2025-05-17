
// Base type for file objects from backend
export interface FileBase {
  _id: string;
  originalName: string;
  entityType: string; // 'department', 'employee', 'task'
  entityId: string;
  fileType: string; // 'supporting', 'template', 'program', etc.
  createdAt: string;
  updatedAt: string;
  currentVersion?: FileVersionBase;
}

// Base type for file version objects from backend
export interface FileVersionBase {
  _id: string;
  fileId?: string;
  fileUrl: string;
  originalName: string;
  version: number;
  fileType: string;
  isCurrentVersion: boolean;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  id?: string;
}

// Enhanced frontend types with additional helpers
export interface FileEntity extends FileBase {
  id: string;
}

export interface FileVersion extends FileVersionBase {
  id: string;
}

// Response for file upload operation
export interface FileUploadResponse {
  status: boolean;
  message: string;
  data: {
    fileId: string;
    versionId: string;
    version: number;
    fileUrl: string;
  };
}

// Response for file versions retrieval
export interface FileVersionsResponse {
  status: boolean;
  message: string;
  data: {
    versions: FileVersion[];
    total: number;
    current: FileVersion | undefined;
  };
}

// Response for setting current version
export interface SetCurrentVersionResponse {
  status: boolean;
  message: string;
  data: {
    versionId: string;
    version: number;
    fileUrl: string;
  };
}

// Response for files by entity retrieval
export interface FilesByEntityResponse {
  status: boolean;
  message: string;
  data: {
    files: FileEntity[];
    total: number;
  };
}

// Response for delete operations
export interface DeleteResponse {
  status: boolean;
  message: string;
}

// Input type for file upload
export interface FileUploadInput {
  fileUrl: string;
  originalName: string;
  entityType: string;
  entityId: string;
  fileType: string; // Changed from optional to required
  description?: string;
  createdBy?: string;
}

// Type for file upload with local file object
export interface FileUploadWithFile {
  file: Blob; // Using Blob which is parent of the browser's File type
  fileName: string; // Add fileName separately since we can't access file.name directly
  entityType: string;
  entityId: string;
  fileType: string; // Changed from optional to required
  description?: string;
}

// Type for file displayed in UI
export interface UIFile {
  id: string;
  name: string;
  url: string;
  version: number;
  uploadDate: string;
  fileType: string;
  description?: string;
  isCurrentVersion: boolean;
  versions?: UIFileVersion[];
}

// Type for file version displayed in UI
export interface UIFileVersion {
  id: string;
  version: number;
  url: string;
  uploadDate: string;
  isCurrentVersion: boolean;
  description?: string;
}

// Type for file objects in components
export interface FileObject {
  name: string;
  file: File;
}