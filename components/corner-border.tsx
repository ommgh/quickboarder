import React, { ReactNode } from "react";

interface CorneredBorderProps {
  children: ReactNode;
  cornerSize?: number;
  cornerThickness?: number;
  cornerColor?: string;
  borderColor?: string;
  borderWidth?: number;
  rounded?: boolean;
  className?: string;
}

export const CorneredBorder: React.FC<CorneredBorderProps> = ({
  children,
  cornerSize = 32,
  cornerThickness = 4,
  cornerColor = "black",
  borderColor = "rgb(209 213 219)", // gray-300
  borderWidth = 1,
  rounded = true,
  className = "",
}) => {
  const cornerSizeClass = `w-[${cornerSize}px] h-[${cornerSize}px]`;
  const cornerBorderClass = `border-[${cornerThickness}px]`;

  return (
    <div className={`relative ${className}`}>
      {/* Faded rectangle border */}
      <div
        className={`absolute inset-0 pointer-events-none ${rounded ? "rounded-xl" : ""}`}
        style={{
          border: `${borderWidth}px solid ${borderColor}`,
        }}
      ></div>

      {/* Top-left corner */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${cornerSize}px`,
          height: `${cornerSize}px`,
          borderTop: `${cornerThickness}px solid ${cornerColor}`,
          borderLeft: `${cornerThickness}px solid ${cornerColor}`,
        }}
      ></div>

      {/* Top-right corner */}
      <div
        className="absolute top-0 right-0"
        style={{
          width: `${cornerSize}px`,
          height: `${cornerSize}px`,
          borderTop: `${cornerThickness}px solid ${cornerColor}`,
          borderRight: `${cornerThickness}px solid ${cornerColor}`,
        }}
      ></div>

      {/* Bottom-left corner */}
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: `${cornerSize}px`,
          height: `${cornerSize}px`,
          borderBottom: `${cornerThickness}px solid ${cornerColor}`,
          borderLeft: `${cornerThickness}px solid ${cornerColor}`,
        }}
      ></div>

      {/* Bottom-right corner */}
      <div
        className="absolute bottom-0 right-0"
        style={{
          width: `${cornerSize}px`,
          height: `${cornerSize}px`,
          borderBottom: `${cornerThickness}px solid ${cornerColor}`,
          borderRight: `${cornerThickness}px solid ${cornerColor}`,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
