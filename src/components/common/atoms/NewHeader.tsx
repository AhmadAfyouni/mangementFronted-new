"use client";
// Add TypeScript declaration for our window property
declare global {
  interface Window {
    searchTimeout: ReturnType<typeof setTimeout> | undefined;
  }
}
import {
  DarkModeIcon,
  LangIcon,
  LightModeIcon,
  MoreIcon,
  SearchIcon,
} from "@/assets";
import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useTaskTimer from "@/hooks/useTaskTimer";
import { setSearchQuery } from "@/state/slices/searchSlice";
import { logout } from "@/state/slices/userSlice";
import { AppDispatch, RootState } from "@/state/store";
import { ReceiveTaskType } from "@/types/Task.type";
import { useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Notification from "./ui/Notification";
import RouteWrapper from "./ui/RouteWrapper";

const NewHeader = ({
  setIsExpanded,
}: {
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}) => {
  const user = useSelector((state: RootState) => state.user.userInfo);
  const userInitial = user ? user.name.charAt(0).toUpperCase() : "G";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Get active entity from Redux store
  const activeEntity = useSelector((state: RootState) => state.globalSearch.activeEntity);
  const searchQueries = useSelector((state: RootState) => state.globalSearch.queries);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  // Determine current entity based on path
  useEffect(() => {
    // Auto-detect entity based on current path
    if (pathname.includes("/departments")) {
      // If we're on the departments page, set active entity to departments
      if (activeEntity !== "departments") {
        dispatch(setSearchQuery({ entity: "departments", query: searchText }));
      }
    } else if (pathname.includes("/employees")) {
      // Set other entity types based on URL
      if (activeEntity !== "employees") {
        dispatch(setSearchQuery({ entity: "employees", query: searchText }));
      }
    }
  }, [pathname, activeEntity, searchText, dispatch]);

  const { t } = useTranslation();
  const { isLightMode, toggleThemes } = useCustomTheme();
  const { toggleLanguage } = useLanguage();
  const { setSnackbarConfig } = useMokkBar();
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSearch = () => setIsMobileSearchOpen(!isMobileSearchOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const showTimeTracking = useTasksGuard(["enableTimeTracking"]);


  // Initialize search input with current value from Redux store
  useEffect(() => {
    setSearchText(searchQueries[activeEntity] || "");
  }, [activeEntity, searchQueries]);

  // Function to close the profile dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (!user) {
      dispatch(logout());
      queryClient.clear();
    }
  }, [dispatch, queryClient, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // --- Running Task Logic ---
  // Get user's tasks (myTasks is more universal than dailyTasks)
  const { data: tasksData, refetch } = useCustomQuery<{
    status: boolean;
    message: string;
    data: ReceiveTaskType[];
  }>({
    queryKey: ["tasks", "get-all"],
    url: `/tasks/get-all-tasks`,
    enabled: isAuthenticated,
  });

  // Listen for timer update events and refetch tasks instantly
  useEffect(() => {
    const handler = () => {
      refetch();
    };
    window.addEventListener("task-timer-updated", handler);
    return () => window.removeEventListener("task-timer-updated", handler);
  }, [refetch]);

  // Always recalculate runningTask when tasksData changes
  const runningTask = useMemo(() => {
    if (!Array.isArray(tasksData?.data)) {
      return undefined;
    }

    const found = tasksData.data.find(
      (task) =>
        Array.isArray(task.timeLogs) &&
        task.timeLogs.some((log) => log.start && !log.end)
    );

    return found;
  }, [tasksData]);

  const timerProps = useTaskTimer(
    runningTask ? runningTask.id : "dummy-id",
    runningTask ? runningTask.timeLogs || [] : []
  );


  // Helper for formatting time (hh:mm:ss)
  function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <div
        className={`${isLightMode ? "bg-darkest" : "bg-main"
          } fixed top-0 right-0 left-0 py-2 px-[2%] flex justify-between items-center border-b border-slate-600 z-[var(--z-index-header)]`}
      >
        {/* Menu Button */}
        <div className="group relative">
          <Image
            src={MoreIcon}
            alt="more icon"
            width={30}
            height={30}
            onClick={toggleSidebar}
            className={`cursor-pointer transform transition-all duration-200 ease-out 
              ${isLightMode ? "hover:bg-darker" : "hover:bg-secondary"}
              p-1.5 rounded-lg active:scale-95 hover:shadow-lg`}
          />
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Running Task Box (replaces search box) */}
          <div className="flex-1 flex justify-center">
            {runningTask && (
              <div
                className="flex items-center bg-secondary rounded-lg shadow-sm min-w-[250px] border-l-4 border-l-orange-300 pl-4"
                style={{ minHeight: 32 }}
              >
                {/* Task info */}
                <div className="flex flex-col flex-1 min-w-0 py-1 mt-1">
                  <span className="font-medium text-sm text-white truncate leading-none">
                    {runningTask.name}
                  </span>
                  {/* Digital Clock Style Timer */}
                  <div className="text-white leading-none font-mono">
                    <span
                      className="text-sm font-bold tracking-wider text-emerald-400"
                      style={{
                        fontFamily: 'Monaco, "Courier New", monospace',
                        letterSpacing: '0.1em'
                      }}
                    >
                      {timerProps ? formatTime(timerProps.elapsedTime) : "00:00:00"}
                    </span>
                  </div>
                </div>

                {/* Pause button - only show if time tracking is enabled and timer props exist */}
                {showTimeTracking && timerProps && (
                  <button
                    className=" mx-1 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 border border-gray-600/50 hover:border-green-500/50"
                    onClick={timerProps.pauseTimer}
                    disabled={timerProps.isLoading}
                    aria-label="Pause"
                    style={{ outline: "none" }}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="2" fill="white" />
                      <rect x="14" y="4" width="4" height="16" rx="2" fill="white" />
                    </svg>
                  </button>
                )}

                <RouteWrapper
                  href={`/tasks/${runningTask.id}`}
                  className=" mx-1 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 border border-gray-600/50 hover:border-blue-500/50"
                >
                  <button
                    className="w-full h-full flex items-center justify-center"
                    title={t("View Details")}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </RouteWrapper>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <div
            className="md:hidden relative group"
            onClick={toggleMobileSearch}
          >
            <div
              className={`p-2 rounded-full cursor-pointer transform transition-all duration-200 
              ${isLightMode ? "hover:bg-darker" : "hover:bg-secondary"}
              active:scale-95`}
            >
              <Image
                src={SearchIcon}
                width={20}
                height={20}
                alt="search icon"
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Language Toggle */}
          <div className="relative group" onClick={toggleLanguage}>
            <div
              className="p-2 bg-blue-100 rounded-full cursor-pointer transform transition-all duration-200 
              hover:bg-blue-200 hover:shadow-lg active:scale-95"
            >
              <Image
                src={LangIcon}
                width={16}
                height={16}
                alt="language icon"
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="relative group" onClick={toggleThemes}>
            <div
              className="p-2 bg-blue-100 rounded-full cursor-pointer transform transition-all duration-200 
              hover:bg-blue-200 hover:shadow-lg active:scale-95"
            >
              <Image
                src={isLightMode ? DarkModeIcon : LightModeIcon}
                width={16}
                height={16}
                alt="theme icon"
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Notification Component */}
          <Notification
            isLightMode={isLightMode}
            onToggleOtherDropdowns={closeDropdown}
          />

          {/* User Avatar */}
          <div
            onClick={toggleDropdown}
            className={`relative group h-8 w-8 flex items-center justify-center rounded-full 
              bg-red-300 cursor-pointer transform transition-all duration-200 
              hover:shadow-lg active:scale-95 font-bold text-lg
              ${isLightMode ? "text-tblackAF" : "text-twhite"}`}
          >
            {userInitial}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className={`
              absolute right-2 md:right-6 top-full mt-2
              min-w-[200px] bg-secondary 
              shadow-lg rounded-lg overflow-hidden
              animate-in fade-in slide-in-from-top-2 duration-200
              z-50
            `}
          >
            <ul className="text-twhite divide-y divide-slate-600/30">
              <RouteWrapper
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
              >
                <li
                  className={`
                    px-4 py-3
                    cursor-pointer
                    transition-colors duration-200
                    ${isLightMode
                      ? "hover:bg-darkest hover:text-tblackAF"
                      : "hover:bg-tblack"
                    }
                  `}
                >
                  {t("Profile")}
                </li>
              </RouteWrapper>

              <RouteWrapper
                href="/company-profile"
                onClick={() => setIsDropdownOpen(false)}
              >
                <li
                  className={`
                    px-4 py-3
                    cursor-pointer
                    transition-colors duration-200
                    ${isLightMode
                      ? "hover:bg-darkest hover:text-tblackAF"
                      : "hover:bg-tblack"
                    }
                  `}
                >
                  {t("Company Profile")}
                </li>
              </RouteWrapper>

              <RouteWrapper
                href="/company-settings"
                onClick={() => setIsDropdownOpen(false)}
              >
                <li
                  className={`
                    px-4 py-3
                    cursor-pointer
                    transition-colors duration-200
                    ${isLightMode
                      ? "hover:bg-darkest hover:text-tblackAF"
                      : "hover:bg-tblack"
                    }
                  `}
                >
                  {t("Company Settings")}
                </li>
              </RouteWrapper>

              <RouteWrapper
                href={"/auth"}
                onClick={() => {
                  dispatch(logout());
                  queryClient.cancelQueries();
                  queryClient.clear();
                  setSnackbarConfig({
                    open: true,
                    message: "Logout successful!",
                    severity: "success",
                  });
                  router.replace("/auth");
                }}
              >
                <li
                  className={`
                  px-4 py-3
                  cursor-pointer
                  transition-colors duration-200
                  ${isLightMode
                      ? "hover:bg-darkest hover:text-tblackAF"
                      : "hover:bg-tblack"
                    }
                  `}
                >
                  {t("Logout")}
                </li>
              </RouteWrapper>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default NewHeader;