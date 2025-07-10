// components/layouts/Content.tsx
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { logout } from "@/state/slices/userSlice";
import { AppDispatch } from "@/state/store";
import { tokenService } from "@/utils/axios/tokenService";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NewHeader from "../common/atoms/NewHeader";
import Sidebar from "../common/molcules/Sidebar/Sidebar";
import PullToRefreshWrapper from "../common/molcules/ui/PullToRefreshWrapper";
import useCustomQuery from "@/hooks/useCustomQuery";
import { RootState } from "@/state/store";
import { CompanySettingsType } from "@/types/CompanySettings.type";

const Content = ({ children }: { children: ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  // const { loading, isAuthenticated } = useAuth(); // not used temporarily for testing the refreshtoken validation
  const accessTokenCookie = tokenService.getAccessToken();
  const refreshTokenCookie = tokenService.getRefreshToken();
  const dispatch = useDispatch<AppDispatch>();
  const { getDir } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  useCustomTheme();

  // Fetch company settings for onboarding check
  const { data: companySettings, isLoading: isCompanySettingsLoading } = useCustomQuery<CompanySettingsType>({
    queryKey: ["company-settings"],
    url: "/company-settings",
    nestedData: true,
  });

  // Get authentication state from Redux
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!accessTokenCookie || !refreshTokenCookie) {
      dispatch(logout());
    }
  }, [accessTokenCookie, dispatch, refreshTokenCookie]);

  // Onboarding redirect logic
  useEffect(() => {
    if (!isCompanySettingsLoading && companySettings) {
      // If user is authenticated and company needs onboarding, but not already on onboarding, redirect to onboarding
      if (
        isAuthenticated &&
        companySettings.isFirstTime === true &&
        pathname !== "/company-settings/onboarding" &&
        pathname !== "/auth"
      ) {
        router.replace("/company-settings/onboarding");
      }
      // If user is authenticated, onboarding is complete, and currently on onboarding, redirect to home
      else if (
        isAuthenticated &&
        companySettings.isFirstTime === false &&
        pathname === "/company-settings/onboarding"
      ) {
        router.replace("/company-settings/onboarding");
      }
    }
  }, [isAuthenticated, companySettings, isCompanySettingsLoading, pathname, router]);

  return (
    <div className="min-h-[100dvh] w-full bg-main">
      <div className="flex h-full w-full">
        {
          // isAuthenticated &&
          pathname !== "/company-settings/onboarding" &&
          pathname != "/auth" && (
            <>
              <PullToRefreshWrapper>
                <NewHeader setIsExpanded={setIsSidebarExpanded} />
              </PullToRefreshWrapper>
              <Sidebar
                isExpanded={isSidebarExpanded}
                setIsExpanded={setIsSidebarExpanded}
              />
            </>
          )
        }
        <div
          dir={getDir()}
          className={`transition-all bg-main ${pathname == "/company-settings/onboarding" ? "" : "mt-[49px]"}  duration-300 py-5 w-full`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Content;
