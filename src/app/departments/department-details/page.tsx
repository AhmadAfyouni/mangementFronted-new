"use client";

import GridContainer from "@/components/common/atoms/ui/GridContainer";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { DepartmentType } from "@/types/DepartmentType.type";
import { Building2, Users, FileText, Briefcase, ArrowLeft, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const DepartmentDetails = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLightMode } = useCustomTheme();
  const departmentId = searchParams.get("id");
  const [department, setDepartment] = useState<DepartmentType | null>(null);

  // Fetch department data
  const { data: departmentData, isLoading } = useCustomQuery<DepartmentType>({
    queryKey: ["department", departmentId],
    url: `/department/${departmentId}`,
    enabled: !!departmentId,
  });

  // Set department data when loaded
  useEffect(() => {
    if (departmentData) {
      setDepartment(departmentData);
    }
  }, [departmentData]);

  // Handle navigation back to departments list
  const handleBack = () => {
    router.back();
  };

  // Handle file opening
  const handleOpenFile = (url: string) => {
    if (!url) return;
    
    // Make sure the URL is properly formatted
    let fullUrl = url;
    
    // Check if URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://168.231.110.121:8011';
      fullUrl = `${baseUrl}${url}`;
    }
    
    // Prevent duplicate URL issues
    if (fullUrl.includes('http://http://') || fullUrl.includes('https://https://')) {
      fullUrl = fullUrl.replace('http://http://', 'http://');
      fullUrl = fullUrl.replace('https://https://', 'https://');
    }
    
    window.open(fullUrl, "_blank");
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

  if (isLoading) {
    return (
      <GridContainer>
        <div className={`${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"} p-8 rounded-xl shadow-lg w-full col-span-full text-twhite`}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-600 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-600 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-600 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-600 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GridContainer>
    );
  }

  if (!department) {
    return (
      <GridContainer>
        <div className={`${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"} p-8 rounded-xl shadow-lg w-full col-span-full text-twhite`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold">{t("Department Not Found")}</h2>
              <p className="text-gray-400 mt-2">
                {t("The department you're looking for doesn't exist or has been deleted.")}
              </p>
              <button 
                onClick={handleBack}
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("Back to Departments")}
              </button>
            </div>
          </div>
        </div>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <div className={`${isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"} p-8 rounded-xl shadow-lg w-full col-span-full text-twhite`}>
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Back to Departments")}
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className={`p-4 rounded-xl ${department.category === 'primary-department' ? 'bg-blue-900/30' : department.category === 'secondary-department' ? 'bg-purple-900/30' : 'bg-green-900/30'}`}>
              <Building2 className={`w-8 h-8 ${department.category === 'primary-department' ? 'text-blue-400' : department.category === 'secondary-department' ? 'text-purple-400' : 'text-green-400'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{department.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  department.category === 'primary-department' ? 'bg-blue-900/40 text-blue-400' :
                  department.category === 'secondary-department' ? 'bg-purple-900/40 text-purple-400' : 
                  'bg-green-900/40 text-green-400'
                }`}>
                  {department.category}
                </span>
                {department.parent_department && (
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{department.parent_department.name || t("Parent Department")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-800/50 px-4 py-2 text-center">
              <div className="text-2xl font-bold text-blue-400">{department.numericOwners?.length || 0}</div>
              <div className="text-xs text-gray-400 mt-1">{t("Numeric Owners")}</div>
            </div>
            <div className="rounded-lg bg-gray-800/50 px-4 py-2 text-center">
              <div className="text-2xl font-bold text-green-400">{department.requiredReports?.length || 0}</div>
              <div className="text-xs text-gray-400 mt-1">{t("Reports")}</div>
            </div>
            <div className="rounded-lg bg-gray-800/50 px-4 py-2 text-center">
              <div className="text-2xl font-bold text-amber-400">{department.developmentPrograms?.length || 0}</div>
              <div className="text-xs text-gray-400 mt-1">{t("Programs")}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Department Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Department Goal */}
            <div className="bg-secondary rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                {t("Department Goal")}
              </h2>
              <p className="text-gray-300 whitespace-pre-line">{department.goal || t("No goal defined for this department.")}</p>
            </div>

            {/* Main Tasks */}
            <div className="bg-secondary rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                {t("Main Tasks")}
              </h2>
              <p className="text-gray-300 whitespace-pre-line">{department.mainTasks || t("No main tasks defined for this department.")}</p>
            </div>

            {/* Numeric Owners */}
            {department.numericOwners && department.numericOwners.length > 0 && (
              <div className="bg-secondary rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  {t("Numeric Owners")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {department.numericOwners.map((owner, index) => (
                    <div key={index} className="bg-dark/30 rounded-lg p-4 border border-dark">
                      <h3 className="font-medium text-gray-200 mb-1">{owner.category}</h3>
                      <div className="text-2xl font-bold text-blue-400">{owner.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Files, Reports and Programs */}
          <div className="space-y-6">
            {/* Supporting Files */}
            <div className="bg-secondary rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                {t("Supporting Files")}
              </h2>
              {department.supportingFiles && department.supportingFiles.length > 0 ? (
                <div className="space-y-3">
                  {department.supportingFiles.map((file, index) => (
                    <div key={index} className="bg-dark/30 rounded-lg p-3 border border-dark flex items-center justify-between">
                      <div className="truncate max-w-[200px]">
                        {getFilenameFromUrl(file.currentVersion.fileUrl)}
                      </div>
                      <button
                        onClick={() => handleOpenFile(file.currentVersion.fileUrl)}
                        className="ml-2 px-3 py-1 text-sm rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                      >
                        {t("Open")}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t("No supporting files available")}
                </div>
              )}
            </div>

            {/* Required Reports */}
            <div className="bg-secondary rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                {t("Required Reports")}
              </h2>
              {department.requiredReports && department.requiredReports.length > 0 ? (
                <div className="space-y-3">
                  {department.requiredReports.map((report, index) => (
                    <div key={index} className="bg-dark/30 rounded-lg p-3 border border-dark">
                      <div className="font-medium text-gray-200 mb-2">{report.name}</div>
                      {report.templateFileId && (
                        <button
                          onClick={() => handleOpenFile(
                            typeof report.templateFileId === 'string'
                              ? report.templateFileId
                              : report.templateFileId?.currentVersion?.fileUrl
                          )}
                          className="w-full px-3 py-2 text-sm rounded-md bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          {t("View Template")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t("No required reports available")}
                </div>
              )}
            </div>

            {/* Development Programs */}
            <div className="bg-secondary rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-400" />
                </div>
                {t("Development Programs")}
              </h2>
              {department.developmentPrograms && department.developmentPrograms.length > 0 ? (
                <div className="space-y-3">
                  {department.developmentPrograms.map((program, index) => (
                    <div key={index} className="bg-dark/30 rounded-lg p-3 border border-dark">
                      <div className="font-medium text-gray-200 mb-1">{program.programName}</div>
                      <div className="text-sm text-gray-400 mb-2">{program.objective}</div>
                      {program.programFileId && (
                        <button
                          onClick={() => handleOpenFile(
                            typeof program.programFileId === 'string'
                              ? program.programFileId
                              : program.programFileId?.currentVersion?.fileUrl
                          )}
                          className="w-full px-3 py-2 text-sm rounded-md bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          {t("View Program File")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t("No development programs available")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GridContainer>
  );
};

export default DepartmentDetails;
