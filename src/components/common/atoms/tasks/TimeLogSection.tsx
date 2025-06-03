import useLanguage from "@/hooks/useLanguage";
import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { formatTime } from "./ListTaskDetails";

// Format time log function with improved date handling
export const formatTimeLog = (
  startTime: string,
  endTime: string,
  lang: string
) => {
  const start = new Date(startTime);

  // Handle invalid end date
  let end;
  let isInvalidEnd = false;
  try {
    end = new Date(endTime);
    // Check if end date is valid
    if (isNaN(end.getTime())) {
      isInvalidEnd = true;
      end = new Date(); // Use current time as fallback
    }
  } catch (e) {
    console.log(e);
    isInvalidEnd = true;
    end = new Date(); // Use current time as fallback
  }

  const durationInSeconds = isInvalidEnd ? 0 : Math.floor(
    (end.getTime() - start.getTime()) / 1000
  );

  // Format dates in a more compact way
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  };

  // Format the dates
  const startFormatted = start.toLocaleDateString(
    lang === "ar" ? "ar" : "en-US",
    dateOptions
  );

  const endFormatted = isInvalidEnd
    ? "Invalid Date"
    : end.toLocaleDateString(lang === "ar" ? "ar" : "en-US", dateOptions);

  return {
    startFormatted,
    endFormatted,
    durationFormatted: isInvalidEnd ? "NaN:NaN:NaN" : formatTime(durationInSeconds),
    isInvalidEnd
  };
};

// Add this component inside your ListTaskDetails component, before the return statement
export const TimeLogSection: React.FC<{
  timeLogs: Array<{ start: string; end: string; _id: string }>;
  totalTime: number;
  currentLanguage: string;
  isLightMode: boolean;
}> = ({ timeLogs, totalTime, currentLanguage, isLightMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <label className="font-bold block text-twhite">{t("Time Logs")}</label>
        <button
          className="text-xs bg-dark text-twhite px-2 py-1 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? t("Hide Details") : t("Show Details")}
        </button>
      </div>

      <div
        className={`${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
          } shadow-md p-4 rounded-lg text-tmid gap-2`}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-tbright font-medium">
            {t("Total Time Spent")}
          </span>
          <span
            className={`${isLightMode ? "bg-darkest text-white " : "bg-dark text-twhite"
              } px-3 py-1 rounded-md font-medium`}
          >
            {formatTime(totalTime)}
          </span>
        </div>

        {isExpanded && (
          <div className="mt-3">
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium">
              <div>{t("Start Time")}</div>
              <div>{t("End Time")}</div>
              <div>{t("Duration")}</div>
              <div></div>
            </div>

            <div className="max-h-64 overflow-y-auto pb-20">
              {timeLogs.length > 0 ? (
                timeLogs.map((log, index) => {
                  const { startFormatted, endFormatted, durationFormatted, isInvalidEnd } =
                    formatTimeLog(
                      log.start,
                      log.end,
                      currentLanguage === "ar" ? "ar" : "en"
                    );

                  return (
                    <div
                      key={log._id || index}
                      className={`grid grid-cols-4 px-4 py-3 hover:bg-black hover:bg-opacity-30 transition-colors duration-150
                                     ${index % 2 === 0 ? "bg-black bg-opacity-20" : ""}`}
                    >
                      <div className="text-blue-300 font-mono text-sm">{startFormatted}</div>
                      <div className={`font-mono text-sm ${isInvalidEnd ? "text-red-400" : "text-blue-300"}`}>{endFormatted}</div>
                      <div className={`font-mono text-sm ${isInvalidEnd ? "text-red-400" : "text-green-400"} font-medium`}>{durationFormatted}</div>
                      <div className="text-right">
                        <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full font-medium text-xs inline-flex items-center justify-center">
                          {t("Session")} {timeLogs.length - index}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <CalendarClock className="w-5 h-5 mr-2" />
                  <p>{t("No time logs recorded")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
