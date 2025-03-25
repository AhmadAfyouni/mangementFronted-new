import { PencilIcon } from "@/assets";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { formatDate, isDueSoon } from "@/services/task.service";
import { ProjectType } from "@/types/Project.type";
import { Eye } from "lucide-react"; // Import the eye icon
import Image from "next/image";
import { useState } from "react";
import AddProjectModal from "../atoms/modals/AddProjectModal";
import PageSpinner from "../atoms/ui/PageSpinner";
import RouteWrapper from "../atoms/ui/RouteWrapper";

export const collabColors = [
  "border-2  border-blue-500 ",
  "border-2  border-yellow-500 ",
  "border-2  border-red-500 ",
];

const ProjectsContent = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<ProjectType | null>(
    null
  );
  const { t, currentLanguage } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const isPrimary = useRolePermissions("primary_user");
  const { isLightMode } = useCustomTheme();
  const { data: projects, isLoading } = useCustomQuery<ProjectType[]>({
    queryKey: ["projects"],
    url: `/projects/${
      isAdmin
        ? "get-all-projects"
        : isPrimary
        ? "get-manager-project"
        : "get-emp-project"
    }`,
  });

  const handleEditClick = (project: ProjectType, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col space-y-4 col-span-12">
      <div className="overflow-x-auto rounded-lg shadow-md">
        {!projects || projects.length === 0 ? (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5 text-twhite">
              {t("No Projects")}
            </div>
          </>
        ) : (
          <>
            <table className="min-w-full bg-main text-twhite rounded-lg shadow-md">
              <thead
                className={`${
                  isLightMode
                    ? "bg-darkest text-tblackAF"
                    : "bg-tblack text-twhite"
                }`}
              >
                <tr>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Name")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Description")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Departments")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Start Date")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("End Date")}
                  </th>
                  <th className="text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects &&
                  projects.map((project, index) => (
                    <tr
                      key={index}
                      className={`${
                        isLightMode
                          ? "hover:bg-darker text-blackAF"
                          : "hover:bg-slate-700 text-twhite"
                      } group transition-colors`}
                    >
                      <td
                        className={`py-3 px-4 text-center ${
                          isLightMode ? "group-hover:text-tblackAF" : ""
                        }`}
                      >
                        {project.name}
                      </td>
                      <td
                        className={`py-3 px-4 text-center ${
                          isLightMode ? "group-hover:text-tblackAF" : ""
                        }`}
                      >
                        {project.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {project.departments.length === 1 ? (
                          <div className="border-2 border-blue-500/30 bg-dark py-1 px-3 w-fit mx-auto rounded-lg text-sm font-bold">
                            {project.departments[0].name}
                          </div>
                        ) : (
                          <div
                            className="flex justify-center -space-x-4"
                            dir="ltr"
                          >
                            {project.departments
                              .slice(0, 3)
                              .map((dept, index) => (
                                <div
                                  key={index}
                                  className={`${
                                    collabColors[index % collabColors.length]
                                  } cursor-pointer rounded-full bg-dark px-4 py-2 flex items-center justify-center text-sm font-bold`}
                                  title={dept.name}
                                >
                                  {dept.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .toUpperCase()}
                                </div>
                              ))}
                            {project.departments.length > 3 && (
                              <div
                                className="cursor-pointer rounded-full bg-dark px-4 py-2 flex items-center justify-center text-sm font-semibold"
                                title={project.departments
                                  .slice(3)
                                  .map((dept) => dept.name)
                                  .join(", ")}
                              >
                                +{project.departments.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="border-2 border-purple-500/30 bg-dark py-1 px-3 w-fit mx-auto rounded-lg text-sm font-bold">
                          {formatDate(
                            project.startDate,
                            currentLanguage as "en" | "ar"
                          )}
                        </div>
                      </td>
                      <td>
                        <div
                          className={`border-2 border-yellow-500/30 bg-dark py-1 px-3 w-fit mx-auto rounded-lg text-sm font-bold ${
                            isDueSoon(project.endDate) ? "flash" : ""
                          }`}
                        >
                          {formatDate(
                            project.endDate,
                            currentLanguage as "en" | "ar"
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 flex gap-2 justify-center">
                        <RouteWrapper
                          href={"/projects/details/" + project._id}
                          className="cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full bg-blue-500/40 hover:bg-blue-500 hover:text-blue-100 border-2 border-blue-500/30 text-white"
                        >
                          <Eye size={20} />
                        </RouteWrapper>
                        {(isAdmin || isPrimary) && (
                          <button
                            onClick={(e) => handleEditClick(project, e)}
                            className="cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30"
                            title={t("Edit")}
                          >
                            <Image
                              src={PencilIcon}
                              alt="edit icon"
                              height={20}
                              width={20}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
