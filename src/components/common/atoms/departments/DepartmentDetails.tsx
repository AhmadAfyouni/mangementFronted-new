import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { DepartmentType } from "@/types/DepartmentType.type";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  FileBox,
  FileText,
  Info,
  Link,
  Tag,
  Target,
  User,
  Users,
  X,
} from "lucide-react";
import React from "react";

interface DepartmentDetailsProps {
  department: DepartmentType;
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentDetails: React.FC<DepartmentDetailsProps> = ({
  department,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  if (!isOpen) return null;

  // Function to handle file download
  const handleFileDownload = (fileUrl: string) => {
    // Implementation would depend on your file storage system
    console.log("Downloading file:", fileUrl);
    // Example: window.open(fileUrl, '_blank');
  };

  // Function to copy department info to clipboard
  const handleCopyInfo = () => {
    const info = `
Department: ${department.name}
Category: ${department.category}
Description: ${department.description}
Goal: ${department.goal}
Main Tasks: ${department.mainTasks}
    `;
    navigator.clipboard.writeText(info);
    // You could add a toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${
            isLightMode ? "bg-main text-blackAF" : "bg-main text-twhite"
          }`}
        >
          {/* Enhanced Modal Header */}
          <div
            className={`px-6 py-4 border-b ${
              isLightMode ? "border-darkest" : "border-tblack"
            } flex justify-between items-center
            bg-gradient-to-r ${
              isLightMode
                ? "from-darkest to-darkest"
                : "to-dark from-transparent"
            }`}
          >
            <div className="flex items-center">
              <Building
                className={`mr-2 ${
                  isLightMode ? "text-green-500" : "text-green-400"
                }`}
                size={22}
              />
              <div>
                <h3
                  className={`text-xl font-semibold ${
                    isLightMode ? "text-tblackAF" : "text-twhite"
                  }`}
                >
                  {department.name}
                </h3>
                <div className="mt-1 flex items-center">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-500/40 border-2 border-green-500/30 mr-2">
                    {department.category}
                  </span>
                  <span className="text-xs flex items-center opacity-70">
                    <Clock size={12} className="mr-1" />
                    {t("Last updated")} 2 {t("days ago")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyInfo}
                className={`p-2 rounded-full ${
                  isLightMode
                    ? "bg-darkest hover:bg-darkest text-tblackAF"
                    : "bg-dark hover:bg-dark text-twhite"
                } transition-colors`}
                title={t("Copy department info")}
              >
                <Copy size={18} />
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${
                  isLightMode
                    ? "bg-darkest hover:bg-darkest text-tblackAF"
                    : "bg-dark hover:bg-dark text-twhite"
                } transition-colors`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                {/* Basic Info */}
                <div className="mb-6">
                  <h4
                    className={`text-md font-medium mb-3 flex items-center ${
                      isLightMode ? "text-tblackAF" : "text-twhite"
                    }`}
                  >
                    <Info
                      size={16}
                      className={`mr-2 ${
                        isLightMode ? "text-blue-500" : "text-blue-400"
                      }`}
                    />
                    {t("Basic Information")}
                  </h4>
                  <div
                    className={`rounded-lg p-4 ${
                      isLightMode ? "bg-darkest" : "bg-dark"
                    } border ${
                      isLightMode ? "border-darkest" : "border-tblack"
                    }`}
                  >
                    <div className="mb-3">
                      <div
                        className={`text-sm font-medium mb-1 flex items-center ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        <Tag size={14} className="mr-1" />
                        {t("Category")}
                      </div>
                      <div
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/40 border-2 border-green-500/30">
                          {department.category}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {t("Description")}
                      </div>
                      <div
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {department.description}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div
                        className={`text-sm font-medium mb-1 flex items-center ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        <Target size={14} className="mr-1" />
                        {t("Goal")}
                      </div>
                      <div
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {department.goal}
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-sm font-medium mb-1 flex items-center ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        <ClipboardList size={14} className="mr-1" />
                        {t("Main Tasks")}
                      </div>
                      <div
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {department.mainTasks}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Numeric Owners - Enhanced with visual indicators */}
                <div className="mb-6">
                  <h4
                    className={`text-md font-medium mb-3 flex items-center ${
                      isLightMode ? "text-tblackAF" : "text-twhite"
                    }`}
                  >
                    <Users
                      size={16}
                      className={`mr-2 ${
                        isLightMode ? "text-blue-500" : "text-blue-400"
                      }`}
                    />
                    {t("Numeric Owners")}
                  </h4>
                  <div
                    className={`rounded-lg p-4 ${
                      isLightMode ? "bg-darkest" : "bg-dark"
                    } border ${
                      isLightMode ? "border-darkest" : "border-tblack"
                    }`}
                  >
                    {department.numericOwners &&
                    department.numericOwners.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {department.numericOwners.map((owner, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col p-3 rounded-lg bg-green-500/30 border-2 border-green-500/20"
                          >
                            <span
                              className={`text-sm font-medium ${
                                isLightMode ? "text-tblackAF" : "text-twhite"
                              }`}
                            >
                              {owner.category}
                            </span>
                            <span
                              className={`text-lg font-semibold mt-1 ${
                                isLightMode
                                  ? "text-green-600"
                                  : "text-green-400"
                              }`}
                            >
                              {owner.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {t("No numeric owners defined.")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Supporting Files - Enhanced with better file indicators */}
                <div className="mb-6">
                  <h4
                    className={`text-md font-medium mb-3 flex items-center ${
                      isLightMode ? "text-tblackAF" : "text-twhite"
                    }`}
                  >
                    <FileBox
                      size={16}
                      className={`mr-2 ${
                        isLightMode ? "text-blue-500" : "text-blue-400"
                      }`}
                    />
                    {t("Supporting Files")}
                  </h4>
                  <div
                    className={`rounded-lg p-4 ${
                      isLightMode ? "bg-darkest" : "bg-dark"
                    } border ${
                      isLightMode ? "border-darkest" : "border-tblack"
                    }`}
                  >
                    {department.supportingFiles &&
                    department.supportingFiles.length > 0 ? (
                      <div className="space-y-2">
                        {department.supportingFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className={`py-2 px-3 flex justify-between items-center rounded-lg ${
                              isLightMode ? "hover:bg-darkest" : "hover:bg-dark"
                            } transition-colors group`}
                          >
                            <span
                              className={`text-sm truncate max-w-[80%] ${
                                isLightMode ? "text-tblackAF" : "text-twhite"
                              }`}
                            >
                              {file.split("/").pop()}
                            </span>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className={`p-2 rounded-full ${
                                isLightMode
                                  ? "bg-blue-500/30 hover:bg-blue-500/50 text-blue-600"
                                  : "bg-blue-500/30 hover:bg-blue-500/50 text-blue-300"
                              } border border-blue-500/30 opacity-80 group-hover:opacity-100 transition-opacity`}
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {t("No supporting files uploaded.")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Status Card - New Section */}
                <div className="mb-6">
                  <h4
                    className={`text-md font-medium mb-3 flex items-center ${
                      isLightMode ? "text-tblackAF" : "text-twhite"
                    }`}
                  >
                    <CheckCircle
                      size={16}
                      className={`mr-2 ${
                        isLightMode ? "text-green-500" : "text-green-400"
                      }`}
                    />
                    {t("Status")}
                  </h4>
                  <div
                    className={`rounded-lg p-4 ${
                      isLightMode ? "bg-darkest" : "bg-dark"
                    } border ${
                      isLightMode ? "border-darkest" : "border-tblack"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-sm font-medium ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {t("Current Status")}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/40 border-2 border-green-500/30">
                        {t("Active")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-sm font-medium ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        <Calendar size={14} className="inline mr-1" />
                        {t("Created Date")}
                      </span>
                      <span
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        01/01/2023
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        <User size={14} className="inline mr-1" />
                        {t("Created By")}
                      </span>
                      <span
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        Admin User
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parent Department - Enhanced with more details */}
                {department.parent_department && (
                  <div className="mb-6">
                    <h4
                      className={`text-md font-medium mb-3 flex items-center ${
                        isLightMode ? "text-tblackAF" : "text-twhite"
                      }`}
                    >
                      <Link
                        size={16}
                        className={`mr-2 ${
                          isLightMode ? "text-blue-500" : "text-blue-400"
                        }`}
                      />
                      {t("Parent Department")}
                    </h4>
                    <div
                      className={`rounded-lg p-4 ${
                        isLightMode ? "bg-darkest" : "bg-dark"
                      } border ${
                        isLightMode ? "border-darkest" : "border-tblack"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        <div className="flex items-center">
                          <Building
                            size={16}
                            className={`mr-2 ${
                              isLightMode ? "text-green-500" : "text-green-400"
                            }`}
                          />
                          <div>
                            <div className="font-medium">
                              {department.parent_department}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              ID: {department.parent_department}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`p-2 rounded-full ${
                            isLightMode
                              ? "bg-darkest hover:bg-darkest"
                              : "bg-dark hover:bg-dark"
                          }`}
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Reports - Enhanced styling */}
                <div className="mb-6">
                  <h4
                    className={`text-md font-medium mb-3 flex items-center ${
                      isLightMode ? "text-tblackAF" : "text-twhite"
                    }`}
                  >
                    <FileText
                      size={16}
                      className={`mr-2 ${
                        isLightMode ? "text-blue-500" : "text-blue-400"
                      }`}
                    />
                    {t("Required Reports")}
                  </h4>
                  <div
                    className={`rounded-lg p-4 ${
                      isLightMode ? "bg-darkest" : "bg-dark"
                    } border ${
                      isLightMode ? "border-darkest" : "border-tblack"
                    }`}
                  >
                    {department.requiredReports &&
                    department.requiredReports.length > 0 ? (
                      <div className="space-y-3">
                        {department.requiredReports.map((report, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              isLightMode
                                ? "border border-darkest bg-darkest"
                                : "border border-tblack bg-dark"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div
                                className={`text-sm font-medium ${
                                  isLightMode ? "text-tblackAF" : "text-twhite"
                                }`}
                              >
                                {report.name}
                              </div>
                              {report.templateFile && (
                                <button
                                  onClick={() =>
                                    handleFileDownload(report.templateFile)
                                  }
                                  className={`p-2 rounded-full ${
                                    isLightMode
                                      ? "bg-blue-500/30 hover:bg-blue-500/50 text-blue-600"
                                      : "bg-blue-500/30 hover:bg-blue-500/50 text-blue-300"
                                  } border border-blue-500/30`}
                                >
                                  <Download size={14} />
                                </button>
                              )}
                            </div>
                            <div
                              className={`text-xs mt-2 ${
                                isLightMode ? "text-tblackAF" : "text-twhite"
                              }`}
                            >
                              {report.templateFile ? (
                                <span className="flex items-center">
                                  <FileText size={12} className="mr-1" />
                                  {report.templateFile.split("/").pop()}
                                </span>
                              ) : (
                                <span>{t("No template file available")}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {t("No required reports defined.")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Development Programs - Enhanced styling */}
                <div className="mb-6">
                  <h4
                    className={`text-md font-medium mb-3 flex items-center ${
                      isLightMode ? "text-tblackAF" : "text-twhite"
                    }`}
                  >
                    <Briefcase
                      size={16}
                      className={`mr-2 ${
                        isLightMode ? "text-blue-500" : "text-blue-400"
                      }`}
                    />
                    {t("Development Programs")}
                  </h4>
                  <div
                    className={`rounded-lg p-4 ${
                      isLightMode ? "bg-darkest" : "bg-dark"
                    } border ${
                      isLightMode ? "border-darkest" : "border-tblack"
                    }`}
                  >
                    {department.developmentPrograms &&
                    department.developmentPrograms.length > 0 ? (
                      <div className="space-y-4">
                        {department.developmentPrograms.map((program, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              isLightMode
                                ? "border border-darkest bg-darkest"
                                : "border border-tblack bg-dark"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div
                                  className={`text-sm font-medium ${
                                    isLightMode
                                      ? "text-tblackAF"
                                      : "text-twhite"
                                  }`}
                                >
                                  {program.programName}
                                </div>
                                <div
                                  className={`text-xs mt-1 flex items-center ${
                                    isLightMode
                                      ? "text-tblackAF"
                                      : "text-twhite"
                                  }`}
                                >
                                  <Target size={12} className="mr-1" />
                                  {t("Objective")}: {program.objective}
                                </div>
                              </div>
                              {program.programFile && (
                                <button
                                  onClick={() =>
                                    handleFileDownload(program.programFile)
                                  }
                                  className={`p-2 rounded-full ${
                                    isLightMode
                                      ? "bg-blue-500/30 hover:bg-blue-500/50 text-blue-600"
                                      : "bg-blue-500/30 hover:bg-blue-500/50 text-blue-300"
                                  } border border-blue-500/30`}
                                >
                                  <Download size={14} />
                                </button>
                              )}
                            </div>
                            {program.notes && (
                              <div
                                className={`mt-2 p-2 rounded ${
                                  isLightMode ? "bg-darkest" : "bg-dark"
                                } text-xs`}
                              >
                                <div
                                  className={`font-medium mb-1 flex items-center ${
                                    isLightMode
                                      ? "text-tblackAF"
                                      : "text-twhite"
                                  }`}
                                >
                                  <Info size={12} className="mr-1" />
                                  {t("Notes")}:
                                </div>
                                <div
                                  className={`${
                                    isLightMode
                                      ? "text-tblackAF"
                                      : "text-twhite"
                                  }`}
                                >
                                  {program.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        className={`text-sm ${
                          isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                      >
                        {t("No development programs defined.")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Modal Footer */}
          <div
            className={`px-6 py-4 border-t ${
              isLightMode ? "border-darkest" : "border-tblack"
            } 
            bg-gradient-to-r ${
              isLightMode
                ? "from-darkest to-transparent"
                : "to-dark from-transparent"
            }
            flex justify-between items-center`}
          >
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-full flex items-center ${
                isLightMode
                  ? "bg-darkest hover:bg-darkest text-tblackAF"
                  : "bg-dark hover:bg-dark text-twhite"
              } transition-colors`}
            >
              <ArrowLeft size={16} className="mr-2" />
              {t("Back to Departments")}
            </button>

            <div className="flex space-x-2">
              <button className="px-4 py-2 rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30 text-sm font-bold">
                <Edit size={16} className="inline mr-2" />
                {t("Edit Department")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetails;
