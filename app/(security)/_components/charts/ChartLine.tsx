"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@mui/material/styles";

export interface ResolutionTrendPoint {
  month: string;
  avgHours: number | null;
}

interface ChartLineProps {
  data: ResolutionTrendPoint[];
}

const ChartLine = ({ data }: ChartLineProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const gridColor = isDark ? "#2C3E50" : theme.palette.divider;
  const axisColor = theme.palette.text.secondary;

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <RechartsLineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
        />

        <XAxis
          dataKey="month"
          stroke={axisColor}
        />

        <YAxis
          stroke={axisColor}
        />

        <Tooltip
          contentStyle={{
            background: theme.palette.background.paper,
            border: "none",
            borderRadius: 12,
            color: theme.palette.text.primary,
          }}
        />

        <Line
          type="monotone"
          dataKey="avgHours"
          name="Avg. resolution (hours)"
          stroke="#22C55E"
          strokeWidth={3}
          dot={{
            r: 5,
            fill: "#22C55E",
          }}
          activeDot={{
            r: 8,
          }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default ChartLine;
