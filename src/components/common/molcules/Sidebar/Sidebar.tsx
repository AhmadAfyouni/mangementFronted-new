"use client";
import { ChatsIcon } from "@/assets";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useCustomTheme from "@/hooks/useCustomTheme";
import { RootState } from "@/state/store";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import RouteWrapper from "../../atoms/ui/RouteWrapper";
import Tooltip from "../../atoms/ui/Tooltip";
import { sidebarItems } from "./data";
import { SidebarItem } from "./SidebarItem";
import { usePathname } from "next/navigation";

const Sidebar = ({
  isExpanded,
  setIsExpanded,
}: {
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const isAdmin = useRolePermissions("admin");
  const userPermissions = useSelector(
    (state: RootState) => state.user.userInfo?.job.permissions
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isLightMode } = useCustomTheme();
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Get visible items based on permissions
  const visibleItems = userPermissions
    ? sidebarItems.filter(
      (item) =>
        isAdmin ||
        item.requiredPermissions.length === 0 ||
        item.requiredPermissions.some((permission) =>
          userPermissions.includes(permission)
        )
    )
    : [];

  // Initialize selected tab with validation
  const getValidSelectedTab = () => {
    const storedTab = localStorage.getItem("selectedTab");
    // Check if stored tab exists and is in visible items
    if (storedTab && visibleItems.some((item) => item.path === storedTab)) {
      return storedTab;
    }
    // Fallback to first visible item's path or "/home" if no items
    return visibleItems.length > 0 ? visibleItems[0].path : "/home";
  };

  const [selectedTab, setSelectedTab] = useState(getValidSelectedTab);

  // Revalidate selected tab when permissions change
  useEffect(() => {
    const validTab = getValidSelectedTab();
    if (selectedTab !== validTab) {
      setSelectedTab(validTab);
      localStorage.setItem("selectedTab", validTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPermissions, isAdmin]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTabClick = (path: string) => {
    setSelectedTab(path);
    localStorage.setItem("selectedTab", path);
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      <div
        className={`
          ${isExpanded
            ? "fixed inset-0 bg-slate-600/10 backdrop-blur-sm z-[var(--z-index-sidebar-backdrop)]"
            : ""
          }
          ${isMobile ? "touch-none" : ""}
        `}
        onClick={() => setIsExpanded(false)}
      >
        <div
          className={`
            shadow-md p-5 fixed transition-all duration-300 ease-in-out
            border-r border-slate-600
            ${isLightMode ? "bg-darkest" : "bg-main"}
            ${isMobile
              ? `top-0 h-full ${isExpanded ? "left-0" : "-left-full"}`
              : `top-[50px] bottom-0 left-0`
            }
            ${!isMobile &&
            (isExpanded ? "w-[240px] mx-5" : "w-[92px] transform origin-left")
            }
            z-[var(--z-index-sidebar)]
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`sidebar flex flex-col gap-4 ${isMobile && isExpanded ? "py-16" : "py-4"
              } transition-all duration-300 ${!isMobile && !isExpanded ? "opacity-90" : "opacity-100"
              }`}
          >
            {visibleItems.map((item, index) => (
              <RouteWrapper
                href={item.path}
                key={index}
                onClick={() => handleTabClick(item.path)}
              >
                {!isExpanded ? (
                  <Tooltip content={item.label} position="right">
                    <SidebarItem
                      icon={item.icon}
                      label={t(item.label)}
                      isExpanded={isExpanded}
                      isSelected={
                        pathname == item.path ||
                        pathname.split("/")[1] == item.path.split("/")[1]
                      }
                      onClick={() => { }}
                    />
                  </Tooltip>
                ) : (
                  <SidebarItem
                    icon={item.icon}
                    label={t(item.label)}
                    isExpanded={isExpanded}
                    isSelected={
                      pathname == item.path ||
                      pathname.split("/")[1] == item.path.split("/")[1]
                    }
                    onClick={() => { }}
                  />
                )}
              </RouteWrapper>
            ))}
            <div className="h-[1px] w-full bg-slate-200"></div>
            <div className="flex justify-start">
              <SidebarItem
                icon={ChatsIcon}
                label={t(`Department Chat`)}
                isExpanded={isExpanded}
                isSelected={isChatOpen}
                onClick={() => setIsChatOpen((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
