"use client";

import React, { MouseEventHandler, ReactElement } from "react";

const TextButton = ({
  children,
  buttonStyle,
  icon,
  onClick,
}: {
  children: string;
  buttonStyle: string;
  icon?: ReactElement;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button onClick={onClick} className={buttonStyle} type="submit">
      {children}
      {icon && icon}
    </button>
  );
};

export default TextButton;
