import { Clock, PlayIcon, PauseIcon, CheckIcon } from "lucide-react";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import { TimeLogSection } from "@/components/common/atoms/tasks/TimeLogSection";
import useLanguage from "@/hooks/useLanguage";
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

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-twhite mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-400" />
        {t("Time Tracking")}
      </h2>

      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-twhite mb-2">
          {formatTime(displayTime)}
        </div>
        <p className="text-gray-400">{t("Total Time Spent")}</p>
      </div>

      {selectedStatus !== "DONE" && (
        <div className="flex justify-center gap-3">
          {isMakingAPICall ? (
            <PageSpinner />
          ) : !isTaskRunning ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              {t("Start")}
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <PauseIcon className="w-5 h-5" />
              {t("Pause")}
            </button>
          )}
        </div>
      )}

      {selectedStatus === "DONE" && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckIcon className="w-5 h-5" />
            <span className="font-medium">{t("Completed")}</span>
          </div>
        </div>
      )}

      {/* Time Logs */}
      <div className="mt-6">
        <TimeLogSection
          timeLogs={timeLogs || []}
          totalTime={totalTimeSpent || 0}
          currentLanguage={currentLanguage}
          isLightMode={isLightMode}
        />
      </div>
    </div>
  );
};
