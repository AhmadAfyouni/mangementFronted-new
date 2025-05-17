import { FileManager } from '@/components/common/atoms/fileManager';
import { TaskFormInputs } from "@/types/Task.type";
import React from 'react';
import { UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface TaskFilesProps {
  register: UseFormRegister<TaskFormInputs>;
  t: (key: string) => string;
  setValue: UseFormSetValue<TaskFormInputs>;
  getValues: UseFormGetValues<TaskFormInputs>;
  taskId?: string;
}

const TaskFiles: React.FC<TaskFilesProps> = ({
  register,
  t,
  setValue,
  getValues,
  taskId
}) => {
  // Register files array in the form
  register("files");

  // Handle file upload completion
  const handleUploadComplete = (fileId: string, fileUrl: string) => {
    // Get the current files from the form
    const currentFiles = getValues("files") || [];

    // Update form value with new file URL
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
      fileType=''
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