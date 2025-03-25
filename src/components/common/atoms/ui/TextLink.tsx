"use client";

import Link from "next/link";
import React, { MouseEventHandler, ReactElement } from "react";

const TextButton = ({
  children,
  buttonStyle,
  icon,
  href,
}: {
  children: string;
  buttonStyle: string;
  icon?: ReactElement;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href: string;
}) => {
  return (
    <Link className={buttonStyle + " text-center inline-block"} href={href}>
      {children}
      {icon && icon}
    </Link>
  );
};

export default TextButton;
