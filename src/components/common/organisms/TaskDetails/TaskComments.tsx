import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { AlertTriangle, Check, Edit2, ExternalLink, FileText, MessageSquare, Paperclip, Reply, Send, Trash2, Upload, User, X, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  fileUrl?: string;
  author: {
    name: string,
    id: string,
  }
  parentId?: string;
  replies?: Comment[];
  isReply?: boolean;
  parentAuthorName?: string;
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
  editingComment: string | null;
  editText: string;
  setEditText: (text: string) => void;
  startEditComment: (commentId: string, content: string) => void;
  cancelEditComment: () => void;
  saveCommentEdit: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  replyingTo: string | null;
  setReplyingTo: (commentId: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleSendReply: (parentId: string) => void;
}

// Enhanced Confirmation Modal Component
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
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {/* Enhanced Backdrop with animation */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-200">
        {/* Enhanced Modal */}
        <div className="bg-secondary rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700/50 shadow-2xl transform animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-twhite">{title}</h3>
              <p className="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-tmid mb-8 leading-relaxed">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-dark hover:bg-darker text-twhite rounded-xl transition-all duration-200 hover:scale-105 font-medium"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 bg-danger hover:bg-danger-600 text-white rounded-xl transition-all duration-200 hover:scale-105 font-medium shadow-lg hover:shadow-danger/25"
            >
              {t("Delete")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Enhanced Recursive Comment Component
const CommentItem = ({
  comment,
  level = 0,
  onReply,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  editingComment,
  editText,
  setEditText,
  isSubmitting,
  isLoadingFile,
  handleViewFile,
  fileStorageUrl,
  userId,
  t,
  getRelativeTime,
  renderTextWithLinks,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleSendReply,
  isRTL
}: {
  comment: Comment;
  level?: number;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onSaveEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  editingComment: string | null;
  editText: string;
  setEditText: (text: string) => void;
  isSubmitting: boolean;
  isLoadingFile: string | null;
  handleViewFile: (fileId: string) => void;
  fileStorageUrl: string;
  userId: string;
  t: (key: string) => string;
  getRelativeTime: (date: string) => string;
  renderTextWithLinks: (text: string) => React.ReactNode;
  replyingTo: string | null;
  setReplyingTo: (commentId: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleSendReply: (parentId: string) => void;
  isRTL: boolean;
}) => {
  const maxLevel = 3;
  const canReply = level < maxLevel && !comment.isReply;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isOwn = comment.author.id === userId;

  return (
    <div className={`group ${level > 0 ? 'ml-3 relative' : ''}`}>
      {/* Compact thread indicator */}
      {level > 0 && (
        <div className="absolute left-[-12px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent"></div>
      )}

      <div
        className={`relative p-2.5 rounded-xl transition-all duration-300 hover:shadow-lg ${isOwn
          ? "bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 shadow-primary/10"
          : "bg-dark border border-gray-700/40 hover:border-gray-600/60"
          } ${editingComment === comment.id ? 'ring-2 ring-primary/50' : ''}`}
      >
        {/* Compact Header with Content on Same Row */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* Compact Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-1 transition-all duration-200 flex-shrink-0 ${isOwn ? 'bg-primary/20 ring-primary/30' : 'bg-gray-700/50 ring-gray-600/30'
              }`}>
              <User className={`w-3.5 h-3.5 ${isOwn ? 'text-gray-400' : 'text-gray-300'}`} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className={`font-medium text-sm ${isOwn ? 'text-gray-400' : 'text-twhite'}`}>
                  {comment.author.name}
                </h3>
                {isOwn && (
                  <span className="px-1 py-0.5 text-xs font-medium bg-primary/20 text-gray-400 rounded-full">
                    {t("You")}
                  </span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  {getRelativeTime(comment.createdAt)}
                </span>
              </div>

              {/* Comment Content */}
              {editingComment === comment.id ? (
                <div className="relative">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-secondary border border-gray-600/50 rounded-lg p-2 text-twhite resize-none min-h-[40px] focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all duration-200 text-sm"
                    placeholder={t("Edit your comment...")}
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div>
                  {comment.isReply && comment.parentAuthorName && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-primary/10 px-1 py-0.5 rounded-md mb-1 border border-primary/20">
                      <Reply className="w-3 h-3" />
                      <span>{t("Replying to")} <span className="font-medium">{comment.parentAuthorName}</span></span>
                    </div>
                  )}
                  <p className="text-tmid whitespace-pre-wrap break-words leading-relaxed text-sm">
                    {renderTextWithLinks(comment.content)}
                  </p>
                </div>
              )}

              {/* Compact File Attachments */}
              {comment.fileUrl && (
                <div className="mt-1.5">
                  <FileAttachment
                    key={comment.fileUrl}
                    fileUrl={comment.fileUrl}
                    fileName={""}
                    isLoading={isLoadingFile === comment.fileUrl}
                    onViewFile={() => handleViewFile(comment.fileUrl || "")}
                    fileStorageUrl={fileStorageUrl}
                  />
                </div>
              )}

              {/* Compact Reply Input */}
              {replyingTo === comment.id && (
                <div className={`mt-1.5 bg-secondary p-2 rounded-lg border border-gray-600/30 ${isRTL ? "rtl" : "ltr"}`}>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-2 h-2 text-gray-400" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-dark border border-gray-600/50 rounded-lg p-1.5 text-twhite resize-none min-h-[35px] focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all duration-200 text-sm"
                        placeholder={t("Write a reply...")}
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-1.5 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-md transition-all duration-200 text-xs font-medium"
                          title={t("Cancel")}
                        >
                          {t("Cancel")}
                        </button>
                        <button
                          onClick={() => handleSendReply(comment.id)}
                          className="px-1.5 py-0.5 bg-primary hover:bg-primary-600 text-white rounded-md transition-all duration-200 disabled:opacity-50 flex items-center gap-1 text-xs font-medium"
                          disabled={isSubmitting || !replyText.trim()}
                          title={t("Send Reply")}
                        >
                          {isSubmitting ? <PageSpinner size="small" /> : <Send className="w-2.5 h-2.5" />}
                          {t("Reply")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Action Buttons */}
          {editingComment !== comment.id && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
              {canReply && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="p-1 text-emerald-400 hover:bg-emerald-900/20 hover:scale-110 rounded-lg transition-all duration-200"
                  title={t("Reply")}
                >
                  <Reply className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => onEdit(comment.id, comment.content)}
                className="p-1 text-gray-400 hover:bg-primary/20 hover:scale-110 rounded-lg transition-all duration-200"
                title={t("Edit")}
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1 text-red-400 hover:bg-red-900/30 hover:scale-110 rounded-lg transition-all duration-200"
                title={t("Delete")}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Compact Edit Mode Actions */}
          {editingComment === comment.id && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onSaveEdit(comment.id)}
                className="p-1 text-emerald-400 hover:bg-emerald-900/20 hover:scale-110 rounded-lg transition-all duration-200 disabled:opacity-50"
                title={t("Save")}
                disabled={isSubmitting}
              >
                {isSubmitting ? <PageSpinner size="small" /> : <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1 text-gray-400 hover:bg-gray-700/50 hover:scale-110 rounded-lg transition-all duration-200"
                title={t("Cancel")}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compact Replies Section */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {/* Compact collapsible replies header */}
          {comment.replies.length > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors duration-200 mb-1.5 ml-2"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{comment.replies.length} {comment.replies.length === 1 ? t("reply") : t("replies")}</span>
            </button>
          )}

          {!isCollapsed && (
            <div className="space-y-2 animate-in slide-in-from-top duration-200">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  level={level + 1}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  editingComment={editingComment}
                  editText={editText}
                  setEditText={setEditText}
                  isSubmitting={isSubmitting}
                  isLoadingFile={isLoadingFile}
                  handleViewFile={handleViewFile}
                  fileStorageUrl={fileStorageUrl}
                  userId={userId || ""}
                  t={t}
                  getRelativeTime={getRelativeTime}
                  renderTextWithLinks={renderTextWithLinks}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handleSendReply={handleSendReply}
                  isRTL={isRTL}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced File Attachment Component 
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
  const fileExtension = displayName.split('.').pop()?.toLowerCase() || '';

  // Enhanced file type icons with colors
  const getFileIcon = () => {
    if (['pdf'].includes(fileExtension)) {
      return <FileText className="w-5 h-5 text-red-400" />;
    } else if (['doc', 'docx'].includes(fileExtension)) {
      return <FileText className="w-5 h-5 text-blue-400" />;
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      return <FileText className="w-5 h-5 text-green-400" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return <FileText className="w-5 h-5 text-purple-400" />;
    }
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="group p-2.5 bg-gradient-to-r from-gray-800/30 to-gray-800/10 rounded-lg border border-gray-700/40 hover:border-gray-600/60 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          {getFileIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-white font-medium truncate">
              {displayName}
            </span>
            {isFileManagerUrl && (
              <span className="px-1.5 py-0.5 text-xs rounded-md bg-primary/20 text-gray-400 border border-primary/30">
                {t("Managed")}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400">
            {isFileManagerUrl
              ? t("Stored in file management system")
              : t("Legacy attachment")}
          </div>
        </div>

        <button
          onClick={onViewFile}
          className="px-2.5 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-gray-400 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105 disabled:opacity-50"
          disabled={isLoading}
          title={t("Open file")}
        >
          {isLoading ? (
            <PageSpinner size="small" />
          ) : (
            <>
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline text-xs font-medium">{t("Open")}</span>
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
  editingComment,
  editText,
  setEditText,
  startEditComment,
  cancelEditComment,
  saveCommentEdit,
  deleteComment,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleSendReply,
}) => {
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";
  const { selector: userId } = useRedux(
    (state: RootState) => state.user.userInfo?.id
  );

  const fileStorageUrl = process.env.NEXT_PUBLIC_FILE_STORAGE_URL || "";
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-400/80 underline break-all transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: currentLanguage === "ar" ? ar : enUS,
    });
  };

  return (
    <div className="bg-secondary rounded-2xl p-6 border border-gray-700/50 shadow-xl">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-twhite flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-gray-400" />
          </div>
          {t("Comments")}
          {comments && comments.length > 0 && (
            <span className="px-2 py-0.5 bg-primary/20 text-gray-400 rounded-md text-sm font-medium">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {/* Compact Comments List */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {comments && comments.length > 0 ? (
          comments.map((item) => (
            <CommentItem
              key={item.id}
              comment={item}
              level={0}
              onReply={setReplyingTo}
              onEdit={startEditComment}
              onDelete={(commentId) => setCommentToDelete(commentId)}
              onSaveEdit={saveCommentEdit}
              onCancelEdit={cancelEditComment}
              editingComment={editingComment}
              editText={editText}
              setEditText={setEditText}
              isSubmitting={isSubmitting}
              isLoadingFile={isLoadingFile}
              handleViewFile={handleViewFile}
              fileStorageUrl={fileStorageUrl}
              userId={userId || ""}
              t={t}
              getRelativeTime={getRelativeTime}
              renderTextWithLinks={renderTextWithLinks}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleSendReply={handleSendReply}
              isRTL={isRTL}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 opacity-30" />
            </div>
            <h3 className="text-base font-medium text-gray-400 mb-1">{t("No comments yet")}</h3>
            <p className="text-sm text-gray-500">{t("Be the first to leave a comment")}</p>
          </div>
        )}
      </div>

      {/* Compact Comment Input */}
      <div className={`bg-dark p-4 rounded-xl border border-gray-700/40 ${isRTL ? "rtl" : "ltr"}`}>
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex-grow space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-secondary border border-gray-600/50 rounded-lg p-3 text-twhite resize-none min-h-[70px] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 placeholder-gray-400 text-sm"
              placeholder={t("Write a comment...")}
              disabled={isSubmitting}
            />

            {/* File attachment preview */}
            {attachedFile && (
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center">
                    <Paperclip className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-sm text-twhite font-medium truncate block">
                      {attachedFile.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(attachedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="p-1.5 hover:bg-gray-700/50 rounded-md transition-all duration-200"
                    title={t("Remove File")}
                    disabled={uploadingComment}
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload status message */}
            {uploadingComment && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2 text-blue-300">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">{t("Uploading file and sending comment...")}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${attachedFile
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70 hover:text-gray-300'
                  }`}
                title={attachedFile ? t("File selected") : t("Attach File")}
                disabled={isSubmitting || uploadingComment}
              >
                {attachedFile ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {attachedFile ? t("File attached") : t("Attach file")}
                </span>
              </button>

              <button
                onClick={handleSendComment}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 font-medium text-sm"
                disabled={isSubmitting || (!comment.trim() && !attachedFile) || uploadingComment}
                title={t("Send Comment")}
              >
                {isSubmitting || uploadingComment ? (
                  <PageSpinner size="small" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{t("Send")}</span>
              </button>
            </div>
          </div>

          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
          />
        </div>
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