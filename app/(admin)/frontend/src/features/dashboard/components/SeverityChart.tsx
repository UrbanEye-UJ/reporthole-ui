import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import Panel from "../../../components/ui/Panel";

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

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
};

export default SeverityChart;