"use client";
import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";
import React, { ReactNode } from "react";
import PageSpinner from "../common/atoms/ui/PageSpinner";
import { usePathname } from "next/navigation";

interface LoadingProviderProps {
  children: ReactNode;
}

const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const { selector } = useRedux((state: RootState) => state.wrapper);
  const pathname = usePathname();

  return (
    <>
      {selector.isLoading && pathname !== "/auth" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/5 z-50">
          <PageSpinner />
        </div>
      )}
      {children}
    </>
  );
};

export default LoadingProvider;
