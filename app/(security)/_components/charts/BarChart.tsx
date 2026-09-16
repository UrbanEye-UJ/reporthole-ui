"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@mui/material/styles";

export interface FunnelStage {
  label: string;
  count: number;
}

interface BarChartProps {
  data: FunnelStage[];
}

/** Status funnel — how many incidents currently sit at each lifecycle stage. */
const BarChart = ({ data }: BarChartProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const gridColor = isDark ? "#2C3E50" : theme.palette.divider;
  const axisColor = theme.palette.text.secondary;

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <RechartsBarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
        />

        <XAxis
          dataKey="label"
          stroke={axisColor}
        />

        <YAxis
          stroke={axisColor}
          allowDecimals={false}
        />

        <Tooltip
          contentStyle={{
            background: theme.palette.background.paper,
            border: "none",
            borderRadius: 12,
            color: theme.palette.text.primary,
          }}
        />

        <Bar
          dataKey="count"
          name="Incidents"
          fill="#4F8CFF"
          radius={[8, 8, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
