import { formatDate } from "@/services/task.service";
import useLanguage from "@/hooks/useLanguage";
import { MessageSquare, Paperclip, Send } from "lucide-react";

interface Comment {
  author: { name: string };
  createdAt: string;
  content?: string;
  files?: string[];
}

interface TaskCommentsProps {
  comments: Comment[];
  comment: string;
  setComment: (value: string) => void;
  attachedFile?: any;
  setAttachedFile: (file: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendComment: () => void;
  handleViewFile: (file: string) => void;
  isSubmitting: boolean;
}

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
}) => {
  const { t, currentLanguage } = useLanguage();

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-green-400" />
        {t("Comments")}
      </h2>

      {/* Add Comment */}
      <div className="mb-6">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-4 bg-dark rounded-lg text-twhite border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors mb-3"
          rows={3}
          placeholder={t("Add a comment...")}
          disabled={isSubmitting}
        />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="attach-file"
              disabled={isSubmitting}
            />
            <label
              htmlFor="attach-file"
              className={`flex items-center text-twhite  gap-2 px-4 py-2 bg-dark rounded-lg cursor-pointer hover:bg-gray-700 transition-colors ${isSubmitting ? 'opacity-50' : ''
                }`}
            >
              <Paperclip className="w-4 h-4" />
              {t("Attach File")}
            </label>

            {attachedFile && (
              <div className="flex items-center gap-2 px-3 py-1 bg-dark rounded-lg">
                <span className="text-sm text-gray-400">{attachedFile.name}</span>
                <button
                  onClick={() => {
                    setAttachedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSendComment}
            disabled={!comment.trim() || isSubmitting}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${!comment.trim() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? t("Sending...") : t("Send")}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-twhite">{comment.author.name}</span>
                  <span className="text-sm text-gray-400">
                    {formatDate(comment.createdAt, currentLanguage as "ar" | "en")}
                  </span>
                </div>
                {comment.content && (
                  <p className="text-gray-300 mb-2">{comment.content}</p>
                )}
                {comment.files && comment.files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {comment.files.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleViewFile(file)}
                        className="flex items-center gap-1 px-3 py-1 bg-dark rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span className="text-sm">{file.split("/").pop()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-8">{t("No comments yet.")}</p>
        )}
      </div>
    </div>
  );
};
