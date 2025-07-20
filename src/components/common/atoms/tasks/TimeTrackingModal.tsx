import { useState, useEffect } from "react";
import useLanguage from "@/hooks/useLanguage";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface TimeTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (actualTime: number) => Promise<void>;
    recordedTime: number;
    taskStatus?: string;
    isAfterRating?: boolean;
}

// Helper function to format time (HH:MM:SS)
const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const TimeTrackingModal: React.FC<TimeTrackingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    recordedTime,
    taskStatus = "DONE",
    isAfterRating = false
}) => {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hours, setHours] = useState(Math.floor(recordedTime / 3600));
    const [minutes, setMinutes] = useState(Math.floor((recordedTime % 3600) / 60));
    const [seconds, setSeconds] = useState(Math.floor(recordedTime % 60));
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setHours(Math.floor(recordedTime / 3600));
            setMinutes(Math.floor((recordedTime % 3600) / 60));
            setSeconds(Math.floor(recordedTime % 60));
            setError("");
        }
    }, [recordedTime, isOpen]);

    if (!isOpen) return null;

    const getStatusConfig = () => {
        switch (taskStatus) {
            case "DONE":
                return {
                    icon: CheckCircle2,
                    title: t("Complete Task"),
                    iconColor: "text-green-400",
                    buttonColor: "bg-green-600 hover:bg-green-500",
                    borderColor: "border-green-500/30"
                };
            case "CLOSED":
                return {
                    icon: XCircle,
                    title: t("Close Task"),
                    iconColor: "text-red-400",
                    buttonColor: "bg-red-600 hover:bg-red-500",
                    borderColor: "border-red-500/30"
                };
            case "CANCELED":
                return {
                    icon: AlertCircle,
                    title: t("Cancel Task"),
                    iconColor: "text-orange-400",
                    buttonColor: "bg-orange-600 hover:bg-orange-500",
                    borderColor: "border-orange-500/30"
                };
            default:
                return {
                    icon: Clock,
                    title: t("Track Actual Time"),
                    iconColor: "text-blue-400",
                    buttonColor: "bg-blue-600 hover:bg-blue-500",
                    borderColor: "border-blue-500/30"
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    const validateTime = () => {
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        if (totalSeconds === 0) {
            setError(t("Please enter a valid time"));
            return false;
        }
        if (hours > 999) {
            setError(t("Hours cannot exceed 999"));
            return false;
        }
        if (minutes > 59) {
            setError(t("Minutes cannot exceed 59"));
            return false;
        }
        if (seconds > 59) {
            setError(t("Seconds cannot exceed 59"));
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async () => {
        if (!validateTime()) return;

        setIsSubmitting(true);
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        try {
            await onSubmit(totalSeconds);
            onClose();
        } catch (error) {
            console.error("Error submitting time:", error);
            setError(t("Failed to submit time. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (value: string, setter: (val: number) => void, max?: number) => {
        const numValue = parseInt(value) || 0;
        if (max && numValue > max) return;
        if (numValue < 0) return;
        setter(numValue);
        setError(""); // Clear error when user starts typing
    };

    const getCurrentTotal = () => {
        return (hours * 3600) + (minutes * 60) + seconds;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-[1001] flex items-center justify-center"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-secondary rounded-xl shadow-lg p-6 w-full max-w-md z-[1002] border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with status icon */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg bg-gray-800 border ${statusConfig.borderColor}`}>
                            <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-twhite">{statusConfig.title}</h2>
                            {isAfterRating && (
                                <p className="text-xs text-gray-400">{t("Step 2 of 2: Confirm Time")}</p>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        {/* System recorded time */}
                        <p className="text-gray-400 mb-2">{t("System recorded time")}:</p>
                        <div className="text-2xl font-mono bg-dark p-3 rounded-lg text-blue-400 mb-4 border border-gray-700">
                            {formatTime(recordedTime)}
                        </div>

                        {/* Input section */}
                        <p className="text-gray-400 mb-2">
                            {isAfterRating
                                ? t("Confirm or adjust the actual time spent")
                                : t("Enter actual time spent")}:
                        </p>
                        <div className="flex gap-3 items-center mb-3">
                            <div className="flex-1">
                                <label className="block text-gray-400 text-sm mb-1">{t("Hours")}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="999"
                                    value={hours}
                                    onChange={(e) => handleInputChange(e.target.value, setHours, 999)}
                                    className={`w-full bg-dark text-twhite px-3 py-2 rounded-lg border focus:outline-none transition-colors ${error
                                        ? "border-red-500 focus:border-red-400"
                                        : "border-gray-700 focus:border-blue-500"
                                        }`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-400 text-sm mb-1">{t("Minutes")}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutes}
                                    onChange={(e) => handleInputChange(e.target.value, setMinutes, 59)}
                                    className={`w-full bg-dark text-twhite px-3 py-2 rounded-lg border focus:outline-none transition-colors ${error
                                        ? "border-red-500 focus:border-red-400"
                                        : "border-gray-700 focus:border-blue-500"
                                        }`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-400 text-sm mb-1">{t("Seconds")}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={seconds}
                                    onChange={(e) => handleInputChange(e.target.value, setSeconds, 59)}
                                    className={`w-full bg-dark text-twhite px-3 py-2 rounded-lg border focus:outline-none transition-colors ${error
                                        ? "border-red-500 focus:border-red-400"
                                        : "border-gray-700 focus:border-blue-500"
                                        }`}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Total time display */}
                        <div className="bg-dark p-3 rounded-lg border border-gray-700 mb-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">{t("Total Time")}:</span>
                                <span className="text-white font-semibold font-mono">
                                    {formatTime(getCurrentTotal())}
                                </span>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-3">
                                {error}
                            </div>
                        )}

                        {/* Helpful note */}
                        <p className="text-gray-500 text-xs">
                            {isAfterRating
                                ? t("This is the final step. Confirm the time to complete the task.")
                                : t("You can adjust the time if it differs from the automatically tracked time.")}
                        </p>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {t("Cancel")}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !!error}
                            className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusConfig.buttonColor}`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>{t("Submitting...")}</span>
                                </div>
                            ) : (
                                isAfterRating
                                    ? t("Complete Task")
                                    : t("Submit & Complete")
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TimeTrackingModal;