import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { DepartmentType } from "@/types/DepartmentType.type";
import Image from "next/image";
import React, { useState } from "react";

interface TextModalProps {
  content: string;
  title: string;
  onClose: () => void;
}

// Modal component for viewing long text content
const TextModal: React.FC<TextModalProps> = ({ content, title, onClose }) => {
  const { isLightMode } = useCustomTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className={`bg-main ${
          isLightMode ? "text-blackAF" : "text-twhite"
        } p-6 rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto border ${
          isLightMode ? "border-gray-300" : "border-gray-700"
        }`}
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-main py-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 hover:bg-opacity-20"
          >
            ✕
          </button>
        </div>
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
};

interface FilesReportsModalProps {
  department: DepartmentType;
  onClose: () => void;
  onOpenFile: (url: string, name: string) => void;
}

const FilesReportsModal: React.FC<FilesReportsModalProps> = ({
  department,
  onClose,
  onOpenFile,
}) => {
  const { isLightMode } = useCustomTheme();
  const { t } = useLanguage();
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  // Function to handle file links
  const renderFileLink = (
    fileUrl: string | undefined,
    fileName = "File"
  ): React.ReactNode => {
    if (!fileUrl) return "-";

    const isLoading = loadingFiles[fileUrl] || false;

    const handleFileClick = (url: string) => {
      // Set loading state for this specific file
      setLoadingFiles((prev) => ({ ...prev, [url]: true }));

      // Simulate loading
      setTimeout(() => {
        // Reset loading state
        setLoadingFiles((prev) => ({ ...prev, [url]: false }));

        // Open the file
        onOpenFile(url, fileName);
      }, 500);
    };

    return (
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors focus:outline-none ${
          isLightMode
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
            : "bg-blue-900/30 text-blue-400 hover:bg-blue-800/40"
        } ${isLoading ? "cursor-wait opacity-80" : ""}`}
        onClick={() => handleFileClick(fileUrl)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{t("Opening")}</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
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
            <span>{fileName}</span>
          </>
        )}
      </button>
    );
  };

  // Function to extract filename from URL
  const getFilenameFromUrl = (url: string) => {
    try {
      const segments = url.split("/");
      let fileName = segments[segments.length - 1];
      // Remove any query parameters
      if (fileName.includes("?")) {
        fileName = fileName.split("?")[0];
      }
      return fileName;
    } catch (e) {
      console.log(e);
      return "File";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className={`bg-main ${
          isLightMode ? "text-blackAF" : "text-twhite"
        } p-6 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto border ${
          isLightMode ? "border-gray-300" : "border-gray-700"
        }`}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-main py-2">
          <h3 className="text-xl font-bold">
            {t("Files & Reports for")} {department.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 hover:bg-opacity-20"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Supporting Files Section */}
          <div>
            <h4
              className={`text-lg font-semibold mb-4 ${
                isLightMode ? "text-gray-800" : "text-gray-100"
              }`}
            >
              {t("Supporting Files")}
            </h4>

            {department.supportingFiles &&
            department.supportingFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {department.supportingFiles.map((fileUrl, index) => (
                  <div
                    key={`file-${index}`}
                    className={`p-3 rounded-lg ${
                      isLightMode
                        ? "bg-darkest border border-darkest"
                        : "bg-dark border border-dark"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate flex-1">
                        <span className="text-sm text-white font-medium">
                          {getFilenameFromUrl(fileUrl)}
                        </span>
                      </div>
                      <div className="ml-2">
                        {renderFileLink(fileUrl, t("Open"))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-6 px-4 rounded-lg ${
                  isLightMode ? "bg-gray-50" : "bg-gray-800/30"
                }`}
              >
                <p
                  className={`${
                    isLightMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {t("No supporting files available")}
                </p>
              </div>
            )}
          </div>

          {/* Required Reports Section */}
          <div>
            <h4
              className={`text-lg font-semibold mb-4 ${
                isLightMode ? "text-gray-800" : "text-gray-100"
              }`}
            >
              {t("Required Reports")}
            </h4>

            {department.requiredReports &&
            department.requiredReports.length > 0 ? (
              <div className="space-y-3">
                {department.requiredReports.map((report, index) => (
                  <div
                    key={`report-${index}`}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      isLightMode
                        ? "bg-darkest border border-darkest"
                        : "bg-dark border border-dark"
                    }`}
                  >
                    <div className="flex-1">
                      <h5 className={`font-medium text-white`}>
                        {report.name}
                      </h5>
                    </div>
                    <div className="ml-4">
                      {renderFileLink(report.templateFile, t("Template"))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-6 px-4 rounded-lg ${
                  isLightMode ? "bg-gray-50" : "bg-gray-800/30"
                }`}
              >
                <p
                  className={`${
                    isLightMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {t("No required reports available")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DevelopmentProgramsModalProps {
  department: DepartmentType;
  onClose: () => void;
  onOpenFile: (url: string, name: string) => void;
  onViewText: (content: string, title: string) => void;
}

const DevelopmentProgramsModal: React.FC<DevelopmentProgramsModalProps> = ({
  department,
  onClose,
  onOpenFile,
  onViewText,
}) => {
  const { isLightMode } = useCustomTheme();
  const { t } = useLanguage();
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  // Function to handle file links
  const renderFileLink = (
    fileUrl: string | undefined,
    fileName = "File"
  ): React.ReactNode => {
    if (!fileUrl) return "-";

    const isLoading = loadingFiles[fileUrl] || false;

    const handleFileClick = (url: string) => {
      // Set loading state for this specific file
      setLoadingFiles((prev) => ({ ...prev, [url]: true }));

      // Simulate loading
      setTimeout(() => {
        // Reset loading state
        setLoadingFiles((prev) => ({ ...prev, [url]: false }));

        // Open the file
        onOpenFile(url, fileName);
      }, 500);
    };

    return (
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors focus:outline-none ${
          isLightMode
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
            : "bg-blue-900/30 text-blue-400 hover:bg-blue-800/40"
        } ${isLoading ? "cursor-wait opacity-80" : ""}`}
        onClick={() => handleFileClick(fileUrl)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{t("Opening")}</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
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
            <span>{fileName}</span>
          </>
        )}
      </button>
    );
  };

  // Function to handle long text
  const handleLongText = (
    text: string | undefined,
    title: string,
    maxLength = 100
  ): React.ReactNode => {
    if (!text) return "-";

    if (text.length <= maxLength) return text;

    return (
      <div>
        <span>{text.substring(0, maxLength)}...</span>
        <button
          className="ml-2 text-blue-500 hover:underline focus:outline-none"
          onClick={() => onViewText(text, title)}
        >
          {t("View More")}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className={`bg-main ${
          isLightMode ? "text-blackAF" : "text-twhite"
        } p-6 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto border ${
          isLightMode ? "border-gray-300" : "border-gray-700"
        }`}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-main py-2">
          <h3 className="text-xl font-bold">
            {t("Development Programs for")} {department.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 hover:bg-opacity-20"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {department.developmentPrograms &&
          department.developmentPrograms.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {department.developmentPrograms.map((program, index) => (
                <div
                  key={`program-${index}`}
                  className={`p-5 rounded-lg ${
                    isLightMode
                      ? "bg-darkest border border-darkest shadow-sm"
                      : "bg-dark border border-dark"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-semibold text-white `}>
                      {program.programName}
                    </h4>
                    {program.programFile && (
                      <div>
                        {renderFileLink(program.programFile, t("Program File"))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div
                      className={`p-3 rounded-md ${
                        isLightMode ? "bg-white/80" : "bg-gray-800/50"
                      }`}
                    >
                      <h5 className="font-medium mb-2">{t("Objective")}</h5>
                      <div
                        className={`${
                          isLightMode ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        {handleLongText(
                          program.objective,
                          `${program.programName} - ${t("Objective")}`,
                          200
                        )}
                      </div>
                    </div>

                    {program.notes && (
                      <div
                        className={`p-3 rounded-md ${
                          isLightMode ? "bg-white/80" : "bg-gray-800/50"
                        }`}
                      >
                        <h5 className="font-medium mb-2">{t("Notes")}</h5>
                        <div
                          className={`${
                            isLightMode ? "text-gray-700" : "text-gray-300"
                          }`}
                        >
                          {handleLongText(
                            program.notes,
                            `${program.programName} - ${t("Notes")}`,
                            200
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-10 px-4 rounded-lg ${
                isLightMode ? "bg-gray-50" : "bg-gray-800/30"
              }`}
            >
              <p
                className={`${isLightMode ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("No development programs available")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TextModalState {
  isOpen: boolean;
  content: string;
  title: string;
}

interface DepartmentsContentProps {
  departmentsData: DepartmentType[];
}

const DepartmentsContent: React.FC<DepartmentsContentProps> = ({
  departmentsData,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["department_updatesss"]);
  const { NavigateButton } = useSetPageData<DepartmentType>(
    "/departments/add-department"
  );

  // State for modals
  const [textModal, setTextModal] = useState<TextModalState>({
    isOpen: false,
    content: "",
    title: "",
  });

  // State for Files & Reports and Development Programs modals
  const [filesReportsModal, setFilesReportsModal] = useState<{
    isOpen: boolean;
    department: DepartmentType | null;
  }>({
    isOpen: false,
    department: null,
  });

  const [developmentProgramsModal, setDevelopmentProgramsModal] = useState<{
    isOpen: boolean;
    department: DepartmentType | null;
  }>({
    isOpen: false,
    department: null,
  });

  // Function to handle long text
  const handleLongText = (
    text: string | undefined,
    title: string,
    maxLength = 100
  ): React.ReactNode => {
    if (!text) return "-";

    if (text.length <= maxLength) return text;

    return (
      <div>
        <span>{text.substring(0, maxLength)}...</span>
        <button
          className="ml-2 text-blue-500 hover:underline focus:outline-none"
          onClick={() => setTextModal({ isOpen: true, content: text, title })}
        >
          {t("View More")}
        </button>
      </div>
    );
  };

  // Function to open file
  const handleOpenFile = (url: string) => {
    window.open(url, "_blank");
  };

  // Filter visible columns for better organization
  const visibleColumns = [
    { id: "name", label: "Name" },
    { id: "category", label: "Category" },
    { id: "parent", label: "Parent Department" },
    { id: "goal", label: "Goal" },
    { id: "description", label: "Description" },
    { id: "mainTasks", label: "Main Tasks" },
    { id: "files", label: "Files & Reports" },
    { id: "programs", label: "Development Programs" },
  ];

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col space-y-4 col-span-12">
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-main text-twhite rounded-lg shadow-md border-collapse">
          <thead
            className={`${
              isLightMode ? "bg-darkest text-tblackAF" : "bg-tblack text-twhite"
            } sticky top-0 z-10`}
          >
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className="text-start py-3 px-4 uppercase font-semibold text-sm"
                >
                  {t(column.label)}
                </th>
              ))}
              {(isAdmin || hasEditPermission) && (
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {departmentsData &&
              departmentsData.map((department) => (
                <tr
                  key={department.id}
                  className={`${
                    isLightMode
                      ? "hover:bg-darker text-blackAF hover:text-tblackAF border-b border-gray-200"
                      : "hover:bg-slate-700 text-twhite border-b border-gray-800"
                  } transition-colors`}
                >
                  {/* Name */}
                  <td className="py-4 px-4">
                    <div className="font-medium">{department.name}</div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <div className="inline-block py-1 px-3 rounded-full bg-blue-500 bg-opacity-20 text-blue-400 text-xs">
                      {department.category}
                    </div>
                  </td>

                  {/* Parent Department */}
                  <td className="py-4 px-4">
                    {department.parent_department
                      ? departmentsData.find(
                          (dep) => dep.id === department.parent_department
                        )?.name
                      : "—"}
                  </td>

                  {/* Goal */}
                  <td className="py-4 px-4">
                    {handleLongText(
                      department.goal,
                      `${department.name} - ${t("Goal")}`
                    )}
                  </td>

                  {/* Description */}
                  <td className="py-4 px-4">
                    {handleLongText(
                      department.description,
                      `${department.name} - ${t("Description")}`
                    )}
                  </td>

                  {/* Main Tasks */}
                  <td className="py-4 px-4">
                    {handleLongText(
                      department.mainTasks,
                      `${department.name} - ${t("Main Tasks")}`
                    )}
                  </td>

                  {/* Files & Reports - Now shows a button to open modal */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() =>
                        setFilesReportsModal({ isOpen: true, department })
                      }
                      className={`px-4 py-2 rounded-md transition-colors ${
                        isLightMode
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
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
                        <span>{t("View Files & Reports")}</span>
                      </div>
                    </button>
                  </td>

                  {/* Development Programs - Now shows a button to open modal */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() =>
                        setDevelopmentProgramsModal({
                          isOpen: true,
                          department,
                        })
                      }
                      className={`px-4 py-2 rounded-md transition-colors ${
                        isLightMode
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5"
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
                        <span>{t("View Programs")}</span>
                      </div>
                    </button>
                  </td>

                  {/* Actions */}
                  {(isAdmin || hasEditPermission) && (
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-center">
                        {(isAdmin || hasEditPermission) && (
                          <NavigateButton
                            data={department}
                            className="cursor-pointer p-2 w-10 h-10 flex justify-center items-center rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30 transition-colors"
                          >
                            <Image
                              src={PencilIcon}
                              alt="edit icon"
                              height={18}
                              width={18}
                            />
                          </NavigateButton>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Text Modal */}
      {textModal.isOpen && (
        <TextModal
          content={textModal.content}
          title={textModal.title}
          onClose={() =>
            setTextModal({ isOpen: false, content: "", title: "" })
          }
        />
      )}

      {/* Files & Reports Modal */}
      {filesReportsModal.isOpen && filesReportsModal.department && (
        <FilesReportsModal
          department={filesReportsModal.department}
          onClose={() =>
            setFilesReportsModal({ isOpen: false, department: null })
          }
          onOpenFile={handleOpenFile}
        />
      )}

      {/* Development Programs Modal */}
      {developmentProgramsModal.isOpen &&
        developmentProgramsModal.department && (
          <DevelopmentProgramsModal
            department={developmentProgramsModal.department}
            onClose={() =>
              setDevelopmentProgramsModal({ isOpen: false, department: null })
            }
            onOpenFile={handleOpenFile}
            onViewText={(content, title) =>
              setTextModal({ isOpen: true, content, title })
            }
          />
        )}
    </div>
  );
};

export default DepartmentsContent;
