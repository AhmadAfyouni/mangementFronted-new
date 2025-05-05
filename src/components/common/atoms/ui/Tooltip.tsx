// components/Tooltip.tsx
"use client";

import useLanguage from "@/hooks/useLanguage";
import React, { ReactNode, useState } from "react";

interface TooltipProps {
  children: ReactNode; // The element that the tooltip is attached to
  content: string; // The tooltip content
  position?: "top" | "right" | "bottom" | "left"; // Tooltip position
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage()
  const tooltipPosition = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-[60%] top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mx-2",
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-10 px-3 py-2 text-sm text-twhite bg-dark rounded-r-lg rounded-tl-lg shadow-lg ${tooltipPosition[position]}`}
        >
          {t(content)}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
