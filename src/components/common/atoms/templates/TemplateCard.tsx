import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { templateType } from "@/types/new-template.type";
import { useState } from "react";

const TemplateCard: React.FC<{
  template: templateType;
}> = ({ template }) => {
  const { t, getDir } = useLanguage();
  const { NavigateButton } = useSetPageData("/transactions/add-transaction");
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "internal":
        return "bg-blue-500/10 text-blue-500";
      case "external":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const renderTrackItem = (track: {
    department: { name: string };
    employee?: {
      name: string;
      job_id: {
        title: string;
      };
    };
  }) => (
    <div className="flex items-center gap-2 flex-1">
      <span className="text-sm text-tmid">{track.department.name}</span>
      {track.employee ? (
        <>
          <span className="text-xs text-tmid">
            {getDir() == "ltr" ? "→" : "←"}
          </span>
          <span className="text-sm  text-twhite">
            {`${track.employee.name} (${track.employee.job_id.title})`}
          </span>
        </>
      ) : (
        <>
          {/* <span className="text-xs text-tmid">
            {getDir() == "ltr" ? "→" : "←"}
          </span>
          <span className="text-sm text-tmid">{t("Department Head")}</span> */}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-secondary rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:shadow-lg">
      <div className={`h-1 ${getTypeColor(template.type)} w-full`} />

      <div className="p-6">
        {/* Template Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-twhite">
                {template.name}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  template.type
                )}`}
              >
                {t(template.type)}
              </span>
            </div>
            <p className="text-tmid text-sm">{template.description}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0 p-2 text-sm rounded-lg bg-main hover:bg-dark text-tmid hover:text-twhite transition-colors duration-200 flex items-center gap-2"
          >
            {isExpanded ? t("Hide Details") : t("Show Details")}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Quick Info */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-tmid">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {template.duration.value} {t(template.duration.unit)}
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-tmid/30" />
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
              />
            </svg>
            {template.departments_approval_track.length} {t("steps")}
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-tmid/30" />
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586"
              />
            </svg>
            {template.transactionFields.length} {t("fields")}
          </div>
          {template.needAdminApproval && (
            <>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-tmid/30" />
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622"
                  />
                </svg>
                {t("Admin Approval Required")}
              </div>
            </>
          )}
        </div>

        {/* Expandable Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "mt-6 opacity-100" : "h-0 opacity-0"
          }`}
        >
          {/* Approval Track */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-twhite flex items-center gap-2">
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
              <span className="text-xs text-tmid bg-main px-2 py-1 rounded-lg">
                {template.departments_approval_track.length} {t("steps")}
              </span>
            </div>
            <div className="bg-main rounded-lg p-4">
              {template.departments_approval_track.map((track, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 mb-3 last:mb-0"
                >
                  <span className="w-6 h-6 shrink-0 rounded-full bg-dark flex items-center justify-center text-xs text-tmid font-medium">
                    {index + 1}
                  </span>
                  {renderTrackItem(track)}
                </div>
              ))}
            </div>
          </div>

          {/* Execution Departments */}
          {template.departments_execution_ids.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-twhite flex items-center gap-2">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {t("Execution Departments")}
                </h3>
                <span className="text-xs text-tmid bg-main px-2 py-1 rounded-lg">
                  {template.departments_execution_ids.length} {t("departments")}
                </span>
              </div>
              <div className="bg-main rounded-lg p-4 grid grid-cols-1 gap-4">
                {template.departments_execution_ids.map((exec, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-dark shrink-0 mt-1.5" />
                    {renderTrackItem(exec)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archive Departments */}
          {template.departments_archive.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-twhite flex items-center gap-2">
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
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  {t("Archive Departments")}
                </h3>
                <span className="text-xs text-tmid bg-main px-2 py-1 rounded-lg">
                  {template.departments_archive.length} {t("departments")}
                </span>
              </div>
              <div className="bg-main rounded-lg p-4 grid grid-cols-1 gap-4">
                {template.departments_archive.map((archive, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-dark shrink-0 mt-1.5" />
                    {renderTrackItem(archive)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Fields */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-twhite flex items-center gap-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {t("Required Fields")}
              </h3>
              <span className="text-xs text-tmid bg-main px-2 py-1 rounded-lg">
                {template.transactionFields.length} {t("fields")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {template.transactionFields.map((field, index) => (
                <div
                  key={index}
                  className="bg-main rounded-lg p-4 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-tmid"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {field.type === "file" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
                        />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-twhite mb-1">{field.name}</p>
                    <p className="text-xs text-tmid uppercase">
                      {t(field.type)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div
          className={`mt-4 transition-all duration-300 ${
            isExpanded ? "opacity-100" : "opacity-75"
          }`}
        >
          <NavigateButton
            data={template}
            className="w-full bg-main hover:bg-dark text-twhite font-medium px-5 py-3 rounded-lg
              flex items-center justify-center gap-2 rtl:flex-row-reverse transition-colors"
          >
            {t("Initiate Transaction")}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NavigateButton>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
