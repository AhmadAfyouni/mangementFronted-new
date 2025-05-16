import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { permissionsArray } from "@/utils/all_permissions";
import { Check } from "lucide-react";

export interface PermissionsSectionProps {
  permissionsMode: "default" | "custom";
  setPermissionsMode: React.Dispatch<
    React.SetStateAction<"default" | "custom">
  >;
  permissionsSelected: string[];
  setPermissionsSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const permissionsOptions = permissionsArray.map((permission) => ({
  value: permission,
  label: permission.replace(/_/g, "").toUpperCase(),
}));

// New component for permissions section
export const PermissionsSection = ({
  permissionsMode,
  setPermissionsMode,
  permissionsSelected,
  setPermissionsSelected,
}: PermissionsSectionProps) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  const permissionCategories = {
    jobTitle: permissionsOptions.filter((p) => p.value.includes("job_title")),
    employee: permissionsOptions.filter((p) => p.value.includes("emp")),
    department: permissionsOptions.filter((p) =>
      p.value.includes("department")
    ),
    task: permissionsOptions.filter((p) => p.value.includes("task")),
    electronic: permissionsOptions.filter((p) =>
      p.value.includes("electronic")
    ),
    permission: permissionsOptions.filter((p) =>
      p.value.includes("permission")
    ),
  };

  return (
    <div className="gap-6">
      {/* Permissions Mode Toggle */}
      <div
        className={`
          py-2 rounded-xl 
          ${isLightMode ? "bg-dark/5 " : "bg-secondary/20 "}
        `}
      >
        <h3 className="text-lg font-medium mb-4">{t("Permissions Mode")}</h3>
        <div className="flex gap-4">
          {["default", "custom"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setPermissionsMode(mode as "default" | "custom");
                if (mode === "default") {
                  setPermissionsSelected([]);
                }
              }}
              className={`
                  px-4 py-2 rounded-lg transition-all duration-200
                  ${permissionsMode === mode
                  ? isLightMode
                    ? "bg-darker text-white shadow-lg"
                    : "bg-secondary text-white shadow-lg"
                  : isLightMode
                    ? "bg-darker/10 hover:bg-darker/20 text-tblack"
                    : "bg-dark/40 hover:bg-dark/60 text-tmid"
                }
                `}
            >
              {t(mode.charAt(0).toUpperCase() + mode.slice(1))}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Selection */}
      {permissionsMode === "custom" && (
        <div className="gap-6">
          {Object.entries(permissionCategories).map(
            ([category, permissions]) => (
              <div
                key={category}
                className={`
                  p-4 rounded-xl 
                  ${isLightMode ? "bg-dark/5 " : "bg-secondary/20 "}
                `}
              >
                <h3 className="text-lg font-medium mb-4 capitalize">
                  {t(category.replace(/([A-Z])/g, " $1").trim())}{""}
                  {t("Permissions")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.value}
                      onClick={() => {
                        setPermissionsSelected((prev) =>
                          prev.includes(permission.value)
                            ? prev.filter((p) => p !== permission.value)
                            : [...prev, permission.value]
                        );
                      }}
                      className={`
                        p-3 rounded-lg cursor-pointer
                        flex items-center gap-3 transition-all duration-200
                        ${permissionsSelected.includes(permission.value)
                          ? isLightMode
                            ? "bg-darker text-white shadow-md"
                            : "bg-secondary  text-white"
                          : isLightMode
                            ? "bg-darker/10 hover:bg-darker/20 text-tblack"
                            : "bg-dark/40 hover:bg-dark/60 text-tmid"
                        }
                      `}
                    >
                      <div
                        className={`
                        w-5 h-5 rounded-full border-2
                        flex items-center justify-center
                        transition-all duration-200
                        ${permissionsSelected.includes(permission.value)
                            ? isLightMode
                              ? " bg-secondary"
                              : " bg-primary"
                            : "border-current bg-transparent"
                          }
                      `}
                      >
                        {permissionsSelected.includes(permission.value) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {permission.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
