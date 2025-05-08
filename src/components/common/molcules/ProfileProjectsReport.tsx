import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { formatDate, isDueSoon } from "@/services/task.service";
import { ProjectType } from "@/types/Project.type";
import PageSpinner from "../atoms/ui/PageSpinner";
import RouteWrapper from "../atoms/ui/RouteWrapper";
import { collabColors } from "./ProjectsContent";

const ProfileProjectsReport = ({
  isCentered = false,
}: {
  isCentered?: boolean;
}) => {
  const { t, currentLanguage } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const { isLightMode } = useCustomTheme();

  const { data: projects, isLoading } = useCustomQuery<ProjectType[]>({
    queryKey: ["projects"],
    url: `/projects/${isAdmin ? "get-all-projects" : "get-manager-project"}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCollaborators = (items: any[], type: "departments" | "members") =>
    items.length === 1 ? (
      <div className="border-2 border-blue-500/30 bg-dark text-twhite py-1 px-2 w-fit mx-auto rounded-lg text-xs sm:text-sm font-bold">
        {items[0].name}
      </div>
    ) : (
      <div className="flex justify-center -gap-2 sm:-gap-4" dir="ltr">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={type === "members" ? item.id : index}
            className={`relative ${collabColors[index % collabColors.length]} 
              cursor-pointer text-twhite rounded-full bg-dark 
              px-2 py-1 sm:px-4 sm:py-2 
              flex items-center justify-center 
              text-xs sm:text-sm font-bold 
              ${type === "members" ? "shadow-lg" : ""}`}
            title={item.name}
          >
            {item.name
              .split(" ")
              .map((word: string) => word[0])
              .join("")
              .toUpperCase()}
          </div>
        ))}
        {items.length > 3 && (
          <div
            className="relative text-twhite cursor-pointer rounded-full bg-dark 
              px-2 py-1 sm:px-4 sm:py-2 
              flex items-center justify-center 
              text-xs sm:text-sm font-semibold 
              shadow-lg"
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

  return (
    <div
      className={`bg-main min-h-64 rounded-md shadow-md 
        ${isCentered ? "mx-auto w-full md:w-[90%] lg:w-[80%] xl:w-[70%]" : ""}
        mt-5 p-3 sm:p-5 text-twhite border border-slate-700`}
    >
      <div className="text-base sm:text-lg font-bold mb-4">
        {t("My Projects")}
      </div>

      <div className="w-full gap-3 ">
        {projects?.map((project, index) => (
          <RouteWrapper key={index} href={"/projects/details/" + project._id}>
            <div
              className="hover:bg-slate-700 transition-colors 
              px-2 sm:px-4 py-2 bg-dark rounded-md 
              flex flex-col sm:flex-row sm:items-center sm:justify-between 
              group gap-3 sm:gap-0  mt-1"
            >
              <div
                className={`sm:w-[40%] text-center sm:text-start group-hover:${isLightMode ? "text-tblackAF" : "text-twhite"
                  }
                text-sm sm:text-base font-medium py-1 sm:py-3 px-2 sm:px-4`}
              >
                {project.name}
              </div>

              <div
                className="flex flex-col sm:flex-row items-start sm:items-center 
                justify-start sm:justify-between sm:w-[60%] gap-3 sm:gap-0"
              >
                <div className="w-full sm:w-auto">
                  {project.departments &&
                    renderCollaborators(project.departments, "departments")}
                </div>

                <div className="w-full sm:w-auto">
                  {project.members &&
                    renderCollaborators(project.members, "members")}
                </div>

                <div className="w-full sm:w-auto flex justify-center">
                  <div
                    className={`border-2 border-yellow-500/30 bg-dark text-twhite 
                    py-1 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold
                    ${isDueSoon(project.endDate) ? "flash" : ""}`}
                  >
                    {formatDate(
                      project.endDate,
                      currentLanguage as "en" | "ar"
                    )}
                  </div>
                </div>
              </div>
              {isLoading && <PageSpinner />}
            </div>
          </RouteWrapper>
        ))}
      </div>
    </div>
  );
};

export default ProfileProjectsReport;
