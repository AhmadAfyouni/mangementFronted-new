import useHierarchy from "@/hooks/useHierarchy";
import { ReceiveTaskType } from "@/types/Task.type";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const HomeTasksReport = ({
  tasksData,
  isCentered = true,
}: {
  tasksData: ReceiveTaskType[] | undefined;
  isCentered?: boolean;
}) => {
  const [status, setStatus] = useState<"upcoming" | "overdue" | "completed">(
    "upcoming"
  );
  const { t } = useTranslation();
  const { renderHomeTaskWithSubtasks, organizeTasksByHierarchy } =
    useHierarchy();

  const currently = tasksData?.filter(
    (task) => !task.is_over_due && task.status != "DONE"
  );
  const overdue = tasksData?.filter((task) => task.is_over_due);
  const completed = tasksData?.filter((task) => task.status == "DONE");

  useEffect(() => {
    console.log("overdue: ", overdue);
  }, [overdue]);

  const NoTasksMessage = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {t("No Tasks")}
    </div>
  );

  return (
    <div
      className={`bg-main min-h-64 rounded-md shadow-md ${
        isCentered ? "mx-auto w-full md:w-[90%] lg:w-[80%] xl:w-[70%]" : ""
      } mt-5 p-3 sm:p-5 text-twhite border border-slate-700`}
    >
      <div className="text-base sm:text-lg font-bold">{t("Tasks")}</div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm my-3 sm:my-5 font-semibold border-b border-slate-700 pb-2">
        <button
          onClick={() => setStatus("upcoming")}
          className={`px-2 py-1 rounded-t-md transition-colors ${
            status === "upcoming"
              ? "border-b-[3px] border-slate-700"
              : "cursor-pointer text-tdark hover:text-twhite"
          }`}
        >
          {t("Currently")} ({currently?.length || 0})
        </button>

        <button
          onClick={() => setStatus("overdue")}
          className={`px-2 py-1 rounded-t-md transition-colors ${
            status === "overdue"
              ? "border-b-[3px] border-slate-700"
              : "cursor-pointer text-tdark hover:text-twhite"
          }`}
        >
          {t("Overdue")} ({overdue?.length || 0})
        </button>

        <button
          onClick={() => setStatus("completed")}
          className={`px-2 py-1 rounded-t-md transition-colors ${
            status === "completed"
              ? "border-b-[3px] border-slate-700"
              : "cursor-pointer text-tdark hover:text-twhite"
          }`}
        >
          {t("Completed")} ({completed?.length || 0})
        </button>
      </div>

      <div className="overflow-x-auto">
        {status === "upcoming" && (
          <div className="w-full min-w-[300px]">
            {currently && currently.length > 0 ? (
              organizeTasksByHierarchy(currently).map((task) =>
                renderHomeTaskWithSubtasks(task, 0)
              )
            ) : (
              <NoTasksMessage />
            )}
          </div>
        )}

        {status === "overdue" && (
          <div className="w-full min-w-[300px]">
            {overdue && overdue.length > 0 ? (
              organizeTasksByHierarchy(overdue).map((task) =>
                renderHomeTaskWithSubtasks(task, 0)
              )
            ) : (
              <NoTasksMessage />
            )}
          </div>
        )}

        {status === "completed" && (
          <div className="w-full min-w-[300px]">
            {completed && completed.length > 0 ? (
              organizeTasksByHierarchy(completed).map((task) =>
                renderHomeTaskWithSubtasks(task, 0)
              )
            ) : (
              <NoTasksMessage />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTasksReport;
