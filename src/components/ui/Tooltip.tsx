"use client";

import React, { useState, ReactNode, useId } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const tooltipId = useId();

  const childrenWithAria = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
      "aria-describedby": show ? tooltipId : undefined,
    })
    : children;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {childrenWithAria}
      {show && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg z-[60] shadow-xl whitespace-normal max-w-xs animate-in fade-in zoom-in-95 duration-200 ${className || ""}`}
        >
          {content}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
