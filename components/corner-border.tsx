import React from "react";

interface CorneredBoxProps {
  children: React.ReactNode;
  className?: string;
  cornerSize?: string;
  cornerColor?: string;
  borderColor?: string;
  rounded?: string;
}

export default function CorneredBox({
  children,
  className = "",
  cornerSize = "w-2 h-2",
  cornerColor = "border-gray-400",
  borderColor = "border-gray-200 dark:border-gray-700",
}: CorneredBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute inset-0 border ${borderColor} pointer-events-none`}
      ></div>

      <div
        className={`absolute top-0 left-0 ${cornerSize} border-t-2 border-l-2 ${cornerColor}`}
      ></div>

      <div
        className={`absolute top-0 right-0 ${cornerSize} border-t-2 border-r-2 ${cornerColor}`}
      ></div>

      <div
        className={`absolute bottom-0 left-0 ${cornerSize} border-b-2 border-l-2 ${cornerColor}`}
      ></div>

      <div
        className={`absolute bottom-0 right-0 ${cornerSize} border-b-2 border-r-2 ${cornerColor}`}
      ></div>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
