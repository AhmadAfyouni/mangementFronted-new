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
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { EntityType, setSearchQuery } from "@/state/slices/searchSlice";
import { logout } from "@/state/slices/userSlice";
import { AppDispatch, RootState } from "@/state/store";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
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
  }, [pathname]);

  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLightMode, toggleThemes } = useCustomTheme();
  const { toggleLanguage, getDir } = useLanguage();
  const { setSnackbarConfig } = useMokkBar();
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSearch = () => setIsMobileSearchOpen(!isMobileSearchOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Initialize search input with current value from Redux store
  useEffect(() => {
    setSearchText(searchQueries[activeEntity] || "");
  }, [activeEntity, searchQueries]);

  // Create our own debounce implementation without lodash
  const debouncedSearch = useCallback(
    (entity: EntityType, query: string) => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
      window.searchTimeout = setTimeout(() => {
        dispatch(setSearchQuery({ entity, query }));
      }, 300);
    },
    [dispatch]
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchText(query);
    debouncedSearch(activeEntity, query);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery({ entity: activeEntity, query: searchText }));

    // If not already on the correct page, navigate to the search results page
    if (activeEntity === "departments" && !pathname.includes("/departments")) {
      router.push("/departments");
    } else if (activeEntity === "employees" && !pathname.includes("/employees")) {
      router.push("/employees");
    }
  };

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

  return (
    <>
      <div
        className={`${isLightMode ? "bg-darkest" : "bg-main"
          } fixed top-0 right-0 left-0 py-2 px-[2%] flex justify-between items-center border-b border-slate-600 z-20`}
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

        {/* Search Bar - Hidden on Mobile */}
        <form
          onSubmit={handleSearchSubmit}
          className={`hidden md:flex items-center rounded-lg overflow-hidden transform transition-all duration-200 ease-out
            ${isLightMode ? "bg-darker" : "bg-tblack"}
            w-[30%] group hover:shadow-lg`}
          dir={getDir()}
        >
          <div className="pl-3 pr-2 transition-transform duration-200 group-hover:scale-105">
            <Image
              src={SearchIcon}
              width={20}
              height={20}
              alt="search icon"
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </div>
          <input
            type="text"
            className="bg-transparent placeholder-white py-2 px-1 outline-none border-none text-twhite w-full transition-all duration-200"
            placeholder={t("Search")}
            value={searchText}
            onChange={handleSearchChange}
          />
        </form>

        {/* Actions Group */}
        <div className="flex items-center gap-2 md:gap-4">
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
                href={"/auth"}
                onClick={() => {
                  dispatch(logout());
                  queryClient.removeQueries();
                  setSnackbarConfig({
                    open: true,
                    message: "Logout successful!",
                    severity: "success",
                  });
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

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div
          className={`md:hidden fixed top-[56px] left-0 right-0 p-2 z-10
            ${isLightMode ? "bg-darkest" : "bg-main"}
            border-b border-slate-600
            animate-in fade-in slide-in-from-top duration-200`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className={`flex items-center rounded-lg overflow-hidden
              ${isLightMode ? "bg-darker" : "bg-tblack"}
              w-full`}
            dir={getDir()}
          >
            <div className="pl-3 pr-2">
              <Image
                src={SearchIcon}
                width={20}
                height={20}
                alt="search icon"
                className="opacity-80"
              />
            </div>
            <input
              type="text"
              className="bg-transparent placeholder-white py-2 px-1 outline-none border-none text-twhite w-full"
              placeholder={t("Search")}
              autoFocus
              value={searchText}
              onChange={handleSearchChange}
            />
          </form>
        </div>
      )}
    </>
  );
};

export default NewHeader;