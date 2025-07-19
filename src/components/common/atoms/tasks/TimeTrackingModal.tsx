import { useState } from "react";
import useLanguage from "@/hooks/useLanguage";

interface TimeTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (actualTime: number) => Promise<void>;
    recordedTime: number;
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
    recordedTime
}) => {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hours, setHours] = useState(Math.floor(recordedTime / 3600));
    const [minutes, setMinutes] = useState(Math.floor((recordedTime % 3600) / 60));

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const totalSeconds = (hours * 3600) + (minutes * 60);
        try {
            await onSubmit(totalSeconds);
            onClose();
        } catch (error) {
            console.error("Error submitting time:", error);
        } finally {
            setIsSubmitting(false);
        }
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
                    className="bg-secondary rounded-xl shadow-lg p-6 w-full max-w-md z-[1002]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold text-twhite mb-4">{t("Track Actual Time")}</h2>

                    <div className="mb-6">
                        <p className="text-gray-400 mb-2">{t("System recorded time")}:</p>
                        <div className="text-2xl font-mono bg-dark p-3 rounded-lg text-blue-400 mb-4">
                            {formatTime(recordedTime)}
                        </div>

                        <p className="text-gray-400 mb-2">{t("Enter actual time spent")}:</p>
                        <div className="flex gap-3 items-center">
                            <div className="flex-1">
                                <label className="block text-gray-400 text-sm mb-1">{t("Hours")}</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={hours}
                                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-dark text-twhite px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-400 text-sm mb-1">{t("Minutes")}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutes}
                                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                    className="w-full bg-dark text-twhite px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                        >
                            {t("Cancel")}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? t("Submitting...") : t("Submit")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TimeTrackingModal; 