"use client";

import { useRedux } from "@/hooks/useRedux";
import { setLaoding } from "@/state/slices/wrapper.slice";
import { RootState } from "@/state/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";

interface RouteWrapperProps {
  href: string;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({
  href,
  children,
  onClick,
  className = "",
}) => {
  const { dispatchAction } = useRedux((state: RootState) => state.wrapper);
  const router = useRouter();
  const pathname = usePathname();

  const handleRoute = (e: React.MouseEvent) => {
    e.preventDefault();

    if (href !== pathname) dispatchAction(setLaoding, true);

    if (onClick) onClick();

    if (href == "/auth") {
      router.replace(href);
    } else router.push(href);
  };

  useEffect(() => {
    if (pathname) {
      dispatchAction(setLaoding, false);
    }
  }, [dispatchAction, pathname]);

  return (
    <Link href={href} className={className} onClick={handleRoute}>
      {children}
    </Link>
  );
};

export default RouteWrapper;
