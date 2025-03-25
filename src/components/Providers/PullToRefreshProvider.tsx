// components/common/providers/PullToRefreshProvider.tsx
import React, { createContext, useContext, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface PullToRefreshContextType {
  isRefreshing: boolean;
  pullProgress: number;
  scrollY: number;
}

const PullToRefreshContext = createContext<PullToRefreshContextType>({
  isRefreshing: false,
  pullProgress: 0,
  scrollY: 0,
});

export const usePullToRefresh = () => useContext(PullToRefreshContext);

interface PullToRefreshProviderProps {
  children: React.ReactNode;
  dragAreaHeight?: number; // Height of the draggable area in vh units
}

export const PullToRefreshProvider: React.FC<PullToRefreshProviderProps> = ({
  children,
  dragAreaHeight = 20, // Default to 20vh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const queryClient = useQueryClient();

  const isInDragArea = (y: number) => {
    const dragAreaPixels = (window.innerHeight * dragAreaHeight) / 100;
    return y <= dragAreaPixels;
  };

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0 && isInDragArea(e.touches[0].clientY)) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (
      window.scrollY === 0 &&
      startY.current !== 0 &&
      isInDragArea(e.touches[0].clientY)
    ) {
      const touchY = e.touches[0].clientY;
      const diff = touchY - startY.current;

      if (diff > 0) {
        e.preventDefault();
        const progress = Math.min(diff / 100, 1);
        setPullProgress(progress);
        setScrollY(diff);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullProgress >= 1 && !isRefreshing) {
      setIsRefreshing(true);
      await queryClient.refetchQueries();
      setIsRefreshing(false);
    }
    startY.current = 0;
    setPullProgress(0);
    setScrollY(0);
  };

  // Mouse handlers
  const handleMouseDown = (e: MouseEvent) => {
    if (window.scrollY === 0 && isInDragArea(e.clientY)) {
      isDragging.current = true;
      startY.current = e.clientY;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && window.scrollY === 0 && isInDragArea(e.clientY)) {
      const diff = e.clientY - startY.current;

      if (diff > 0) {
        e.preventDefault();
        const progress = Math.min(diff / 100, 1);
        setPullProgress(progress);
        setScrollY(diff);
      }
    }
  };

  const handleMouseUp = async () => {
    if (isDragging.current) {
      isDragging.current = false;
      if (pullProgress >= 1 && !isRefreshing) {
        setIsRefreshing(true);
        await queryClient.refetchQueries();
        setIsRefreshing(false);
      }
      startY.current = 0;
      setPullProgress(0);
      setScrollY(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      startY.current = 0;
      setPullProgress(0);
      setScrollY(0);
    }
  };

  React.useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullProgress, isRefreshing]);

  return (
    <PullToRefreshContext.Provider
      value={{ isRefreshing, pullProgress, scrollY }}
    >
      <div className="relative min-h-screen">
        <div
          className={`min-h-screen ${
            isDragging.current ? "cursor-grabbing" : ""
          }`}
          style={{
            userSelect: isDragging.current ? "none" : "auto",
            touchAction: window.scrollY === 0 ? "none" : "auto",
          }}
        >
          {children}
        </div>
      </div>
    </PullToRefreshContext.Provider>
  );
};
