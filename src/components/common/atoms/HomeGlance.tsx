import { ArrowDownIcon, CheckSlateIcon } from "@/assets";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import { getGreeting, getHomeDate } from "@/services/home.service";
import { RootState } from "@/state/store";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";

const HomeGlance = ({
  scope,
  setScope,
  completedTasks,
}: {
  scope: "weekly" | "monthly";
  setScope: Dispatch<SetStateAction<"weekly" | "monthly">>;
  completedTasks: number;
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const {
    selector: { userInfo },
  } = useRedux((state: RootState) => state.user);
  const { isLightMode } = useCustomTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleScopeChange = (newScope: "weekly" | "monthly") => {
    setScope(newScope);
    setIsDropdownOpen(false);
  };

  return (
    <header className="w-full px-4 sm:px-0 sm:w-fit mx-auto text-twhite flex flex-col items-center gap-2  sm:mt-10">
      <div className="text-base sm:text-lg">
        {getHomeDate(currentLanguage as "ar" | "en")}
      </div>

      <div className="text-xl sm:text-2xl text-center px-2">
        {getGreeting(t)}, {userInfo ? userInfo.name : "Guest"}
      </div>

      <div className="bg-dark text-tdark rounded-full flex flex-col sm:flex-row justify-between w-full max-w-[320px] items-center gap-3 sm:gap-2 p-3 sm:p-5">
        {/* Scope Dropdown */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center sm:justify-start gap-2 cursor-pointer w-full sm:w-auto text-sm sm:text-base"
          >
            {scope === "weekly" ? t("My Week") : t("My Month")}
            <Image
              src={ArrowDownIcon}
              alt="arrow down"
              height={16}
              width={16}
              className="ml-1"
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 top-full mt-1 w-40 sm:w-32 bg-dark border border-slate-600 rounded-md shadow-lg z-10">
              <ul>
                <li
                  onClick={() => handleScopeChange("weekly")}
                  className={`px-4 py-2 cursor-pointer text-center sm:text-left text-sm sm:text-base
                    ${
                      isLightMode
                        ? "hover:bg-darkest hover:text-tblackAF"
                        : "hover:bg-slate-700"
                    }  
                    ${scope === "weekly" ? "text-twhite" : "text-tdark"}`}
                >
                  {t("My Week")}
                </li>
                <li
                  onClick={() => handleScopeChange("monthly")}
                  className={`px-4 py-2 cursor-pointer text-center sm:text-left text-sm sm:text-base
                    ${
                      isLightMode
                        ? "hover:bg-darkest hover:text-tblackAF"
                        : "hover:bg-slate-700"
                    }  
                    ${scope === "monthly" ? "text-twhite" : "text-tdark"}`}
                >
                  {t("My Month")}
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="hidden sm:block w-[1px] h-5 bg-slate-400"></div>

        <div className="flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto">
          <Image
            src={CheckSlateIcon}
            alt=""
            height={16}
            width={16}
            className="sm:h-5 sm:w-5"
          />
          {completedTasks} {t("Tasks Completed")}
        </div>
      </div>
    </header>
  );
};

export default HomeGlance;
