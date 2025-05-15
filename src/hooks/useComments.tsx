import { useState, useRef, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import useCustomQuery from "./useCustomQuery";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import useLanguage from "./useLanguage";
import { useQueryClient } from "@tanstack/react-query";

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  files?: string[];
  fileNames?: string[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSnackbarConfig } = useMokkBar();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

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
    try {
      const token = Cookies.get("access_token");
      
      // If there's a file attachment, use FormData
      if (attachedFile) {
        const formData = new FormData();
        formData.append("content", comment);
        formData.append("taskId", taskId);
        formData.append("file", attachedFile);
        
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/comment`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // For text-only comments, use JSON
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/comment`,
          {
            content: comment,
            taskId: taskId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

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
        `${process.env.NEXT_PUBLIC_BASE_URL}/comment/${commentId}`,
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/comment/${commentId}`,
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
   */
  const handleViewFile = async (fileId: string) => {
    setIsLoadingFile(fileId);
    try {
      const token = Cookies.get("access_token");
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/attachments/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Create URL for file and open in new tab
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();
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
