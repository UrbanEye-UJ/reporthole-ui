"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useTheme } from "@mui/material";

import Panel from "../ui/Panel";

// TODO(api): replace with data from GET /admin/dashboard/severity-distribution
// Expected shape: { name: string; value: number; color: string }[]
const data = [
  {
    name: "Low",
    value: 340,
    color: "#22C55E",
  },
  {
    name: "Medium",
    value: 520,
    color: "#F59E0B",
  },
  {
    name: "High",
    value: 760,
    color: "#3B82F6",
  },
  {
    name: "Critical",
    value: 180,
    color: "#EF4444",
  },
];

const SeverityChart = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Panel title="Incident Severity">
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
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
              background: isDark ? "#111827" : "#ffffff",
              border: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "#E5E7EB"}`,
              borderRadius: 12,
              color: isDark ? "#ffffff" : "#1F2937",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
};

export default SeverityChart;
