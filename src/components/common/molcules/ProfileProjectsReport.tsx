import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { formatDate, isDueSoon } from "@/services/task.service";
import { ProjectType } from "@/types/Project.type";
import { Building2, Calendar, Folder, Target, Users } from "lucide-react";
import PageSpinner from "../atoms/ui/PageSpinner";
import RouteWrapper from "../atoms/ui/RouteWrapper";

export const collabColors = [
  "bg-gradient-to-br from-purple-500 to-purple-700",
  "bg-gradient-to-br from-blue-500 to-blue-700",
  "bg-gradient-to-br from-green-500 to-green-700",
  "bg-gradient-to-br from-yellow-500 to-yellow-700",
  "bg-gradient-to-br from-red-500 to-red-700",
];

const ProfileProjectsReport = ({
  isCentered = false,
}: {
  isCentered?: boolean;
}) => {
  const { t, currentLanguage } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const isRTL = currentLanguage === "ar";

  const { data: projects, isLoading } = useCustomQuery<ProjectType[]>({
    queryKey: ["projects"],
    url: `/projects/${isAdmin ? "get-all-projects" : "get-manager-project"}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCollaborators = (items: any[], type: "departments" | "members") => (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} -space-x-2 overflow-hidden`}>
      {items.slice(0, 3).map((item, index) => (
        <div
          key={type === "members" ? item.id : index}
          className={`relative ${collabColors[index % collabColors.length]} 
            w-10 h-10 rounded-full flex items-center justify-center 
            text-xs font-bold text-white shadow-lg ring-2 ring-secondary
            transform hover:scale-110 transition-transform cursor-pointer`}
          title={item.name}
        >
          {item.name
            .split("")
            .map((word: string) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      ))}
      {items.length > 3 && (
        <div
          className="relative w-10 h-10 rounded-full bg-tblack text-twhite
            flex items-center justify-center text-xs font-bold 
            shadow-lg ring-2 ring-secondary cursor-pointer"
          title={items
            .slice(3)
            .map((item) => item.name)
            .join(", ")}
        >
          +{items.length - 3}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <PageSpinner title={t("Loading projects...")} />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8">
        <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-lg">{t("No projects found")}</p>
      </div>
    );
  }

  return (
    <div
      className={`${isCentered ? "mx-auto max-w-5xl" : ""}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Folder className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-twhite">{t("My Projects")}</h2>
        <span className="text-sm text-gray-400 bg-tblack px-3 py-1 rounded-full">
          {projects.length}
        </span>
      </div>

      <div className="grid gap-4">
        {projects.map((project, index) => (
          <RouteWrapper key={project._id} href={`/projects/details/${project._id}`}>
            <div
              className="group bg-secondary border border-gray-700 rounded-xl p-6 
                hover:border-gray-600 transition-all duration-300 cursor-pointer"
            >
              <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-start justify-between gap-6`}>
                {/* Project Info */}
                <div className="flex-1">
                  <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-12 h-12 rounded-lg ${collabColors[index % collabColors.length]} 
                      flex items-center justify-center shadow-lg`}>
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-twhite group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-400">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-6 mt-4`}>
                    {project.departments && project.departments.length > 0 && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">
                          {project.departments.length} {t("Departments")}
                        </span>
                      </div>
                    )}
                    {project.members && project.members.length > 0 && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">
                          {project.members.length} {t("Members")}
                        </span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className={`text-sm ${isDueSoon(project.endDate) ? 'text-red-400' : 'text-gray-400'}`}>
                          {formatDate(project.endDate, currentLanguage as "en" | "ar")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collaborators */}
                <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-4`}>
                  {project.departments && project.departments.length > 0 && (
                    <div>
                      <p className={`text-xs text-gray-400 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t("Departments")}
                      </p>
                      {renderCollaborators(project.departments, "departments")}
                    </div>
                  )}
                  {project.members && project.members.length > 0 && (
                    <div>
                      <p className={`text-xs text-gray-400 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t("Members")}
                      </p>
                      {renderCollaborators(project.members, "members")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RouteWrapper>
        ))}
      </div>
    </div>
  );
};

export default ProfileProjectsReport;
