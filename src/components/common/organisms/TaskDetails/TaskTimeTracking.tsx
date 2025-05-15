import { Clock, PlayIcon, PauseIcon, CheckIcon, ChevronDown, ChevronUp } from "lucide-react";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import { TimeLogSection } from "@/components/common/atoms/tasks/TimeLogSection";
import useLanguage from "@/hooks/useLanguage";
import { TimeLog } from "@/types/Task.type";
import { useState } from "react";

interface TaskTimeTrackingProps {
  displayTime: number;
  isTaskRunning: boolean;
  isMakingAPICall: boolean;
  selectedStatus?: string;
  onStart: () => void;
  onPause: () => void;
  timeLogs?: TimeLog[];
  totalTimeSpent?: number;
  isLightMode: boolean;
}

export const TaskTimeTracking: React.FC<TaskTimeTrackingProps> = ({
  displayTime,
  isTaskRunning,
  isMakingAPICall,
  selectedStatus,
  onStart,
  onPause,
  timeLogs,
  totalTimeSpent,
  isLightMode,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`bg-secondary rounded-xl p-5 border ${isLightMode ? "border-darker" : "border-gray-700"} shadow-md`}>
      {/* Header with improved styling */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-twhite flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          {t("Time Tracking")}
        </h2>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-tmid hover:text-twhite transition-colors px-2 py-1 rounded-md hover:bg-dark"
        >
          <span className="text-sm">{showDetails ? t("Hide Logs") : t("Show Logs")}</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Timer display with status indicator */}
      <div className={`relative p-5 rounded-lg mb-5 ${isLightMode ? "bg-darker" : "bg-dark"} border ${isLightMode ? "border-darkest" : "border-gray-700"}`}>
        {isTaskRunning && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary">
            <div className="w-2 h-2 bg-success rounded-full pulse-green"></div>
            <span className="text-xs text-success font-medium">{t("Running")}</span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="text-5xl font-bold text-twhite tracking-wider mb-2">
            {formatTime(displayTime)}
          </div>
          <p className="text-tmid">{t("Total Time Spent")}</p>
        </div>
      </div>

      {/* Controls with better styling */}
      {selectedStatus !== "DONE" && (
        <div className="flex justify-center gap-3 mb-4">
          {isMakingAPICall ? (
            <div className="h-10 flex items-center justify-center w-full">
              <PageSpinner size="small" />
            </div>
          ) : !isTaskRunning ? (
            <button
              onClick={onStart}
              disabled={selectedStatus !== "ONGOING"}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg w-full
                          transition-all duration-200 font-medium text-twhite
                          ${selectedStatus === "ONGOING"
                  ? "bg-primary hover:bg-primary-600 active:bg-primary-700"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
            >
              <PlayIcon className="w-5 h-5" />
              {t("Start")}
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg w-full
                         bg-warning hover:bg-warning-600 active:bg-warning-700
                         transition-all duration-200 font-medium text-twhite"
            >
              <PauseIcon className="w-5 h-5" />
              {t("Pause")}
            </button>
          )}
        </div>
      )}

      {/* Status indicator for completed tasks */}
      {selectedStatus === "DONE" && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success bg-opacity-20 border border-success border-opacity-30">
            <CheckIcon className="w-5 h-5 text-success" />
            <span className="font-medium text-success">{t("Completed")}</span>
          </div>
        </div>
      )}

      {/* Time Logs */}
      <div className={`transition-all duration-300 overflow-hidden ${showDetails ? 'max-h-80' : 'max-h-0'}`}>
        <div className="mt-2">
          <TimeLogSection
            timeLogs={timeLogs || []}
            totalTime={totalTimeSpent || 0}
            currentLanguage={currentLanguage}
            isLightMode={isLightMode}
          />
        </div>
      </div>
    </div>
  );
};