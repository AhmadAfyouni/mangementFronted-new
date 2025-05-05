import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { DepartmentType } from "@/types/DepartmentType.type";
import { useState } from "react";

interface TextModalProps {
    content: string;
    title: string;
    onClose: () => void;
}

// Modal component for viewing long text content
export const TextModal: React.FC<TextModalProps> = ({ content, title, onClose }) => {
    const { isLightMode } = useCustomTheme();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
                className={`bg-main ${isLightMode ? "text-blackAF" : "text-twhite"
                    } p-6 rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto border ${isLightMode ? "border-gray-300" : "border-gray-700"
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

export const FilesReportsModal: React.FC<FilesReportsModalProps> = ({
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors focus:outline-none ${isLightMode
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
                className={`bg-main ${isLightMode ? "text-blackAF" : "text-twhite"
                    } p-6 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto border ${isLightMode ? "border-gray-300" : "border-gray-700"
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

                <div className="gap-6">
                    {/* Supporting Files Section */}
                    <div>
                        <h4
                            className={`text-lg font-semibold mb-4 ${isLightMode ? "text-gray-800" : "text-gray-100"
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
                                        className={`p-3 rounded-lg ${isLightMode
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
                                className={`text-center py-6 px-4 rounded-lg ${isLightMode ? "bg-gray-50" : "bg-gray-800/30"
                                    }`}
                            >
                                <p
                                    className={`${isLightMode ? "text-gray-500" : "text-gray-400"
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
                            className={`text-lg font-semibold mb-4 ${isLightMode ? "text-gray-800" : "text-gray-100"
                                }`}
                        >
                            {t("Required Reports")}
                        </h4>

                        {department.requiredReports &&
                            department.requiredReports.length > 0 ? (
                            <div className="gap-3">
                                {department.requiredReports.map((report, index) => (
                                    <div
                                        key={`report-${index}`}
                                        className={`p-4 rounded-lg flex items-center justify-between ${isLightMode
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
                                className={`text-center py-6 px-4 rounded-lg ${isLightMode ? "bg-gray-50" : "bg-gray-800/30"
                                    }`}
                            >
                                <p
                                    className={`${isLightMode ? "text-gray-500" : "text-gray-400"
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

export const DevelopmentProgramsModal: React.FC<DevelopmentProgramsModalProps> = ({
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors focus:outline-none ${isLightMode
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
                className={`bg-main ${isLightMode ? "text-blackAF" : "text-twhite"
                    } p-6 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto border ${isLightMode ? "border-gray-300" : "border-gray-700"
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

                <div className="gap-6">
                    {department.developmentPrograms &&
                        department.developmentPrograms.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {department.developmentPrograms.map((program, index) => (
                                <div
                                    key={`program-${index}`}
                                    className={`p-5 rounded-lg ${isLightMode
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

                                    <div className="gap-4">
                                        <div
                                            className={`p-3 rounded-md ${isLightMode ? "bg-white/80" : "bg-gray-800/50"
                                                }`}
                                        >
                                            <h5 className="font-medium mb-2">{t("Objective")}</h5>
                                            <div
                                                className={`${isLightMode ? "text-gray-700" : "text-gray-300"
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
                                                className={`p-3 rounded-md ${isLightMode ? "bg-white/80" : "bg-gray-800/50"
                                                    }`}
                                            >
                                                <h5 className="font-medium mb-2">{t("Notes")}</h5>
                                                <div
                                                    className={`${isLightMode ? "text-gray-700" : "text-gray-300"
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
                            className={`text-center py-10 px-4 rounded-lg ${isLightMode ? "bg-gray-50" : "bg-gray-800/30"
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