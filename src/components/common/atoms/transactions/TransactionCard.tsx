import { useCreateMutation } from "@/hooks/useCreateMutation";
import useLanguage from "@/hooks/useLanguage";
import { transactionType } from "@/types/new-template.type";
import { addDurationToDate } from "@/utils/add_duration_to_date";
import { useEffect, useState } from "react";
import LogsModal from "../modals/LogsModal";
import TemplateDetailsModal from "../modals/TemplateDetailsModal";
import TransactionActionModal from "../modals/TransactionActionModal";
import PageSpinner from "../ui/PageSpinner";
import useSetPageData from "@/hooks/useSetPageData";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";

type ViewType = "my" | "admin" | "department" | "execution" | "archive";
type ActionType =
  | "approve"
  | "reject"
  | "send_back"
  | "restart"
  | "finish"
  | "done";

interface TransactionCardProps {
  transaction: transactionType;
  viewType: ViewType;
  showActions: boolean;
}

const TransactionCard = ({
  transaction,
  viewType,
  showActions,
}: TransactionCardProps) => {
  const { t, getDir } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const { NavigateButton } = useSetPageData(
    "/transactions/add-transaction",
    "restartData"
  );
  const { selector: myDept } = useRedux(
    (state: RootState) => state.user.userInfo?.department
  );

  const getStatusColor = (status: transactionType["status"]) => {
    switch (status) {
      case "NOT_APPROVED":
        return "bg-red-500/10 text-red-500";
      case "PARTIALLY_APPROVED":
        return "bg-yellow-500/10 text-yellow-500";
      case "FULLY_APPROVED":
        return "bg-green-500/10 text-green-500";
      case "ADMIN_APPROVED":
        return "bg-blue-500/10 text-blue-500";
    }
  };

  const { mutateAsync: makeAnAction, isPending: isMakingAction } =
    useCreateMutation({
      endpoint: "/transactions/departments-track",
      invalidateQueryKeys: [
        "my-transactions",
        "department-transactions",
        "admin-transactions",
        "execution-transactions",
      ],
    });
  const { mutateAsync: makeAnExecutionSeen, isPending: isMakingSeenAction } =
    useCreateMutation({
      endpoint: `/transactions/execution-status/${transaction._id}`,
      invalidateQueryKeys: [
        "my-transactions",
        "department-transactions",
        "admin-transactions",
        "execution-transactions",
      ],
      requestType: "patch",
    });

  const { mutateAsync: makeAnAdminAction, isPending: isMakingAdminAction } =
    useCreateMutation({
      endpoint: `/transactions/admin-approve`,
      invalidateQueryKeys: [
        "my-transactions",
        "department-transactions",
        "admin-transactions",
        "execution-transactions",
      ],
      requestType: "patch",
    });

  const {
    refetch: makeFinishAction,
    isFetching: isMakingFinishAction,
    isSuccess: isArchivingSuccessed,
  } = useCustomQuery({
    url: `/transactions/finish/${transaction._id}`,
    queryKey: [
      "my-transactions",
      "department-transactions",
      "admin-transactions",
      "execution-transactions",
    ],
    enabled: false,
  });

  useEffect(() => {
    if (isArchivingSuccessed) {
      queryClient.invalidateQueries({
        queryKey: [
          "my-transactions",
          "department-transactions",
          "admin-transactions",
          "execution-transactions",
        ],
      });
    }
  }, [isArchivingSuccessed, queryClient]);

  const handleAction = async (note: string) => {
    if (!currentAction) return;

    try {
      if (viewType == "admin") {
        makeAnAdminAction({
          transaction_id: transaction._id,
          action: currentAction,
          note,
        });
      } else {
        if (
          currentAction == "approve" ||
          currentAction == "reject" ||
          currentAction == "send_back"
        ) {
          await makeAnAction({
            transaction_id: transaction._id,
            action: currentAction,
            note,
          });
        } else if (currentAction == "done") {
          await makeAnExecutionSeen({
            newStatus: "DONE",
            note,
          });
        } else if (currentAction == "finish") {
          await makeFinishAction();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderActionButtons = () => {
    if (viewType == "department" && !showActions) return;
    const buttonClasses =
      "px-4 py-2 text-sm rounded-lg bg-main hover:bg-dark border border-gray-700/50 text-tmid hover:text-twhite transition-colors duration-200 flex items-center gap-2";

    switch (viewType) {
      case "my":
        return (
          <div className="flex flex-wrap items-center gap-2">
            <NavigateButton data={transaction} className={buttonClasses}>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {t("Restart")}
              </div>
            </NavigateButton>

            <button
              className={buttonClasses}
              onClick={() => {
                setCurrentAction("finish");
                setShowActionModal(true);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("Finish")}
            </button>
          </div>
        );

      case "execution":
        const isExecutionDone =
          transaction.departments_execution.find(
            (dept) => dept.department._id == myDept?.id
          )?.status == "DONE";

        if (isExecutionDone) return;
        if (!showActions) return;
        return (
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={buttonClasses}
              onClick={() => {
                setCurrentAction("done");
                setShowActionModal(true);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("DONE")}
            </button>
          </div>
        );

      case "admin":
      case "department":
        return (
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={buttonClasses}
              onClick={() => {
                setCurrentAction("approve");
                setShowActionModal(true);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("Approve")}
            </button>

            <button
              className={buttonClasses}
              onClick={() => {
                setCurrentAction("reject");
                setShowActionModal(true);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t("Reject")}
            </button>

            {
              <button
                className={buttonClasses}
                onClick={() => {
                  setCurrentAction("send_back");
                  setShowActionModal(true);
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                {t("Send Back")}
              </button>
            }
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      // className="
      className={`
      bg-secondary rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:shadow-lg
        ${
          isExpanded
            ? "rounded-xl shadow-lg"
            : "border-b hover:bg-secondary/50 cursor-pointer"
        }
      `}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {/* Header with status bar */}
      <div className={`h-1 ${getStatusColor(transaction.status)} w-full`} />

      <div className="p-6">
        {/* Transaction Header */}
        <div
          className={`flex justify-between items-start gap-4  ${
            isExpanded ? "mb-6" : "mb-0"
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-twhite">
                {transaction.template.name}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  transaction.status
                )}`}
              >
                {t(transaction.status)}
              </span>
            </div>
            <p className="text-tmid text-sm line-clamp-2">
              {transaction.template.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-sm rounded-lg bg-main hover:bg-dark text-tmid hover:text-twhite transition-colors duration-200"
              onClick={() => setShowTemplateDetails(true)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              className="p-2 text-sm rounded-lg bg-main hover:bg-dark text-tmid hover:text-twhite transition-colors duration-200 relative"
              onClick={() => setShowLogs(true)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {transaction.logs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-dark text-[10px] text-white">
                  {transaction.logs.length}
                </span>
              )}
            </button>
            {isExpanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-2.5 border border-dark rounded-lg hover:bg-main text-tmid hover:text-twhite transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Dates Section */}
            <div className="bg-main rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-tmid"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-tmid">{t("Start Date")}:</span>
                  <span className="text-twhite" dir={getDir()}>
                    {
                      new Date(transaction.start_date)
                        .toISOString()
                        .split("T")[0]
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-tmid"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-tmid">{t("End Date")}:</span>
                  <span className="text-twhite">
                    {addDurationToDate(
                      transaction.start_date,
                      transaction.template.duration,
                      getDir
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Track */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-twhite mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-tmid"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {t("Approval Track")}
              </h3>
              <div className="flex flex-wrap gap-3">
                {transaction.departments_approval_track.map((dept, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {/* Arrow between steps */}
                    {index > 0 &&
                      (getDir() == "rtl" ? (
                        <svg
                          className="w-4 h-4 text-tmid"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 5l-7 7 7 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-tmid"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      ))}

                    {/* Department status badge */}
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2
            ${
              dept.status === "DONE"
                ? "bg-green-500/10 text-green-500"
                : dept.status === "ONGOING"
                ? "bg-yellow-500/10 text-yellow-500"
                : dept.status === "CHECKING"
                ? "bg-blue-500/10 text-blue-500"
                : "bg-gray-500/10 text-tmid"
            }`}
                    >
                      {/* Step number circle */}
                      <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-medium">
                        {index + 1}
                      </span>

                      {/* Department name and status */}
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {dept.department.name}
                        </span>
                        <span className="text-[10px] uppercase opacity-75">
                          {t(dept.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Fields Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {transaction.fields.map((field, index) => (
                <div
                  key={index}
                  className="bg-main rounded-lg p-4 hover:bg-dark/50 transition-colors duration-200"
                >
                  <span className="text-xs text-tmid block mb-2 uppercase tracking-wider">
                    {field.field_name}
                  </span>
                  <span className="text-sm text-twhite font-medium">
                    {typeof field.value === "string" &&
                    (field.value.includes("/public-files/transactions/") ||
                      field.value.includes("92.112.194.101:3002") ||
                      field.value.includes(".pdf")) ? (
                      <div className="flex items-center">
                        <p>{field.value}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(field.value as string, "_blank");
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-dark rounded-md text-twhite hover:bg-secondary transition-colors duration-200 border border-secondary text-nowrap"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                            />
                          </svg>
                          {t("View File")}
                        </button>
                      </div>
                    ) : typeof field.value === "string" ||
                      typeof field.value === "number" ? (
                      field.value.toString()
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {t("File Uploaded")}
                      </div>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6">{renderActionButtons()}</div>
          </>
        )}
        {/* Modals */}
        <TemplateDetailsModal
          template={transaction.template}
          isOpen={showTemplateDetails}
          onClose={() => setShowTemplateDetails(false)}
        />

        <LogsModal
          logs={transaction.logs}
          isOpen={showLogs}
          onClose={() => setShowLogs(false)}
        />

        {currentAction && (
          <TransactionActionModal
            isOpen={showActionModal}
            onClose={() => {
              setShowActionModal(false);
              setCurrentAction(null);
            }}
            onSubmit={handleAction}
            actionType={currentAction}
          />
        )}

        {(isMakingAction ||
          isMakingSeenAction ||
          isMakingAdminAction ||
          isMakingFinishAction) && <PageSpinner />}
      </div>
    </div>
  );
};

export default TransactionCard;
