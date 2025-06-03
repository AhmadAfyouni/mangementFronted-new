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
import { Info } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import useGlobalSearch, { SearchConfig } from "@/hooks/departments/useGlobalSearch";
import { setActiveEntity } from "@/state/slices/searchSlice";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";

const TruncatedText = ({ text }: { text: string }) => (
  <p className="truncate max-w-[200px]">{text || "N/A"}</p>
);

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

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Calculate start and end page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
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
    <div className="bg-secondary rounded-xl shadow-md p-5 flex flex-col gap-5 col-span-12">
      <div className="overflow-x-auto rounded-lg shadow-md">
        {jobsData.length === 0 || paginatedData.length === 0 ? (
          <>
            <div className="py-10 flex flex-col items-center justify-center gap-5 text-twhite">
              {searchQuery
                ? t("No job titles found matching your search criteria.")
                : t("No Job Titles Found")}
            </div>
          </>
        ) : (
          <>
            <table className="min-w-full bg-main text-twhite rounded-lg shadow-md">
              <thead
                className={
                  isLightMode
                    ? "bg-darkest text-tblackAF"
                    : "bg-tblack text-twhite"
                }
              >
                <tr>
                  <th className="text-center py-4 px-4 uppercase font-semibold text-sm">
                    {t("Title")}
                  </th>
                  <th className="text-center py-4 px-4 uppercase font-semibold text-sm">
                    {t("Description")}
                  </th>
                  <th className="text-center py-4 px-4 uppercase font-semibold text-sm">
                    {t("Responsibilities")}
                  </th>
                  <th className="text-center py-4 px-4 uppercase font-semibold text-sm">
                    {t("Permissions")}
                  </th>
                  <th className="text-center py-4 px-4 uppercase font-semibold text-sm">
                    {t("Department")}
                  </th>
                  <th className="text-center py-4 px-4 uppercase font-semibold text-sm">
                    {t("Routine Tasks")}
                  </th>
                  {(isAdmin || hasEditPermission) && (
                    <th className="text-center py-4 px-4 uppercase font-semibold text-sm">
                      {t("Actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((job) => (
                  <tr
                    key={job.id}
                    className={`${isLightMode ? "hover:bg-dark" : "hover:bg-secondary"
                      } border-b border-gray-700`}
                  >
                    <td className="text-center py-4 px-4">
                      <TruncatedText text={job.title} />
                    </td>
                    <td className="text-center py-4 px-4">
                      <TruncatedText text={job.description} />
                    </td>
                    <td className="text-center py-4 px-4">
                      <button
                        onClick={() =>
                          handleShowMore(
                            "responsibilities",
                            t("Responsibilities"),
                            job.responsibilities
                          )
                        }
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700 transition-colors"
                      >
                        {t("View")} ({job.responsibilities.length})
                      </button>
                    </td>
                    <td className="text-center py-4 px-4">
                      <button
                        onClick={() =>
                          handleShowMore(
                            "permissions",
                            t("Permissions"),
                            job.permissions
                          )
                        }
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-green-700 transition-colors"
                      >
                        {t("View")} ({job.permissions.length})
                      </button>
                    </td>
                    <td className="text-center py-4 px-4">
                      <TruncatedText
                        text={job.department?.name || t("No Department")}
                      />
                    </td>
                    <td className="text-center py-4 px-4">
                      {job.hasRoutineTasks && job.routineTasks && job.routineTasks.length > 0 ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleShowRoutineTasks(
                                job.title,
                                job.routineTasks
                              )
                            }
                            className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-purple-700 transition-colors"
                          >
                            {t("View")} ({job.routineTasks.length})
                          </button>
                          {job.autoGenerateRoutineTasks && (
                            <div className="relative group">
                              <Info
                                size={16}
                                className="text-blue-400 cursor-help"
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-dark text-white text-xs rounded p-2 whitespace-nowrap">
                                {t("Auto-generates routine tasks")}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">{t("None")}</span>
                      )}
                    </td>
                    {(isAdmin || hasEditPermission) && (
                      <td className="text-center py-4 px-4">
                        <RouteWrapper href={`/jobs/add-title?id=${job.id}`}>
                          <div className="inline-block cursor-pointer">
                            <Image
                              src={PencilIcon}
                              alt="edit icon"
                              className="w-5 h-5"
                            />
                          </div>
                        </RouteWrapper>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {paginatedData && paginatedData.length > 0 && (
        <div className={`flex flex-col md:flex-row justify-between items-center mt-3 mb-1 px-2 ${isLightMode ? "text-blackAF" : "text-twhite"
          }`}>
          <div className="mb-4 md:mb-0">
            <span>{t("Showing")} </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className={`px-3 py-2 rounded mx-1 ${isLightMode
                ? "bg-white text-black border border-gray-300"
                : "bg-tblack text-white border border-gray-700"
                }`}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>{t("of")} {totalItems} {t("items")}</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-2 rounded ${currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              «
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-2 rounded ${currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              ‹
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`mx-1 px-3 py-2 rounded ${currentPage === page
                  ? isLightMode
                    ? "bg-tmid text-main"
                    : "bg-tmid text-main"
                  : isLightMode
                    ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                    : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`mx-1 px-3 py-2 rounded ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              ›
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`mx-1 px-3 py-2 rounded ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : isLightMode
                  ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  : "bg-tblack hover:bg-gray-800 text-white border border-gray-700"
                }`}
            >
              »
            </button>
          </div>
        </div>
      )}

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