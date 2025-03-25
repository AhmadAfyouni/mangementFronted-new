import useLanguage from "@/hooks/useLanguage";
import { templateType } from "@/types/new-template.type";
import React, { useEffect, useRef } from "react";

interface TemplateDetailsModalProps {
  template: templateType;
  isOpen: boolean;
  onClose: () => void;
}

const TemplateDetailsModal: React.FC<TemplateDetailsModalProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  const { t, getDir } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const renderDepartmentInfo = (dept: {
    department: { name: string };
    employee?: {
      name: string;
      job_id: {
        title: string;
      };
    };
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-tmid">{dept.department.name}</span>
      {dept.employee ? (
        <>
          <span className="text-xs text-tmid">
            {getDir() === "ltr" ? "→" : "←"}
          </span>
          <span className="text-sm text-tmid">
            {`${dept.employee.name} (${dept.employee.job_id.title})`}
          </span>
        </>
      ) : (
        <>
          <span className="text-xs text-tmid">
            {getDir() === "ltr" ? "→" : "←"}
          </span>
          <span className="text-sm text-tmid">{t("Department Head")}</span>
        </>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-secondary w-full max-w-3xl max-h-[90vh] rounded-xl shadow-lg overflow-hidden animate-in fade-in duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-twhite mb-4">
                {template.name}
              </h2>
              <div className="flex flex-col xs:flex-row justify-start items-center gap-3 text-sm text-tmid">
                <span className="flex items-center gap-1">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {t(template.type)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
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
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
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
                  {template.needAdminApproval
                    ? t("Admin Approval Required")
                    : t("No Admin Approval")}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-main rounded-lg transition-colors duration-200 text-tmid hover:text-twhite"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-tmid text-sm">{template.description}</p>
        </div>

        {/* Content */}
        <div className="p-6 pt-0 space-y-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {/* Approval Track */}
          <div>
            <h3 className="text-sm font-medium text-twhite mb-4 flex items-center gap-2">
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
            <div className="bg-main rounded-lg">
              <div className="divide-y divide-gray-700/50">
                {template.departments_approval_track.map((dept, index) => (
                  <div key={index} className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-tmid">
                      {index + 1}
                    </div>
                    <div className="flex-1">{renderDepartmentInfo(dept)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Execution Departments */}
          <div>
            <h3 className="text-sm font-medium text-twhite mb-4 flex items-center gap-2">
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
            <div className="bg-main rounded-lg p-4 space-y-4">
              {template.departments_execution_ids.map((dept, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-dark shrink-0 mt-1.5" />
                  <div className="flex-1">{renderDepartmentInfo(dept)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Archive Departments */}
          <div>
            <h3 className="text-sm font-medium text-twhite mb-4 flex items-center gap-2">
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
            <div className="bg-main rounded-lg p-4 space-y-4">
              {template.departments_archive.map((dept, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-dark shrink-0 mt-1.5" />
                  <div className="flex-1">{renderDepartmentInfo(dept)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Fields */}
          <div>
            <h3 className="text-sm font-medium text-twhite mb-4 flex items-center gap-2">
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
            <div className="grid grid-cols-2 gap-3">
              {template.transactionFields.map((field, index) => (
                <div key={index} className="bg-main p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-twhite mb-1">
                        {field.name}
                      </p>
                      <p className="text-xs text-tmid capitalize flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
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
                          ) : field.type === "select" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          )}
                        </svg>
                        {t(field.type)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailsModal;
