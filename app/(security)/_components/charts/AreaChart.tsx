"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@mui/material/styles";

export interface MonthlyTrendPoint {
  month: string;
  count: number;
}

interface AreaChartProps {
  data: MonthlyTrendPoint[];
}

const AreaChart = ({ data }: AreaChartProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const gridColor = isDark ? "#2C3E50" : theme.palette.divider;
  const axisColor = theme.palette.text.secondary;

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <RechartsAreaChart data={data}>
        <defs>
          <linearGradient
            id="incidentGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="#4F8CFF"
              stopOpacity={0.8}
            />

            <stop
              offset="95%"
              stopColor="#4F8CFF"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

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
          allowDecimals={false}
        />

        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "none",
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        />

        <Area
          type="monotone"
          dataKey="count"
          name="Incidents"
          stroke="#4F8CFF"
          strokeWidth={3}
          fill="url(#incidentGradient)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
