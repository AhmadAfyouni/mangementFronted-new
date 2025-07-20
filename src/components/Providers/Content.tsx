// components/layouts/Content.tsx
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { store } from "@/state/store";
import { CompanySettingsType } from "@/types/CompanySettings.type";
import { isTrulyAuthenticated } from "@/utils/isTrulyAuthenticated";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import NewHeader from "../common/atoms/NewHeader";
import Sidebar from "../common/molcules/Sidebar/Sidebar";
import PullToRefreshWrapper from "../common/molcules/ui/PullToRefreshWrapper";

const Content = ({ children }: { children: ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { getDir } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  useCustomTheme();

  // Only fetch company settings if NOT on /auth and truly authenticated
  const trulyAuthenticated = isTrulyAuthenticated(store.getState());
  const shouldFetchCompanySettings = pathname !== "/auth" && trulyAuthenticated;
  const { data: companySettings, isLoading: isCompanySettingsLoading } = useCustomQuery<CompanySettingsType>({
    queryKey: ["company-settings"],
    url: "/company-settings",
    nestedData: true,
    enabled: shouldFetchCompanySettings,
  });

  // Onboarding redirect logic
  useEffect(() => {
    if (!isCompanySettingsLoading && companySettings && trulyAuthenticated) {
      // If company needs onboarding, but not already on onboarding or auth, redirect to onboarding
      if (
        companySettings.isFirstTime == true &&
        pathname !== "/company-settings/onboarding" &&
        pathname !== "/auth"
      ) {
        router.replace("/company-settings/onboarding");
      }
      // If onboarding is complete and currently on onboarding, redirect to home
      else if (
        companySettings.isFirstTime == false &&
        pathname === "/company-settings/onboarding"
      ) {
        router.replace("/home");
      }
    }
  }, [trulyAuthenticated, companySettings, isCompanySettingsLoading, pathname, router]);

  return (
    <div className="min-h-[100dvh] w-full bg-main">
      <div className="flex h-full w-full">
        {
          pathname !== "/company-settings/onboarding" &&
          pathname !== "/auth" && (
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
