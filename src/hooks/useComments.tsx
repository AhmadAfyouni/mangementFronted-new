import { FileObject } from "@/components/common/atoms/departments/DeptAdditionalSection";
import FileUploadService from "@/services/fileUpload.service";
import { apiClient } from "@/utils/axios/usage";
import { useEffect, useRef, useState } from "react";

export interface Comment {
  id: string;
  author: {
    name: string;
  };
  content: string;
  createdAt: string;
  files?: string[];
}

const useComments = (taskId: string | undefined, isOpen: boolean) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState<string>("");
  const [attachedFile, setAttachedFile] = useState<FileObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch comments when the modal is open
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await apiClient.get<Comment[]>(`/comment/${taskId}`);
        setComments(response);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (isOpen && taskId) {
      fetchComments();
    }
  }, [isOpen, taskId]);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile({
        file: e.target.files[0],
        name: e.target.files[0].name,
      });
    }
  };

  const handleSendComment = async () => {
    if ((comment.trim() || attachedFile) && !isSubmitting) {
      setIsSubmitting(true);

      try {
        let path = "";
        if (attachedFile) {
          path = await FileUploadService.uploadSingleFile(
            attachedFile,
            "comments"
          );
        }

        const response = await apiClient.post<Comment>(`/comment`, {
          content: comment,
          files: path ? [path] : [],
          taskId,
        });

        setComments((prevComments) => [...prevComments, response]);
        setComment("");
        setAttachedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle viewing files
  const handleViewFile = async (filePath: string) => {
    try {
      setIsLoadingFile(filePath);

      // Open the file in a new tab
      window.open(filePath, "_blank");
    } catch (error) {
      console.error("Error opening file:", error);
    } finally {
      setIsLoadingFile(null);
    }
  };

  return {
    comments,
    comment,
    attachedFile,
    isSubmitting,
    isLoadingFile,
    setComment,
    handleFileChange,
    handleSendComment,
    handleViewFile,
    fileInputRef,
    setAttachedFile,
  };
};

export default useComments;
