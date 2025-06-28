import { PencilIcon } from "@/assets";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { formatDate, isDueSoon } from "@/services/task.service";
import { ProjectType } from "@/types/Project.type";
import {
  Activity,
  Building,
  Calendar,
  CalendarDays,
  Eye,
  FileText,
  Search,
  Users
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import AddProjectModal from "../atoms/modals/AddProjectModal";
import { Pagination } from "../atoms/Pagination";
import PageSpinner from "../atoms/ui/PageSpinner";
import RouteWrapper from "../atoms/ui/RouteWrapper";

export const collabColors = [
  "border-2 border-blue-500/50 bg-blue-500/10",
  "border-2 border-yellow-500/50 bg-yellow-500/10",
  "border-2 border-red-500/50 bg-red-500/10",
  "border-2 border-green-500/50 bg-green-500/10",
  "border-2 border-purple-500/50 bg-purple-500/10",
];

const ProjectRowComponent: React.FC<{
  project: ProjectType;
  index: number;
  isAdmin: boolean;
  isPrimary: boolean;
  handleEditClick: (project: ProjectType, e: React.MouseEvent) => void;
  t: (key: string) => string;
  currentLanguage: string;
}> = ({ project, isAdmin, isPrimary, handleEditClick, t, currentLanguage }) => {



  return (
    <div
      style={{ borderLeftColor: project.color }}
      className={`grid grid-cols-6 px-6 py-3  group border-l-4  hover:bg-secondary/50 transition-all duration-300 bg-dark border-b border-1 border-main`}
    >
      {/* Project ID */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-blue-400 hover:text-blue-300">
          {project._id.slice(-5).toUpperCase()}
        </span>
      </div>

      {/* Project Name & Description */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-twhite group-hover:text-blue-300 transition-colors duration-300">
            {project.name}
          </span>
        </div>
        <span className="text-xs text-gray-400 truncate max-w-xs" title={project.description}>
          {project.description}
        </span>
      </div>

      {/* Departments */}
      <div className="flex items-center justify-center">
        {project.departments.length === 1 ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {project.departments[0].name}
          </span>
        ) : (
          <div className="flex justify-center items-center gap-1 text-white">
            {project.departments.slice(0, 3).map((dept, index) => (
              <span
                key={index}
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${collabColors[index % collabColors.length]
                  }`}
                title={dept.name}
              >
                {dept.name.split(' ').map(word => word[0]).join('').toUpperCase()}
              </span>
            ))}
            {project.departments.length > 3 && (
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30"
                title={project.departments.slice(3).map(dept => dept.name).join(', ')}
              >
                +{project.departments.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Start Date */}
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {formatDate(project.startDate, currentLanguage as "en" | "ar")}
        </span>
      </div>

      {/* End Date */}
      <div className="flex items-center justify-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${isDueSoon(project.endDate)
            ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }`}
        >
          {formatDate(project.endDate, currentLanguage as "en" | "ar")}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2">
        <RouteWrapper
          href={"/projects/details/" + project._id}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 border border-gray-600/20 hover:border-blue-500/30"
        >
          <Eye className="w-4 h-4" />
        </RouteWrapper>
        {(isAdmin || isPrimary) && (
          <button
            onClick={(e) => handleEditClick(project, e)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 border border-gray-600/20 hover:border-green-500/30"
            title={t("Edit")}
          >
            <Image
              src={PencilIcon}
              alt="edit icon"
              height={16}
              width={16}
            />
          </button>
        )}
      </div>
    </div>
  );
};



const ProjectsContent = () => {
  const { t, currentLanguage, getDir } = useLanguage();
  const isRTL = getDir() === "rtl";

  useEffect(() => {
    document.body.dir = isRTL ? "rtl" : "ltr";
    return () => { document.body.dir = "ltr"; };
  }, [isRTL]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const isAdmin = useRolePermissions("admin");
  const isPrimary = useRolePermissions("primary_user");

  const { data: projects, isLoading } = useCustomQuery<ProjectType[]>({
    queryKey: ["projects"],
    url: `/projects/${isAdmin
      ? "get-all-projects"
      : isPrimary
        ? "get-manager-project"
        : "get-emp-project"
      }`,
  });

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects;
  }, [projects]);

  // Pagination calculations
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);


  const handleEditClick = (project: ProjectType, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-5">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className=" rounded-xl shadow-md flex flex-col gap-4 col-span-12">

      {/* Projects Table */}
      <div className="overflow-hidden rounded-lg shadow-lg shadow-black/20 border border-gray-700/50">
        {!projects || projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-main">
            <Users className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-twhite mb-2">{t("No Projects Found")}</h3>
            <p className="text-tdark">{t("Start by creating your first project")}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-main">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-twhite mb-2">{t("No Results Found")}</h3>
            <p className="text-tdark">{t("Try adjusting your search terms")}</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-secondary/50 border-b border-gray-700">
              <div className={`grid grid-cols-6 px-6 py-4 ${isRTL ? 'rtl' : 'ltr'}`}>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <FileText className="w-4 h-4 text-blue-400" />
                  {t("Project ID")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite">
                  <Building className="w-4 h-4 text-gray-400" />
                  {t("Project Name")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <Users className="w-4 h-4 text-green-400" />
                  {t("Departments")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {t("Start Date")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <CalendarDays className="w-4 h-4 text-orange-400" />
                  {t("End Date")}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-twhite justify-center">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  {t("Actions")}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {currentProjects.map((project, index) => (
                <ProjectRowComponent
                  key={project._id}
                  project={project}
                  index={startIndex + index}
                  isAdmin={isAdmin}
                  isPrimary={isPrimary}
                  handleEditClick={handleEditClick}
                  t={t}
                  currentLanguage={currentLanguage}
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

      {isModalOpen && currentProject && (
        <AddProjectModal
          projectData={currentProject}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentProject(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsContent;