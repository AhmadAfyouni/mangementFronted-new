import { usePathname } from "next/navigation";
import React, { ReactElement } from "react";

const GridContainer = ({
  children,
  extraStyle,
}: {
  children: ReactElement | ReactElement[];
  extraStyle?: string;
}) => {
  const pathname = usePathname()
  return (
    <div
      className={`
        w-full 
        px-8
        py-4
        ${pathname == "/company-settings/onboarding" ? "" : "md:pl-[125px]"}    
        transition-all 
        duration-300 
        ${extraStyle}
      `}
    >
      {children}
    </div>
  );
};

export default GridContainer;
