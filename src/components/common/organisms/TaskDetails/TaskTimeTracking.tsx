import useLanguage from "@/hooks/useLanguage";
import { TimeLog } from "@/types/Task.type";
import { Clock, History, Pause, Play, RotateCcw, Calendar, Timer } from "lucide-react";
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
  isSubtask?: boolean;
}

// Helper function to format time logs
const formatTimeLog = (startTime: string, endTime: string, lang: string) => {
  const start = new Date(startTime);
  let end;
  let isInvalidEnd = false;

  try {
    end = new Date(endTime);
    if (isNaN(end.getTime())) {
      isInvalidEnd = true;
      end = new Date();
    }
  } catch (e) {
    console.log(e);
    isInvalidEnd = true;
    end = new Date();
  }

  const durationInSeconds = isInvalidEnd ? 0 : Math.floor(
    (end.getTime() - start.getTime()) / 1000
  );

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };

  const startFormatted = start.toLocaleDateString(
    lang === "ar" ? "ar" : "en-US",
    dateOptions
  );

  const endFormatted = isInvalidEnd
    ? "Running..."
    : end.toLocaleDateString(lang === "ar" ? "ar" : "en-US", dateOptions);

  return {
    startFormatted,
    endFormatted,
    durationFormatted: isInvalidEnd ? "Running..." : formatTime(durationInSeconds),
    isInvalidEnd
  };
};

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
  const [showAllLogs, setShowAllLogs] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Show only first 3 logs by default, or all if expanded
  // Reverse the order to show latest logs at the top (like a stack)
  const reversedLogs = timeLogs ? [...timeLogs].reverse() : [];
  const displayedLogs = showAllLogs ? reversedLogs : reversedLogs.slice(0, 3);
  const hasMoreLogs = timeLogs && timeLogs.length > 3;

  return (
    <div className={`rounded-lg border ${isSubtask
      ? 'bg-slate-500/5 border-slate-500/30'
      : 'bg-secondary border-gray-700'
      }`}>

      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between ">
          <h3 className="text-lg   font-bold text-twhite flex items-center gap-2">
            <div className={`p-1.5 rounded ${isSubtask ? 'bg-slate-500/20' : 'bg-blue-500/20'}`}>
              <Clock className={`w-4 h-4 ${isSubtask ? 'text-slate-400' : 'text-blue-400'}`} />
            </div>
            {t("Time Tracking")}
          </h3>

          {isSubtask && (
            <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full">
              {t("Subtask")}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Compact Timer Display */}
        <div className={`relative p-4 rounded-lg ${isLightMode ? "bg-darker" : "bg-dark"} border ${isLightMode ? "border-darkest" : "border-gray-700"}`}>
          {isTaskRunning && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-secondary">
              <div className={`w-2 h-2 rounded-full ${isSubtask ? 'bg-slate-400 animate-pulse' : 'bg-success animate-pulse'}`}></div>
              <span className={`text-xs font-medium ${isSubtask ? 'text-slate-400' : 'text-success'}`}>{t("Running")}</span>
            </div>
          )}

          <div className="text-center">
            <div className={`text-3xl lg:text-4xl font-bold tracking-wider mb-1 ${isSubtask ? 'text-slate-200' : 'text-twhite'}`}>
              {formatTime(displayTime)}
            </div>
            <p className="text-tmid text-sm">{t("Total Time Spent")}</p>
          </div>
        </div>

        {/* Compact Controls */}
        {selectedStatus !== "DONE" ? (
          <div className="flex gap-2">
            {!isTaskRunning ? (
              <button
                onClick={onStart}
                disabled={isMakingAPICall}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-all text-sm ${isMakingAPICall
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : isSubtask
                    ? "bg-slate-600 hover:bg-slate-700 text-white hover:shadow-lg"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                  }`}
              >
                <Play className="w-4 h-4" />
                {t("Start")}
              </button>
            ) : (
              <button
                onClick={onPause}
                disabled={isMakingAPICall}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-all text-sm ${isMakingAPICall
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg"
                  }`}
              >
                <Pause className="w-4 h-4" />
                {t("Pause")}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
              <RotateCcw className="w-4 h-4" />
              {t("Task Completed")}
            </div>
          </div>
        )}

        {/* Enhanced Compact Time Log Section */}
        {timeLogs && timeLogs.length > 0 && (
          <div className="bg-dark rounded-lg border border-gray-700/50 overflow-hidden">
            {/* Header with total summary */}
            <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-white">{t("Time Logs")}</span>
                  <span className="text-xs bg-gray-600/20 text-gray-400 px-2 py-1 rounded-full">
                    {timeLogs.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">{t("Total")}:</span>
                  <span className="font-mono font-medium text-green-400">
                    {formatTime(totalTimeSpent || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Logs Table */}
            <div className="max-h-[300px] overflow-y-auto">
              <div className="px-4 py-2 bg-gray-800/20 border-b border-gray-700/30">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t("Start")}
                  </div>
                  <div className="col-span-4 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t("End")}
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {t("Duration")}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-700/30">
                {displayedLogs?.map((log, index) => {
                  const { startFormatted, endFormatted, durationFormatted, isInvalidEnd } =
                    formatTimeLog(log.start, log.end, currentLanguage);

                  return (
                    <div
                      key={log._id || index}
                      className="px-4 py-2 hover:bg-gray-800/20 transition-colors duration-150"
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                            {index + 1}
                          </span>
                        </div>
                        <div className="col-span-4">
                          <div className="text-xs font-mono text-blue-300">{startFormatted}</div>
                        </div>
                        <div className="col-span-4">
                          <div className={`text-xs font-mono ${isInvalidEnd ? 'text-yellow-400' : 'text-blue-300'}`}>
                            {endFormatted}
                          </div>
                        </div>
                        <div className="col-span-3">
                          <div className={`text-xs font-mono font-medium ${isInvalidEnd ? 'text-yellow-400' : 'text-green-400'}`}>
                            {durationFormatted}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show More/Less Button */}
              {hasMoreLogs && (
                <div className="px-4 py-2 bg-gray-800/10 border-t border-gray-700/30">
                  <button
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors duration-150"
                  >
                    {showAllLogs
                      ? `↑ ${t("Show Less")} (${timeLogs.length - 3} ${t("hidden")})`
                      : `↓ ${t("Show More")} (${timeLogs.length - 3} ${t("more")})`
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {timeLogs && timeLogs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark rounded-lg p-3 text-center border border-gray-700/50">
              <div className="text-lg font-bold text-blue-400">{timeLogs.length}</div>
              <div className="text-xs text-gray-400">{t("Sessions")}</div>
            </div>
            <div className="bg-dark rounded-lg p-3 text-center border border-gray-700/50">
              <div className="text-lg font-bold text-green-400">
                {Math.round((totalTimeSpent || 0) / 3600 * 10) / 10}h
              </div>
              <div className="text-xs text-gray-400">{t("Total")}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};