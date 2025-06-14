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
      {selector.isLoading && pathname !== "/auth" && <PageSpinner />}
      {children}
    </>
  );
};

export default LoadingProvider;
