import React from "react";

interface LineWithCapsProps {
  orientation?: "horizontal" | "vertical";
  thickness?: number;
  capLength?: number;
  color?: string;
  className?: string;
}

export const LineWithCaps: React.FC<LineWithCapsProps> = ({
  orientation = "horizontal",
  thickness = 2,
  capLength = 12,
  color = "currentColor",
  className = "",
}) => {
  const isHorizontal = orientation === "horizontal";

  if (isHorizontal) {
    return (
      <svg
        className={className}
        style={{
          width: "100%",
          height: `${capLength}px`,
        }}
        preserveAspectRatio="none"
        viewBox="0 0 100 12"
      >
        {/* Main horizontal line */}
        <line
          x1={0}
          y1={6}
          x2={100}
          y2={6}
          stroke={color}
          strokeWidth={thickness}
          vectorEffect="non-scaling-stroke"
        />
        {/* Left cap */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={12}
          stroke={color}
          strokeWidth={thickness}
          vectorEffect="non-scaling-stroke"
        />
        {/* Right cap */}
        <line
          x1={100}
          y1={0}
          x2={100}
          y2={12}
          stroke={color}
          strokeWidth={thickness}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // Vertical orientation
  return (
    <svg
      className={className}
      style={{
        width: `${capLength}px`,
        height: "100%",
      }}
      preserveAspectRatio="none"
      viewBox="0 0 12 100"
    >
      {/* Main vertical line */}
      <line
        x1={6}
        y1={0}
        x2={6}
        y2={100}
        stroke={color}
        strokeWidth={thickness}
        vectorEffect="non-scaling-stroke"
      />
      {/* Top cap */}
      <line
        x1={0}
        y1={0}
        x2={12}
        y2={0}
        stroke={color}
        strokeWidth={thickness}
        vectorEffect="non-scaling-stroke"
      />
      {/* Bottom cap */}
      <line
        x1={0}
        y1={100}
        x2={12}
        y2={100}
        stroke={color}
        strokeWidth={thickness}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
