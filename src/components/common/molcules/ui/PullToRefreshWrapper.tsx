// components/common/atoms/ui/PullToRefreshWrapper.tsx
import { PullToRefreshProvider } from "@/components/Providers/PullToRefreshProvider";
import React from "react";
import PullToRefreshIndicator from "../../atoms/ui/PullToRefreshIndicator";

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  dragAreaHeight?: number; // Height of draggable area in vh units
}

const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  children,
  dragAreaHeight = 20,
}) => {
  return (
    <PullToRefreshProvider dragAreaHeight={dragAreaHeight}>
      <PullToRefreshIndicator />
      {children}
    </PullToRefreshProvider>
  );
};

export default PullToRefreshWrapper;
