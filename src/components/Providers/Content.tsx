// components/layouts/Content.tsx
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { logout } from "@/state/slices/userSlice";
import { AppDispatch } from "@/state/store";
import { tokenService } from "@/utils/axios/tokenService";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import NewHeader from "../common/atoms/NewHeader";
import Sidebar from "../common/molcules/Sidebar/Sidebar";
import PullToRefreshWrapper from "../common/molcules/ui/PullToRefreshWrapper";

const Content = ({ children }: { children: ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  // const { loading, isAuthenticated } = useAuth(); // not used temporarily for testing the refreshtoken validation
  const accessTokenCookie = tokenService.getAccessToken();
  const refreshTokenCookie = tokenService.getRefreshToken();
  const dispatch = useDispatch<AppDispatch>();
  const { getDir } = useLanguage();
  const pathname = usePathname();
  useCustomTheme();

  useEffect(() => {
    if (!accessTokenCookie || !refreshTokenCookie) {
      dispatch(logout());
    }
  }, [accessTokenCookie, dispatch, refreshTokenCookie]);

  return (
    <div className="min-h-[100dvh] w-full bg-main">
      <div className="flex h-full w-full">
        {
          // isAuthenticated &&
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
          className="transition-all bg-main mt-[49px] duration-300 py-5 w-full"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Content;
