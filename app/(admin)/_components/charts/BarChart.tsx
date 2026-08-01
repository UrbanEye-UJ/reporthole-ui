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

// TODO(api): replace with data from GET /admin/analytics/by-district
// Expected shape: { district: string; incidents: number }[]
const data = [
  { district: "Johannesburg", incidents: 482 },
  { district: "Pretoria", incidents: 398 },
  { district: "Ekurhuleni", incidents: 351 },
  { district: "Soweto", incidents: 284 },
  { district: "Midrand", incidents: 210 },
];

const BarChart = () => {
  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <RechartsBarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2C3E50"
        />

        <XAxis
          dataKey="district"
          stroke="#94A3B8"
        />

        <YAxis
          stroke="#94A3B8"
        />

        <Tooltip
          contentStyle={{
            background: "#111827",
            border: "none",
            borderRadius: 12,
            color: "#ffffff",
          }}
        />

        <Bar
          dataKey="incidents"
          fill="#4F8CFF"
          radius={[8, 8, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
