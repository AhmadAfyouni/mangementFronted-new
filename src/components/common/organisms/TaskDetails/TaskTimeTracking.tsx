import useLanguage from "@/hooks/useLanguage";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { TimeLogSection } from "@/components/common/atoms/tasks/TimeLogSection";
import { TimeLog } from "@/types/Task.type";

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
  isSubtask?: boolean;
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
  isSubtask = false,
}) => {
  const { t, currentLanguage } = useLanguage();

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`rounded-xl p-6 border ${isSubtask
      ? 'bg-slate-500/5 border-slate-500/30'
      : 'bg-secondary border-gray-700'
      }`}>
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <Clock className={`w-5 h-5 ${isSubtask ? 'text-slate-400' : 'text-blue-400'}`} />
        {t("Time Tracking")}
        {isSubtask && (
          <span className="text-sm bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full">
            {t("Subtask")}
          </span>
        )}
      </h2>

      {/* Timer Display */}
      <div className={`relative p-5 rounded-lg mb-5 ${isLightMode ? "bg-darker" : "bg-dark"} border ${isLightMode ? "border-darkest" : "border-gray-700"}`}>
        {isTaskRunning && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary">
            <div className={`w-2 h-2 rounded-full ${isSubtask ? 'bg-slate-400 animate-pulse' : 'bg-success animate-pulse'}`}></div>
            <span className={`text-xs font-medium ${isSubtask ? 'text-slate-400' : 'text-success'}`}>{t("Running")}</span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className={`text-5xl font-bold tracking-wider mb-2 ${isSubtask ? 'text-slate-200' : 'text-twhite'}`}>
            {formatTime(displayTime)}
          </div>
          <p className="text-tmid">{t("Total Time Spent")}</p>
        </div>
      </div>

      {/* Controls with better styling */}
      <div className="space-y-3">
        {selectedStatus !== "DONE" && (
          <div className="flex gap-2">
            {!isTaskRunning ? (
              <button
                onClick={onStart}
                disabled={isMakingAPICall}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${isMakingAPICall
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : isSubtask
                    ? "bg-slate-600 hover:bg-slate-700 text-white hover:shadow-lg"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                  }`}
              >
                <Play className="w-5 h-5" />
                {t("Start Timer")}
              </button>
            ) : (
              <button
                onClick={onPause}
                disabled={isMakingAPICall}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${isMakingAPICall
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg"
                  }`}
              >
                <Pause className="w-5 h-5" />
                {t("Pause Timer")}
              </button>
            )}
          </div>
        )}

        {selectedStatus === "DONE" && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
              <RotateCcw className="w-4 h-4" />
              {t("Task Completed")}
            </div>
          </div>
        )}
      </div>

      {/* Time Log Section */}
      {timeLogs && timeLogs.length > 0 && (
        <div className="mt-6">
          <TimeLogSection
            timeLogs={timeLogs}
            totalTime={totalTimeSpent || 0}
            currentLanguage={currentLanguage}
            isLightMode={isLightMode}
          />
        </div>
      )}
    </div>
  );
};