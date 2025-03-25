// components/common/atoms/ui/PullToRefreshIndicator.tsx
import React from "react";
import { Loader } from "lucide-react";
import { usePullToRefresh } from "@/components/Providers/PullToRefreshProvider";

const PullToRefreshIndicator: React.FC = () => {
  const { isRefreshing, pullProgress, scrollY } = usePullToRefresh();

  if (pullProgress === 0 && !isRefreshing) return null;

  return (
    <div
      className="fixed left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
      style={{
        top: Math.max(scrollY - 60, 0),
        opacity: Math.min(pullProgress, 1),
        transform: `scale(${Math.min(pullProgress, 1)})`,
      }}
    >
      <div className="bg-dark backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2">
        <Loader
          className={`w-5 h-5 ${
            isRefreshing ? "animate-spin" : "animate-pulse"
          }`}
        />
        {/* <span className="text-sm font-medium">
          {isRefreshing
            ? "Refreshing..."
            : pullProgress >= 1
            ? "Release to refresh"
            : "Pull to refresh"}
        </span> */}
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
