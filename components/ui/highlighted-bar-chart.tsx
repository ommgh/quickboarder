"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, Cell } from "recharts";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

const chartData = [
  { month: "January", units: 0 },
  { month: "February", units: 0 },
  { month: "March", units: 0 },
  { month: "April", units: 0 },
  { month: "May", units: 0 },
  { month: "June", units: 0 },
  { month: "July", units: 0 },
  { month: "August", units: 0 },
  { month: "September", units: 0 },
  { month: "October", units: 0 },
  { month: "November", units: 0 },
  { month: "December", units: 0 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function HighlightedBarChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const activeData = React.useMemo(() => {
    if (activeIndex === null) return null;
    return chartData[activeIndex];
  }, [activeIndex]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>
          Sales Overview
          <Badge
            variant="outline"
            className="text-green-500 bg-green-500/10 border-none ml-2"
          >
            <TrendingUp className="h-2 w-2" />
          </Badge>
        </CardTitle>
        <CardDescription>
          {activeData
            ? `${activeData.month}: ${activeData.units}`
            : "January - December 2026"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <rect
              x="0"
              y="0"
              width="100%"
              height="85%"
              fill="url(#highlighted-pattern-dots)"
            />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" radius={4} fill="var(--color-desktop)">
              {chartData.map((_, index) => (
                <Cell
                  className="duration-200"
                  key={`cell-${index}`}
                  fillOpacity={
                    activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                  }
                  stroke={activeIndex === index ? "var(--color-desktop)" : ""}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="highlighted-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};
