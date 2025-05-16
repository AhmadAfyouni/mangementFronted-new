import React, { useState } from 'react';
import { PaperClipIcon } from '@/assets';
import Image from 'next/image';
import { useFileManager } from '@/hooks/useFileManager';
import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import useSnackbar from '@/hooks/useSnackbar';
import { FileManager } from '@/components/common/atoms/fileManager';
import { TaskFormInputs } from "@/types/Task.type";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface TaskFilesProps {
  register: UseFormRegister<TaskFormInputs>;
  errors: FieldErrors<TaskFormInputs>;
  isLightMode: boolean;
  t: (key: string) => string;
  setValue: UseFormSetValue<TaskFormInputs>;
  taskId?: string;
}

const TaskFiles: React.FC<TaskFilesProps> = ({
  register,
  errors,
  isLightMode,
  t,
  setValue,
  taskId
}) => {
  // Register files array in the form
  register("files");

  // Handle file upload completion
  const handleUploadComplete = (fileId: string, fileUrl: string) => {
    // Update form value
    const currentFiles = Array.isArray(setValue("files")) ? setValue("files") : [];
    setValue("files", [...currentFiles, fileUrl]);
  };

  if (!taskId) {
    // If no taskId is available (new task), use our existing FileUploadSection
    return (
      <div className="bg-dark p-4 rounded-lg">
        <h3 className="font-semibold text-twhite mb-3">{t("Attachments")}</h3>
        <p className="text-sm text-tdark">
          {t("Save the task first to enable file upload management")}
        </p>
      </div>
    );
  }

  // If taskId is available, use our new FileManager component
  return (
    <FileManager
      entityType="task"
      entityId={taskId}
      title={t("Attachments")}
      description={t("Task related files")}
      onUploadComplete={handleUploadComplete}
      acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
    />
  );
};

export default TaskFiles;