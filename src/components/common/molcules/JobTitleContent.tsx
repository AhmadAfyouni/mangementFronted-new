import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { JobTitleType, RoutineTaskType } from "@/types/JobTitle.type";
import Image from "next/image";
import { useEffect, useState } from "react";
import CustomModal from "../atoms/modals/CustomModal";
import RoutineTasksModal from "../atoms/modals/RoutineTasksModal";
import PageSpinner from "../atoms/ui/PageSpinner";
import { Info, Briefcase, Building2, Hash, Users, FileText, Shield, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import useGlobalSearch, { SearchConfig } from "@/hooks/departments/useGlobalSearch";
import { setActiveEntity } from "@/state/slices/searchSlice";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import React from "react";

const JobTitleRowComponent: React.FC<{
  job: JobTitleType;
  isAdmin: boolean;
  hasEditPermission: boolean;
  t: (key: string) => string;
  onShowMore: (type: "responsibilities" | "permissions", title: string, items: string[]) => void;
  onShowRoutineTasks: (title: string, tasks: RoutineTaskType[]) => void;
}> = ({ job, isAdmin, hasEditPermission, t, onShowMore, onShowRoutineTasks }) => {

  const getDepartmentColor = (deptName?: string) => {
    if (!deptName) return 'border-l-gray-400';

    const deptLower = deptName.toLowerCase();
    if (deptLower.includes("hr") || deptLower.includes("human")) {
      return 'border-l-blue-500';
    } else if (deptLower.includes("tech") || deptLower.includes("it") || deptLower.includes("engineering")) {
      return 'border-l-purple-500';
    } else if (deptLower.includes("finance") || deptLower.includes("accounting")) {
      return 'border-l-green-500';
    } else if (deptLower.includes("marketing") || deptLower.includes("sales")) {
      return 'border-l-amber-500';
    } else {
      return 'border-l-teal-500';
    }
  };

  const getDepartmentBadgeColor = (deptName?: string) => {
    if (!deptName) return "bg-gray-500/20 text-gray-400 border-gray-500/30";

    const deptLower = deptName.toLowerCase();
    if (deptLower.includes("hr") || deptLower.includes("human")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    } else if (deptLower.includes("tech") || deptLower.includes("it") || deptLower.includes("engineering")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    } else if (deptLower.includes("finance") || deptLower.includes("accounting")) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    } else if (deptLower.includes("marketing") || deptLower.includes("sales")) {
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    } else {
      return "bg-teal-500/20 text-teal-400 border-teal-500/30";
    }
  };

  const handleLongText = (text: string | undefined, maxLength = 50): React.ReactNode => {
    if (!text) return <span className="text-gray-500">{t("N/A")}</span>;

    if (text.length <= maxLength) return text;

    return (
      <div>
        <span>{text.substring(0, maxLength)}...</span>
      </div>
    );
  };

  return (
    <div
      className={`grid grid-cols-8 gap-6 px-8 py-4 group border-l-4 ${getDepartmentColor(job.department?.name)} hover:bg-secondary/50 transition-all duration-300 bg-dark border-b border-1 border-main`}
    >
      {/* Job ID */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-blue-400 hover:text-blue-300">
          {job.id.slice(-5).toUpperCase()}
        </span>
      </div>

      {/* Job Title Info */}
      <div className="flex items-center pr-4 col-span-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {job.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-twhite group-hover:text-blue-300 transition-colors duration-300 truncate">
              {job.title}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{job.is_manager ? "manager" : "employee"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department */}
      <div className="flex flex-col justify-center px-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-2 w-fit ${getDepartmentBadgeColor(job.department?.name)}`}>
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{job.department?.name || t("No Department")}</span>
        </span>
      </div>

      {/* Responsibilities */}
      <div className="flex items-center px-4">
        <button
          onClick={() =>
            onShowMore(
              "responsibilities",
              t("Responsibilities"),
              job.responsibilities
            )
          }
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 border border-blue-900/30 transition-all duration-200"
        >
          <Users className="w-4 h-4" />
          <span>{job.responsibilities.length}</span>
        </button>
      </div>

      {/* Permissions */}
      <div className="flex items-center px-4">
        <button
          onClick={() =>
            onShowMore(
              "permissions",
              t("Permissions"),
              job.permissions
            )
          }
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-900/20 text-green-400 hover:bg-green-900/30 border border-green-900/30 transition-all duration-200"
        >
          <Shield className="w-4 h-4" />
          <span>{job.permissions.length}</span>
        </button>
      </div>

      {/* Routine Tasks */}
      <div className="flex items-center px-4">
        {job.hasRoutineTasks && job.routineTasks && job.routineTasks.length > 0 ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onShowRoutineTasks(
                  job.title,
                  job.routineTasks
                )
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-purple-900/20 text-purple-400 hover:bg-purple-900/30 border border-purple-900/30 transition-all duration-200"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{job.routineTasks.length}</span>
            </button>

          </div>
        ) : (
          <span className="text-gray-500 text-sm">{t("None")}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pl-4">
        {(isAdmin || hasEditPermission) && (
          <RouteWrapper href={`/jobs/add-title?id=${job.id}`}>
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 border border-gray-600/20 hover:border-green-500/30 cursor-pointer">
              <Image
                src={PencilIcon}
                alt="edit icon"
                height={16}
                width={16}
              />
            </div>
          </RouteWrapper>
        )}
      </div>
    </div>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
  t: (key: string) => string;
}> = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems, t }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-dark border-t border-gray-700">
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{t("Show")}</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-secondary border border-gray-600 text-twhite rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px]"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-gray-400">{t("per page")}</span>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-400">
        {t("Showing")} {startItem} {t("to")} {endItem} {t("of")} {totalItems} {t("results")}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("First page")}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("Previous page")}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                    ? 'bg-blue-500 text-white border border-blue-500'
                    : 'border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50'
                    }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("Next page")}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("Last page")}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const JobTitleContent = ({ selectedOption }: { selectedOption: string }) => {
  const { t, currentLanguage } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["job_title_update"]);
  const { isLightMode } = useCustomTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string[];
  } | null>(null);

  // Add state for routine tasks modal
  const [isRoutineTasksModalOpen, setIsRoutineTasksModalOpen] = useState(false);
  const [routineTasksModalContent, setRoutineTasksModalContent] = useState<{
    title: string;
    tasks: RoutineTaskType[];
  } | null>(null);

  // Get search query from Redux
  const searchQuery = useSelector((state: RootState) =>
    state.globalSearch.queries.jobTitles);
  const dispatch = useDispatch();

  // Set active entity for global search when component mounts
  useEffect(() => {
    dispatch(setActiveEntity('jobTitles'));
  }, [dispatch]);

  // Use custom query to fetch job titles
  const { data: jobs, isLoading } = useCustomQuery<JobTitleType[] | { data: JobTitleType[], meta: Record<string, unknown> }>({
    queryKey: ["jobTitles", selectedOption],
    url:
      selectedOption === "view"
        ? `/job-titles/view`
        : `/job-titles/get-job-titles`,
  });

  // Ensure we always have a valid array to work with
  const jobsData = Array.isArray(jobs)
    ? jobs
    : (jobs && 'data' in jobs && Array.isArray(jobs.data))
      ? jobs.data
      : [];

  // Search configuration
  const searchConfig: SearchConfig<JobTitleType> = {
    searchFields: ['title', 'description'] as Array<keyof JobTitleType>,
    customFilterFn: (item,) => {
      // If we have a search query, check if it matches any field
      if (searchQuery) {
        const query = searchQuery.toLowerCase();

        // Search in title and description
        const matchesTitle = item.title?.toLowerCase().includes(query) || false;
        const matchesDescription = item.description?.toLowerCase().includes(query) || false;

        // Search in responsibilities
        const matchesResponsibilities = item.responsibilities?.some(
          resp => resp.toLowerCase().includes(query)
        ) || false;

        // Search in permissions
        const matchesPermissions = item.permissions?.some(
          perm => perm.toLowerCase().includes(query)
        ) || false;

        // Search in department name
        const matchesDepartment = item.department?.name?.toLowerCase().includes(query) || false;

        // Return true if any field matches
        return matchesTitle || matchesDescription || matchesResponsibilities ||
          matchesPermissions || matchesDepartment;
      }

      // If no search query, include all items
      return true;
    }
  };

  // Use the global search hook to filter job titles
  const {
    paginatedData,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange
  } = useGlobalSearch('jobTitles', jobsData, searchConfig);

  const handleShowMore = (
    type: "responsibilities" | "permissions",
    title: string,
    items: string[]
  ) => {
    setModalContent({
      title,
      content: items,
    });
    setIsModalOpen(true);
  };

  // Add handler for showing routine tasks
  const handleShowRoutineTasks = (
    title: string,
    tasks: RoutineTaskType[]
  ) => {
    setRoutineTasksModalContent({
      title: `${title} - ${t("Routine Tasks")}`,
      tasks: tasks,
    });
    setIsRoutineTasksModalOpen(true);
  };

  const { } = useSetPageData<JobTitleType>("/jobs/add-title");

  // Function to find the jobTitleId for a given task
  const getJobTitleIdForTask = (task: RoutineTaskType, jobsData: JobTitleType[]): string => {
    const job = jobsData.find(job => job.routineTasks?.some(t => t.id === task.id));
    return job?.id || '';
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="rounded-xl shadow-md flex flex-col gap-4 col-span-12">
      {/* Job Titles Table */}
      <div className="overflow-hidden rounded-lg shadow-lg shadow-black/20 border border-gray-700/50">
        {jobsData.length === 0 || paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-main">
            <Briefcase className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-twhite mb-2">
              {searchQuery
                ? t("No Results Found")
                : t("No Job Titles Found")}
            </h3>
            <p className="text-tdark">
              {searchQuery
                ? t("No job titles found matching your search criteria.")
                : t("There are no job titles in the system. Add job titles to see them listed here.")}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-secondary/50 border-b border-gray-700">
              <div className="grid grid-cols-8 gap-6 px-8 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Hash className="w-4 h-4 text-blue-400" />
                  {t("Job ID")}
                </div>
                <div className="col-span-2  flex items-center gap-2 text-sm font-bold text-twhite">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  {t("Title")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Building2 className="w-4 h-4 text-green-400" />
                  {t("Department")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Users className="w-4 h-4 text-blue-400" />
                  {t("Responsibilities")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Shield className="w-4 h-4 text-green-400" />
                  {t("Permissions")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  {t("Routine Tasks")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <FileText className="w-4 h-4 text-yellow-400" />
                  {t("Actions")}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {paginatedData.map((job) => (
                <JobTitleRowComponent
                  key={job.id}
                  job={job}
                  isAdmin={isAdmin}
                  hasEditPermission={hasEditPermission}
                  t={t}
                  onShowMore={handleShowMore}
                  onShowRoutineTasks={handleShowRoutineTasks}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={totalItems}
                t={t}
              />
            )}
          </>
        )}
      </div>

      {modalContent && (
        <CustomModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalContent(null);
          }}
          title={modalContent.title}
          content={modalContent.content}
          language={currentLanguage as "en" | "ar"}
          actionText={t("Close")}
        />
      )}

      {/* Routine Tasks Modal */}
      {routineTasksModalContent && (
        <RoutineTasksModal
          isOpen={isRoutineTasksModalOpen}
          onClose={() => {
            setIsRoutineTasksModalOpen(false);
            setRoutineTasksModalContent(null);
          }}
          title={routineTasksModalContent.title}
          tasks={routineTasksModalContent.tasks}
          language={currentLanguage as "en" | "ar"}
          t={t}
          jobTitleId={getJobTitleIdForTask(routineTasksModalContent.tasks[0], jobsData)}
        />
      )}
    </div>
  );
};

export default JobTitleContent;