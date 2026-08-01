"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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
              background: "#111827",
              border: "none",
              borderRadius: 12,
              color: "#ffffff",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
};

export default SeverityChart;
