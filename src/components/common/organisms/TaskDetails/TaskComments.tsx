import React, { useState } from "react";
import Image from "next/image";
import { MessageSquare, Paperclip, Send, Edit2, Trash2, X, Check, Download, User, AlertTriangle, Upload, FileText, ExternalLink } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import { formatDistanceToNow } from "date-fns";
import { enUS, ar } from "date-fns/locale";
import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  fileUrl?: string;
  author: {
    name: string,
    id: string,
  }
}

interface TaskCommentsProps {
  comments: Comment[];
  comment: string;
  setComment: (comment: string) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendComment: () => void;
  handleViewFile: (fileId: string) => void;
  isSubmitting: boolean;
  isLoadingFile: string | null;
  uploadingComment?: boolean;
  // New edit/delete functionality
  editingComment: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEditComment: (commentId: string, content: string) => void;
  cancelEditComment: () => void;
  saveCommentEdit: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
}

// Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  const { t } = useLanguage();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
        {/* Modal */}
        <div className="bg-secondary rounded-xl p-5 max-w-md w-full mx-4 border border-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4 text-danger">
            <AlertTriangle className="w-7 h-7" />
            <h3 className="text-xl font-bold text-twhite">{title}</h3>
          </div>

          <p className="text-tmid mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark hover:bg-darker text-twhite rounded-lg transition-colors"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-danger hover:bg-danger-600 text-white rounded-lg transition-colors"
            >
              {t("Delete")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// File Attachment Component 
const FileAttachment = ({
  fileUrl,
  fileName,
  isLoading,
  onViewFile,
  fileStorageUrl
}: {
  fileUrl: string;
  fileName?: string;
  isLoading: boolean;
  onViewFile: () => void;
  fileStorageUrl: string;
}) => {
  const { t } = useLanguage();
  const isFileManagerUrl = fileUrl.includes(fileStorageUrl);
  const displayName = fileName || fileUrl.split('/').pop() || t("Attached File");

  // Get file extension
  const fileExtension = displayName.split('.').pop()?.toLowerCase() || '';

  // Determine file type (for icon selection)
  let fileTypeIcon = <FileText className="w-5 h-5" />;
  if (['pdf'].includes(fileExtension)) {
    fileTypeIcon = <FileText className="w-5 h-5 text-red-400" />;
  } else if (['doc', 'docx'].includes(fileExtension)) {
    fileTypeIcon = <FileText className="w-5 h-5 text-blue-400" />;
  } else if (['xls', 'xlsx'].includes(fileExtension)) {
    fileTypeIcon = <FileText className="w-5 h-5 text-green-400" />;
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
    fileTypeIcon = <FileText className="w-5 h-5 text-purple-400" />;
  }

  return (
    <div className="mt-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-2">
        {fileTypeIcon}

        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="text-sm text-white font-medium truncate">
              {displayName}
            </span>
            {isFileManagerUrl && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-900 text-blue-300">
                {t("File Manager")}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400 truncate">
            {isFileManagerUrl
              ? t("Stored in file management system")
              : t("Legacy attachment")}
          </div>
        </div>

        <button
          onClick={onViewFile}
          className="p-2 bg-blue-800 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-1"
          disabled={isLoading}
          title={t("Open file")}
        >
          {isLoading ? (
            <PageSpinner size="small" />
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">{t("Open")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const TaskComments: React.FC<TaskCommentsProps> = ({
  comments,
  comment,
  setComment,
  attachedFile,
  setAttachedFile,
  fileInputRef,
  handleFileChange,
  handleSendComment,
  handleViewFile,
  isSubmitting,
  isLoadingFile,
  uploadingComment = false,
  // Edit/Delete props
  editingComment,
  editText,
  setEditText,
  startEditComment,
  cancelEditComment,
  saveCommentEdit,
  deleteComment,
}) => {
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";
  const { selector: userId } = useRedux(
    (state: RootState) => state.user.userInfo?.id
  );

  // Get the base server URL for attachment paths
  const baseServerUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const fileStorageUrl = process.env.NEXT_PUBLIC_FILE_STORAGE_URL || "";

  // State for the delete confirmation modal
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: currentLanguage === "ar" ? ar : enUS,
    });
  };

  return (
    <div className="bg-secondary rounded-xl p-5 border border-gray-700">
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        {t("Comments")}
      </h2>

      {/* Comments List */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {comments && comments.length > 0 ? (
          comments.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg ${item.author.id === userId ? "bg-primary/10 border border-primary/20" : "bg-dark border border-gray-700/30"}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-twhite">{item.author.name}</h3>
                    <span className="text-xs text-gray-400">
                      {getRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Comment Actions - Always visible */}
                {editingComment !== item.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditComment(item.id, item.content)}
                      className="p-1.5 text-blue-400 hover:bg-blue-900/20 hover:scale-110 rounded transition-all duration-200"
                      title={t("Edit")}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCommentToDelete(item.id)}
                      className="p-1.5 text-red-400 hover:bg-red-900/20 hover:scale-110 rounded transition-all duration-200"
                      title={t("Delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Edit Mode Actions */}
                {editingComment === item.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveCommentEdit(item.id)}
                      className="p-1.5 text-green-400 hover:bg-green-900/20 hover:scale-110 rounded transition-all duration-200"
                      title={t("Save")}
                      disabled={isSubmitting}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditComment}
                      className="p-1.5 text-gray-400 hover:bg-gray-700 hover:scale-110 rounded transition-all duration-200"
                      title={t("Cancel")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Content - Normal or Edit Mode */}
              {editingComment === item.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-dark border border-gray-700 rounded-md p-2 text-twhite resize-none min-h-[80px] focus:outline-none focus:border-primary"
                  placeholder={t("Edit your comment...")}
                  disabled={isSubmitting}
                />
              ) : (
                <p className="text-tmid whitespace-pre-wrap break-words">{item.content}</p>
              )}

              {/* Attached Files */}
              {item.fileUrl && (
                <div className="mt-3 space-y-2">
                  {
                    <FileAttachment
                      key={item.fileUrl}
                      fileUrl={item.fileUrl}
                      fileName={""}
                      isLoading={isLoadingFile === item.fileUrl}
                      onViewFile={() => handleViewFile(item.fileUrl + "")}
                      fileStorageUrl={fileStorageUrl}
                    />
                  }
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p>{t("No comments yet")}</p>
            <p className="text-sm mt-1">{t("Be the first to leave a comment")}</p>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className={`bg-dark p-4 rounded-lg ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex items-start gap-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-grow bg-secondary border border-gray-700 rounded-md p-3 text-twhite resize-none min-h-[80px] focus:outline-none focus:border-primary"
            placeholder={t("Write a comment...")}
            disabled={isSubmitting}
          />

          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 ${attachedFile ? 'bg-green-700' : 'bg-secondary hover:bg-primary/10'} text-primary rounded-md transition-colors`}
              title={attachedFile ? t("File selected") : t("Attach File")}
              disabled={isSubmitting || uploadingComment}
            >
              {attachedFile ? (
                <Check className="w-5 h-5 text-green-300" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleSendComment}
              className="p-2 bg-primary hover:bg-primary-600 text-twhite rounded-md transition-colors"
              disabled={isSubmitting || (!comment.trim() && !attachedFile) || uploadingComment}
              title={t("Send Comment")}
            >
              {isSubmitting || uploadingComment ? <PageSpinner size="small" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
          />
        </div>

        {/* File attachment preview */}
        {attachedFile && (
          <div className="mt-3 p-2 bg-gray-800 rounded-md flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" />
            <span className="text-sm text-twhite flex-grow truncate">
              {attachedFile.name}
            </span>
            <span className="text-xs text-gray-400">
              {(attachedFile.size / 1024).toFixed(1)} KB
            </span>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:bg-gray-700 rounded-full"
              title={t("Remove File")}
              disabled={uploadingComment}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}

        {/* Upload status message */}
        {uploadingComment && (
          <div className="mt-3 p-2 bg-blue-900/20 border border-blue-800 rounded-md flex items-center gap-2 text-blue-300">
            <Upload className="w-4 h-4" />
            <span className="text-sm">{t("Uploading file and sending comment...")}</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={commentToDelete !== null}
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => commentToDelete && deleteComment(commentToDelete)}
        title={t("Delete Comment")}
        message={t("Are you sure you want to delete this comment? This action cannot be undone.")}
      />
    </div>
  );
};