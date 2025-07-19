// LayoutProviders.tsx
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Content from "./Content";
import I18nProvider from "./I18nProvider";
import { QueryProvider } from "./QueryProvider";
import ReduxProvider from "./ReduxProvider";
import LoadingProvider from "./LoadingProvider";
import { MokkBarProvider } from "./Mokkbar";

const LayoutProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ReduxProvider>
      <QueryProvider>
        <I18nProvider>
          <LoadingProvider>
            <MokkBarProvider>
              <Content>{children}</Content>
              <Toaster />
            </MokkBarProvider>
          </LoadingProvider>
        </I18nProvider>
      </QueryProvider>
    </ReduxProvider>
  );
};

export default LayoutProviders;
