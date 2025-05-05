import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { DepartmentType } from "@/types/DepartmentType.type";
import {
  AlertCircle,
  Briefcase,
  Building,
  Download,
  Edit,
  FileText,
  Info,
  LayoutGrid,
  Link,
  PlusCircle,
  Table2,
  Trash2,
  Users,
} from "lucide-react";
import React, { useState } from "react";

interface DepartmentDisplayProps {
  departments: DepartmentType[];
  onEdit?: (department: DepartmentType) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (department: DepartmentType) => void;
  onCreateDepartment?: () => void;
}

const DepartmentDisplay: React.FC<DepartmentDisplayProps> = ({
  departments,
  onEdit,
  onDelete,
  onViewDetails,
  onCreateDepartment,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [hoverCard, setHoverCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to handle file download
  const handleFileDownload = (e: React.MouseEvent, fileUrl: string) => {
    e.stopPropagation(); // Prevent card click
    console.log("Downloading file:", fileUrl);
    // Example: window.open(fileUrl, '_blank');
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col gap-4 col-span-12">
      {/* Enhanced Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center">
          <Building
            className={`mx-2 ${isLightMode ? "text-tblackAF" : "text-twhite"}`}
            size={22}
          />
          <h2
            className={`text-xl font-semibold ${isLightMode ? "text-tblackAF" : "text-twhite"
              }`}
          >
            {t("Departments")}
            <span className="ml-2 text-sm bg-green-500/40 rounded-full px-2 py-0.5 border-2 border-green-500/30">
              {departments.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid"
                ? "bg-green-500 text-green-100"
                : isLightMode
                  ? "bg-darkest text-tblackAF"
                  : "bg-tblack text-twhite"
                }`}
              aria-label="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${viewMode === "table"
                ? "bg-green-500 text-green-100"
                : isLightMode
                  ? "bg-darkest text-tblackAF"
                  : "bg-tblack text-twhite"
                }`}
              aria-label="Table View"
            >
              <Table2 size={20} />
            </button>
          </div>

          {/* Add Department Button */}
          {onCreateDepartment && (
            <button
              onClick={onCreateDepartment}
              className="flex items-center px-3 py-2 rounded-full bg-green-500/40 hover:bg-green-500 text-xs font-bold hover:text-green-100 border-2 border-green-500/30 transition-colors"
            >
              <PlusCircle size={16} className="mx-1" />
              {t("Add")}
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <div
              key={department.id}
              className={`rounded-lg shadow-md overflow-hidden transition-all duration-200 ${isLightMode
                ? "bg-main text-blackAF hover:bg-darker hover:text-tblackAF"
                : "bg-main text-twhite hover:bg-slate-700"
                } group cursor-pointer`}
              onMouseEnter={() => setHoverCard(department.id)}
              onMouseLeave={() => setHoverCard(null)}
              onClick={() => onViewDetails && onViewDetails(department)}
            >
              {/* Card Header */}
              <div
                className={`p-4 border-b ${isLightMode ? "border-darkest" : "border-tblack"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={`font-semibold text-lg ${isLightMode ? "text-tblackAF" : "text-twhite"
                        }`}
                    >
                      {department.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/40 border-2 border-green-500/30 mt-2">
                      {department.category}
                    </span>
                  </div>
                  <div
                    className={`flex gap-2 transition-opacity duration-200 ${hoverCard === department.id ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(department);
                        }}
                        className="p-2 rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(department.id);
                        }}
                        className="p-2 rounded-full bg-red-500/40 hover:bg-red-500 hover:text-red-100 border-2 border-red-500/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {onViewDetails && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(department);
                        }}
                        className="p-2 rounded-full bg-blue-500/40 hover:bg-blue-500 hover:text-blue-100 border-2 border-blue-500/30"
                      >
                        <Info size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Description */}
                <div className="mb-3">
                  <h4
                    className={`text-sm font-medium mb-1 ${isLightMode ? "text-tblackAF" : "text-twhite"
                      }`}
                  >
                    {t("Description")}
                  </h4>
                  <p
                    className={`text-sm line-clamp-2 ${isLightMode ? "text-blackAF" : "text-twhite/80"
                      }`}
                  >
                    {department.description}
                  </p>
                </div>

                {/* Goal */}
                <div className="mb-3">
                  <h4
                    className={`text-sm font-medium mb-1 ${isLightMode ? "text-tblackAF" : "text-twhite"
                      }`}
                  >
                    {t("Goal")}
                  </h4>
                  <p
                    className={`text-sm line-clamp-2 ${isLightMode ? "text-blackAF" : "text-twhite/80"
                      }`}
                  >
                    {department.goal}
                  </p>
                </div>

                {/* Numeric Owners */}
                {department.numericOwners &&
                  department.numericOwners.length > 0 && (
                    <div className="mb-3">
                      <h4
                        className={`text-sm font-medium mb-1 flex items-center ${isLightMode ? "text-tblackAF" : "text-twhite"
                          }`}
                      >
                        <Users size={14} className="mx-1" />
                        {t("Numeric Owners")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {department.numericOwners.map((owner, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-xs bg-green-500/20 rounded-full px-2 py-1 border border-green-500/30"
                          >
                            <span className="font-medium">
                              {owner.category}:
                            </span>
                            <span className="ml-1 font-bold">
                              {owner.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Supporting Files */}
                {department.supportingFiles &&
                  department.supportingFiles.length > 0 && (
                    <div className="mb-3">
                      <h4
                        className={`text-sm font-medium mb-1 flex items-center ${isLightMode ? "text-tblackAF" : "text-twhite"
                          }`}
                      >
                        <FileText size={14} className="mx-1" />
                        {t("Supporting Files")}
                      </h4>
                      <div
                        className={`flex flex-col gap-1 max-h-20 overflow-y-auto p-2 rounded-md ${isLightMode ? "bg-darkest/10" : "bg-tblack/30"
                          }`}
                      >
                        {department.supportingFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-xs"
                          >
                            <span
                              className={`truncate max-w-[70%] ${isLightMode ? "text-blackAF" : "text-twhite/80"
                                }`}
                            >
                              {file.split("/").pop()}
                            </span>
                            <button
                              onClick={(e) => handleFileDownload(e, file)}
                              className="p-1 rounded-full bg-blue-500/30 hover:bg-blue-500 hover:text-blue-100 border border-blue-500/30"
                            >
                              <Download size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Card Footer */}
              <div
                className={`p-4 border-t ${isLightMode ? "border-darkest" : "border-tblack"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs flex items-center ${isLightMode ? "text-blackAF" : "text-twhite/80"
                        }`}
                    >
                      <FileText size={12} className="mx-1" />
                      {t("Reports")}: {department.requiredReports?.length || 0}
                    </span>
                    <span
                      className={`text-xs flex items-center ${isLightMode ? "text-blackAF" : "text-twhite/80"
                        }`}
                    >
                      <Briefcase size={12} className="mx-1" />
                      {t("Programs")}:{" "}
                      {department.developmentPrograms?.length || 0}
                    </span>
                  </div>
                  {department.parent_department && (
                    <div
                      className={`text-xs flex items-center ${isLightMode ? "text-blackAF" : "text-twhite/80"
                        }`}
                    >
                      <Link size={12} className="mx-1" />
                      <span>{department.parent_department}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table
            className={`min-w-full ${isLightMode ? "bg-main text-blackAF" : "bg-main text-twhite"
              } rounded-lg shadow-md`}
          >
            <thead
              className={`${isLightMode
                ? "bg-darkest text-tblackAF"
                : "bg-tblack text-twhite"
                }`}
            >
              <tr>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Name")}
                </th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Category")}
                </th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Description")}
                </th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  <Users size={14} className="inline mx-1" />
                  {t("Owners")}
                </th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  <FileText size={14} className="inline mx-1" />
                  {t("Reports")}
                </th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  <Briefcase size={14} className="inline mx-1" />
                  {t("Programs")}
                </th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((department) => (
                <tr
                  key={department.id}
                  className={`${isLightMode
                    ? "hover:bg-darker text-blackAF hover:text-tblackAF"
                    : "hover:bg-slate-700 text-twhite"
                    } group transition-colors cursor-pointer`}
                  onClick={() => onViewDetails && onViewDetails(department)}
                >
                  <td className="py-3 px-4 text-center">
                    <div className="font-medium">{department.name}</div>
                    {department.parent_department && (
                      <div className="text-xs mt-1 flex items-center justify-center opacity-70">
                        <Link size={10} className="mx-1" />
                        {department.parent_department}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/40 border-2 border-green-500/30">
                      {department.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center max-w-xs">
                    <div className="truncate">{department.description}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                      {department.numericOwners?.map((owner, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center text-xs bg-green-500/20 rounded-full px-2 py-1 border border-green-500/30"
                        >
                          <span className="font-medium">
                            {owner.category.substring(0, 3)}:
                          </span>
                          <span className="ml-1 font-bold">{owner.count}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {department.requiredReports?.length || 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {department.developmentPrograms?.length || 0}
                  </td>
                  <td className="py-3 px-4 flex gap-2 justify-center">
                    {onViewDetails && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(department);
                        }}
                        className="cursor-pointer p-2 w-10 text-xs flex justify-center font-bold rounded-full bg-blue-500/40 hover:bg-blue-500 hover:text-blue-100 border-2 border-blue-500/30"
                        title={t("View Details")}
                      >
                        <Info size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(department);
                        }}
                        className="cursor-pointer p-2 w-10 text-xs flex justify-center font-bold rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30"
                        title={t("Edit")}
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(department.id);
                        }}
                        className="cursor-pointer p-2 w-10 text-xs flex justify-center font-bold rounded-full bg-red-500/40 hover:bg-red-500 hover:text-red-100 border-2 border-red-500/30"
                        title={t("Delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div
          className={`p-8 rounded-lg text-center ${isLightMode ? "bg-main text-blackAF" : "bg-main text-twhite"
            } shadow-md`}
        >
          <div className="flex flex-col items-center justify-center">
            <AlertCircle size={40} className="mb-4 text-red-500/70" />
            <p
              className={`mb-4 ${isLightMode ? "text-blackAF" : "text-twhite"}`}
            >
              {searchTerm
                ? t("No departments match your search criteria.")
                : t("No departments found.")}
            </p>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 rounded-md bg-blue-500/40 hover:bg-blue-500 hover:text-blue-100 border-2 border-blue-500/30 text-sm font-medium"
              >
                {t("Clear Search")}
              </button>
            )}

            {!searchTerm && onCreateDepartment && (
              <button
                onClick={onCreateDepartment}
                className="px-4 py-2 rounded-md bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30 text-sm font-medium"
              >
                <PlusCircle size={16} className="inline mx-2" />
                {t("Add Department")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDisplay;
