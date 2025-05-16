import { useState, useRef, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useCustomQuery from "./useCustomQuery";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import useLanguage from "./useLanguage";
import { useQueryClient } from "@tanstack/react-query";
import FileUploadService from "@/services/fileUpload.service";
import { FileObject } from "@/types/FileManager.type";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  fileUrl?: string;
  author: {
    id: string;
    name: string;
  };
}

/**
 * Custom hook for managing comments functionality
 * @param taskId The ID of the task to get comments for
 * @param autoFetch Whether to automatically fetch comments on hook initialization
 */
const useComments = (taskId: string, autoFetch = true) => {
  const [comment, setComment] = useState<string>("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<string | null>(null);
  const [uploadingComment, setUploadingComment] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSnackbarConfig } = useMokkBar();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Get base URLs
  const baseServerUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const fileManagerServerUrl = process.env.NEXT_PUBLIC_FILE_STORAGE_URL || "";

  // Fetch comments for the task
  const {
    data: comments = [] as Comment[],
    refetch: refetchComments,
    isLoading: isLoadingComments
  } = useCustomQuery<Comment[]>({
    queryKey: ["comments", taskId],
    url: `/comment/${taskId}`,
    enabled: autoFetch,
  });

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  /**
   * Handle sending a new comment
   */
  const handleSendComment = async () => {
    if (!comment.trim() && !attachedFile) return;

    setIsSubmitting(true);
    setUploadingComment(true);

    try {
      const token = Cookies.get("access_token");
      let fileUrl: string | null = null;

      // If there's a file attachment, first upload it using FileUploadService
      if (attachedFile) {
        try {
          // Use the FileUploadService to get a public URL for the file
          fileUrl = await FileUploadService.uploadSingleFile(
            {
              file: attachedFile,
              name: attachedFile.name
            },
            "comments"
          );

          // Display success message for file upload
          setSnackbarConfig({
            message: t("File uploaded successfully"),
            open: true,
            severity: "success",
          });
        } catch (error) {
          console.error("Error uploading file:", error);
          setSnackbarConfig({
            message: t("Failed to upload file"),
            open: true,
            severity: "error",
          });
          setIsSubmitting(false);
          setUploadingComment(false);
          return;
        }
      }

      // Now send the comment with the file URL (if any)
      await axios.post(
        `${baseServerUrl}/comment`,
        {
          content: comment,
          taskId: taskId,
          fileUrl: fileUrl // Send the file URL instead of the actual file
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Clear state and refetch comments
      setComment("");
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });

      setSnackbarConfig({
        message: t("Comment added successfully"),
        open: true,
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending comment:", error);
      setSnackbarConfig({
        message: t("Failed to add comment"),
        open: true,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
      setUploadingComment(false);
    }
  };

  /**
   * Start editing a comment
   */
  const startEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId);
    setEditText(content);
  };

  /**
   * Cancel comment editing
   */
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditText("");
  };

  /**
   * Save comment edit
   */
  const saveCommentEdit = async (commentId: string) => {
    if (!editText.trim()) return;

    setIsSubmitting(true);
    try {
      const token = Cookies.get("access_token");

      // The URL should match the format shown in the network request
      await axios.put(
        `${baseServerUrl}/comment/${commentId}`,
        { content: editText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Clear editing state and refetch comments
      setEditingComment(null);
      setEditText("");

      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });

      setSnackbarConfig({
        message: t("Comment updated successfully"),
        open: true,
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      setSnackbarConfig({
        message: t("Failed to update comment"),
        open: true,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Delete a comment
   */
  const deleteComment = async (commentId: string) => {
    try {
      const token = Cookies.get("access_token");

      // Make sure we're using the correct URL structure
      await axios.delete(
        `${baseServerUrl}/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });

      setSnackbarConfig({
        message: t("Comment deleted successfully"),
        open: true,
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      setSnackbarConfig({
        message: t("Failed to delete comment"),
        open: true,
        severity: "error",
      });
    }
  };

  /**
   * View an attached file
   * This function handles both file management server URLs and base server URLs
   * Always opens files in a new browser window
   */
  const handleViewFile = async (fileUrl: string) => {
    // Set loading state using the file URL as the identifier
    setIsLoadingFile(fileUrl);

    try {
      // Check if this is a file from the file management server
      const isFileManagerUrl = fileUrl.includes(fileManagerServerUrl);

      if (isFileManagerUrl || fileUrl.startsWith('http')) {
        // File is already a direct URL - open it in a new window
        window.open(fileUrl, '_blank');
      } else {

        // Open in a new window with specific dimensions
        window.open(`${baseServerUrl}${fileUrl}`, '_blank');
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      setSnackbarConfig({
        message: t("Failed to view file"),
        open: true,
        severity: "error",
      });
    } finally {
      setIsLoadingFile(null);
    }
  };

  return {
    comments,
    comment,
    setComment,
    attachedFile,
    setAttachedFile,
    isSubmitting,
    isLoadingComments,
    isLoadingFile,
    uploadingComment,
    fileInputRef,
    handleFileChange,
    handleSendComment,
    handleViewFile,
    // New edit/delete functionality
    editingComment,
    editText,
    setEditText,
    startEditComment,
    cancelEditComment,
    saveCommentEdit,
    deleteComment,
    // Refetch function
    refetchComments
  };
};

export default useComments;