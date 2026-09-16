"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTheme } from "@mui/material/styles";

export interface DoughnutSlice {
  name: string;
  value: number;
  color: string;
}

interface DoughnutChartProps {
  data: DoughnutSlice[];
}

const DoughnutChart = ({ data }: DoughnutChartProps) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={4}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.color}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            background: theme.palette.background.paper,
            border: "none",
            borderRadius: 12,
            color: theme.palette.text.primary,
          }}
        />

        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{
            color: theme.palette.text.secondary,
            paddingTop: 20,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DoughnutChart;
