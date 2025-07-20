import { XIcon } from "@/assets";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useTaskRating } from "@/hooks/tasks/useTaskRating";
import useLanguage from "@/hooks/useLanguage";
import { ReceiveTaskType } from "@/types/Task.type";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TaskStatusConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: ReceiveTaskType;
    newStatus: "DONE" | "CLOSED" | "CANCELED";
    onStatusConfirmed: () => void;
}

const StarIcon = ({ filled, size }: { filled: boolean; size: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? "#ffd500" : "none"}
        stroke={filled ? "#ffd500" : "#d1d5db"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-200 cursor-pointer hover:scale-110"
    >
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
);

const TaskStatusConfirmationModal: React.FC<TaskStatusConfirmationModalProps> = ({
    isOpen,
    onClose,
    task,
    newStatus,
    onStatusConfirmed,
}) => {
    const { t } = useLanguage();
    const { setSnackbarConfig } = useMokkBar();
    const modalRef = useRef<HTMLDivElement>(null);

    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);

    const { rateTask, isRating } = useTaskRating({
        taskId: task.id,
        status: newStatus,
        onSuccess: () => {
            onStatusConfirmed();
            onClose();
        },
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const getStatusConfig = () => {
        switch (newStatus) {
            case "DONE":
                return {
                    icon: CheckCircle2,
                    color: "text-green-400",
                    bgColor: "bg-green-500/20",
                    title: t("Confirm Task Completion"),
                    description: t("Are you sure you want to mark this task as completed?"),
                    requiresRating: true,
                };
            case "CLOSED":
                return {
                    icon: XCircle,
                    color: "text-red-400",
                    bgColor: "bg-red-500/20",
                    title: t("Confirm Task Closure"),
                    description: t("Are you sure you want to close this task?"),
                    requiresRating: false,
                };
            case "CANCELED":
                return {
                    icon: AlertTriangle,
                    color: "text-yellow-400",
                    bgColor: "bg-yellow-500/20",
                    title: t("Confirm Task Cancellation"),
                    description: t("Are you sure you want to cancel this task?"),
                    requiresRating: false,
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    const handleSubmit = () => {
        if (!comment.trim()) {
            setSnackbarConfig({
                message: t("Please provide a comment"),
                open: true,
                severity: "warning",
            });
            return;
        }

        if (newStatus === "DONE" && rating === 0) {
            setSnackbarConfig({
                message: t("Please provide a rating"),
                open: true,
                severity: "warning",
            });
            return;
        }

        const ratingData = {
            comment: comment.trim(),
            ...(newStatus === "DONE" && rating > 0 ? { rating } : {}),
        };

        rateTask(ratingData);
    };

    if (!isOpen) return null;

    // Use portal to render modal outside normal DOM hierarchy
    return createPortal(
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                } transition-opacity duration-300`}
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className={`relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ${isOpen ? "scale-100" : "scale-95"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-twhite">{config.title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Image src={XIcon} alt="close" width={20} height={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Task Info */}
                    <div className="bg-dark/50 rounded-lg p-4 border border-gray-700/50">
                        <h4 className="font-medium text-twhite mb-2">{task.name}</h4>
                        <p className="text-sm text-gray-400">{task.description}</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm">{config.description}</p>

                    {/* Rating Section (only for DONE) */}
                    {newStatus === "DONE" && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">
                                {t("Task Rating")} <span className="text-red-400">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform duration-200 hover:scale-110"
                                    >
                                        <StarIcon filled={star <= rating} size={32} />
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">
                                {rating > 0
                                    ? `${t("Your rating:")} ${rating} ${t("of")} 5`
                                    : t("Select your rating")}
                            </p>
                        </div>
                    )}

                    {/* Comment Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">
                            {t("Comment")} <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-dark text-twhite px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                            rows={4}
                            placeholder={t("Enter your comment here...")}
                            required
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-dark/30 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        {t("Cancel")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isRating}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isRating
                            ? "bg-gray-600 cursor-not-allowed"
                            : newStatus === "DONE"
                                ? "bg-green-600 hover:bg-green-700"
                                : newStatus === "CLOSED"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-yellow-600 hover:bg-yellow-700"
                            }`}
                    >
                        {isRating ? t("Updating...") : t("Confirm")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TaskStatusConfirmationModal; 