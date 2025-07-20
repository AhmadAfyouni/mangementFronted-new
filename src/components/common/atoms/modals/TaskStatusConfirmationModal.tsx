import React, { useState } from "react";
import { Star, Clock, CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import { ReceiveTaskType } from "@/types/Task.type";

interface TaskStatusConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: ReceiveTaskType;
    newStatus: "DONE" | "CLOSED" | "CANCELED";
    onStatusConfirmed: (ratingData?: { rating?: number; comment?: string }) => Promise<void>;
    requiresRating?: boolean;
    recordedTime?: number;
}

const TaskStatusConfirmationModal: React.FC<TaskStatusConfirmationModalProps> = ({
    isOpen,
    onClose,
    task,
    newStatus,
    onStatusConfirmed,
    requiresRating = false,
    recordedTime = 0,
}) => {
    const { t, currentLanguage } = useLanguage();
    const isRTL = currentLanguage === "ar";

    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

    if (!isOpen) return null;

    const formatTime = (timeInSeconds: number): string => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { rating?: string; comment?: string } = {};

        // Validation for DONE status with rating requirement
        if (requiresRating && newStatus === "DONE") {
            if (rating === 0) {
                newErrors.rating = t("Please provide a rating");
            }
            if (!comment.trim()) {
                newErrors.comment = t("Please provide feedback");
            }
        } else if (["CLOSED", "CANCELED"].includes(newStatus)) {
            // Validation for CLOSED/CANCELED status
            if (!comment.trim()) {
                newErrors.comment = t("Please provide a reason");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const ratingData: { rating?: number; comment?: string } = {};

            if (requiresRating && newStatus === "DONE" && rating > 0) {
                ratingData.rating = rating;
            }

            if (comment.trim()) {
                ratingData.comment = comment.trim();
            }

            await onStatusConfirmed(Object.keys(ratingData).length > 0 ? ratingData : undefined);

            // Reset form
            setRating(0);
            setHoveredRating(0);
            setComment("");
            setErrors({});
        } catch (error) {
            console.error("Error confirming status:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setRating(0);
            setHoveredRating(0);
            setComment("");
            setErrors({});
            onClose();
        }
    };

    const getStatusConfig = () => {
        switch (newStatus) {
            case "DONE":
                return {
                    icon: CheckCircle2,
                    title: t("Complete Task"),
                    color: "text-green-400",
                    bgColor: "bg-green-500/20 border-green-500/30",
                    description: requiresRating
                        ? t("Please rate your experience and provide feedback")
                        : t("Are you sure you want to mark this task as completed?"),
                    confirmText: t("Complete Task"),
                    confirmButtonColor: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
                };
            case "CLOSED":
                return {
                    icon: XCircle,
                    title: t("Close Task"),
                    color: "text-red-400",
                    bgColor: "bg-red-500/20 border-red-500/30",
                    description: t("Please provide a reason for closing this task"),
                    confirmText: t("Close Task"),
                    confirmButtonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                };
            case "CANCELED":
                return {
                    icon: AlertCircle,
                    title: t("Cancel Task"),
                    color: "text-orange-400",
                    bgColor: "bg-orange-500/20 border-orange-500/30",
                    description: t("Please provide a reason for canceling this task"),
                    confirmText: t("Cancel Task"),
                    confirmButtonColor: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
                };
            default:
                return {
                    icon: CheckCircle2,
                    title: t("Update Task"),
                    color: "text-blue-400",
                    bgColor: "bg-blue-500/20 border-blue-500/30",
                    description: t("Please confirm this action"),
                    confirmText: t("Confirm"),
                    confirmButtonColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;
    const shouldShowRating = requiresRating && newStatus === "DONE";
    const shouldShowComment = requiresRating || ["CLOSED", "CANCELED"].includes(newStatus);

    return (
        <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className="relative bg-secondary rounded-lg border border-gray-700 w-full max-w-md mx-auto shadow-2xl"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">
                            {statusConfig.title}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <p className="text-gray-400 text-sm">
                        {statusConfig.description}
                    </p>

                    {/* Task Info */}
                    <div className="bg-dark rounded-lg p-4 border border-gray-700/50">
                        <h3 className="text-white font-medium mb-2 truncate">
                            {task.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(recordedTime)}</span>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs border ${statusConfig.bgColor}`}>
                                {t(newStatus)}
                            </div>
                        </div>
                    </div>

                    {/* Rating Section - Only for DONE status with rating requirement */}
                    {shouldShowRating && (
                        <div className="space-y-3">
                            <label className="block text-white font-medium">
                                {t("Rate this task")} <span className="text-red-400">*</span>
                            </label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="p-1 rounded transition-transform hover:scale-110 disabled:opacity-50"
                                        onMouseEnter={() => !isSubmitting && setHoveredRating(star)}
                                        onMouseLeave={() => !isSubmitting && setHoveredRating(0)}
                                        onClick={() => !isSubmitting && setRating(star)}
                                        disabled={isSubmitting}
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-600"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm text-gray-400">
                                    {rating === 1 && t("Poor")}
                                    {rating === 2 && t("Fair")}
                                    {rating === 3 && t("Good")}
                                    {rating === 4 && t("Very Good")}
                                    {rating === 5 && t("Excellent")}
                                </p>
                            )}
                            {errors.rating && (
                                <p className="text-red-400 text-sm">{errors.rating}</p>
                            )}
                        </div>
                    )}

                    {/* Comment Section */}
                    {shouldShowComment && (
                        <div className="space-y-3">
                            <label className="block text-white font-medium">
                                {newStatus === "DONE"
                                    ? t("Additional feedback")
                                    : t("Reason")}
                                <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={
                                    newStatus === "DONE"
                                        ? t("Share your thoughts about this task...")
                                        : newStatus === "CLOSED"
                                            ? t("Why are you closing this task?")
                                            : t("Why are you canceling this task?")
                                }
                                className={`w-full px-3 py-2 bg-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors resize-none ${errors.comment
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-600 focus:ring-blue-500"
                                    }`}
                                rows={4}
                                disabled={isSubmitting}
                            />
                            {errors.comment && (
                                <p className="text-red-400 text-sm">{errors.comment}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {t("Cancel")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${statusConfig.confirmButtonColor}`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{t("Processing...")}</span>
                            </div>
                        ) : (
                            statusConfig.confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskStatusConfirmationModal;