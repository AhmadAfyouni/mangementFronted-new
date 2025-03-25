import useLanguage from "@/hooks/useLanguage";
import { useState } from "react";
import { formatTime } from "./ListTaskDetails";

// Add this function near the top of your ListTaskDetails component, after the existing formatTime function
export const formatTimeLog = (
  startTime: string,
  endTime: string,
  lang: string
) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationInSeconds = Math.floor(
    (end.getTime() - start.getTime()) / 1000
  );

  // Format dates based on language
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const startFormatted = start.toLocaleDateString(
    lang === "ar" ? "ar" : "en-US",
    dateOptions
  );
  const endFormatted = end.toLocaleDateString(
    lang === "ar" ? "ar" : "en-US",
    dateOptions
  );

  return {
    startFormatted,
    endFormatted,
    durationFormatted: formatTime(durationInSeconds),
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
        <label className="font-bold block">{t("Time Logs")}</label>
        <button
          className="text-xs bg-dark text-twhite px-2 py-1 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? t("Hide Details") : t("Show Details")}
        </button>
      </div>

      <div
        className={`${
          isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
        } shadow-md p-4 rounded-lg text-tmid space-y-2`}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-tbright font-medium">
            {t("Total Time Spent")}
          </span>
          <span
            className={`${
              isLightMode ? "bg-darkest text-white " : "bg-dark text-twhite"
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

            <div className="max-h-48 overflow-y-auto">
              {timeLogs.length > 0 ? (
                timeLogs.map((log, index) => {
                  const { startFormatted, endFormatted, durationFormatted } =
                    formatTimeLog(
                      log.start,
                      log.end,
                      currentLanguage === "ar" ? "ar" : "en"
                    );

                  return (
                    <div
                      key={log._id || index}
                      className={`grid grid-cols-4 gap-2 py-2 text-xs ${
                        index % 2 === 0
                          ? isLightMode
                            ? "bg-darker bg-opacity-30"
                            : "bg-tblack bg-opacity-30"
                          : ""
                      }`}
                    >
                      <div className="break-words">{startFormatted}</div>
                      <div className="break-words">{endFormatted}</div>
                      <div className="break-words">{durationFormatted}</div>
                      <div className="text-right">
                        <span
                          className={`${
                            isLightMode ? "bg-dark" : "bg-gray-700"
                          } text-twhite px-2 py-1 rounded-md text-xs`}
                        >
                          {t("Session")} {timeLogs.length - index}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-2">{t("No time logs recorded")}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
