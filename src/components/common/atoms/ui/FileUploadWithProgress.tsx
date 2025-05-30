import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import FileUploadService from '@/services/fileUpload.service';
import useLanguage from '@/hooks/useLanguage';

interface FileUploadWithProgressProps {
    onUploadComplete: (fileUrl: string) => void;
    onUploadError?: (error: string) => void;
    acceptedFileTypes?: string;
    maxFileSize?: number; // in MB
    uploadPath: string;
    currentFileUrl?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

const FileUploadWithProgress: React.FC<FileUploadWithProgressProps> = ({
    onUploadComplete,
    onUploadError,
    acceptedFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.zip,.rar",
    maxFileSize = 10,
    uploadPath,
    currentFileUrl,
    placeholder,
    disabled = false,
    className = ""
}) => {
    const { t } = useLanguage();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFileName, setUploadedFileName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
            const errorMsg = t(`File size must be less than ${maxFileSize}MB`);
            setError(errorMsg);
            onUploadError?.(errorMsg);
            return;
        }

        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedFileTypes.includes(fileExtension)) {
            const errorMsg = t('File type not supported');
            setError(errorMsg);
            onUploadError?.(errorMsg);
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(0);
        setUploadedFileName(file.name);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + Math.random() * 15;
                    return newProgress >= 90 ? 90 : newProgress;
                });
            }, 200);

            // Upload the file
            const fileUrl = await FileUploadService.uploadSingleFile(
                { file, name: file.name },
                uploadPath
            );

            // Complete the progress
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Call the completion callback
            onUploadComplete(fileUrl);

            // Reset state after a short delay
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 1000);

        } catch (error) {
            console.error('File upload failed:', error);
            const errorMsg = t('File upload failed. Please try again.');
            setError(errorMsg);
            setIsUploading(false);
            setUploadProgress(0);
            setUploadedFileName('');
            onUploadError?.(errorMsg);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = () => {
        setUploadedFileName('');
        setError('');
        onUploadComplete('');
    };

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    const hasFile = currentFileUrl || uploadedFileName;
    const fileName = uploadedFileName || (currentFileUrl ? currentFileUrl.split('/').pop() : '');

    return (
        <div className={`space-y-2 ${className}`}>
            <div
                onClick={handleClick}
                className={`
          relative w-full p-4 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${disabled
                        ? 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
                        : hasFile
                            ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30'
                            : 'border-gray-600 bg-main hover:border-blue-500 hover:bg-blue-900/20'
                    }
          ${error ? 'border-red-500 bg-red-900/20' : ''}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFileTypes}
                    onChange={handleFileSelect}
                    disabled={disabled || isUploading}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center">
                            <Upload className="w-6 h-6 text-blue-400 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-blue-400 mb-2">
                                {t('Uploading')} {uploadedFileName}...
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {Math.round(uploadProgress)}%
                            </p>
                        </div>
                    </div>
                ) : hasFile ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                                <p className="text-sm text-twhite font-medium truncate max-w-xs">
                                    {fileName}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {t('File uploaded successfully')}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile();
                            }}
                            className="p-1 rounded-full hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors"
                            title={t('Remove file')}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            {error ? (
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            ) : (
                                <Upload className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <p className="text-sm text-gray-300 mb-1">
                            {placeholder || t('Click to upload file')}
                        </p>
                        <p className="text-xs text-gray-500">
                            {t('Max size')}: {maxFileSize}MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FileUploadWithProgress; 