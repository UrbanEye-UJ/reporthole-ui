import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "Critical",
    value: 38,
    color: "#EF4444",
  },
  {
    name: "High",
    value: 92,
    color: "#F97316",
  },
  {
    name: "Medium",
    value: 184,
    color: "#F59E0B",
  },
  {
    name: "Low",
    value: 276,
    color: "#22C55E",
  },
];

const DoughnutChart = () => {
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
            background: "#111827",
            border: "none",
            borderRadius: 12,
            color: "#ffffff",
          }}
        />

        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{
            color: "#F8FAFC",
            paddingTop: 20,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DoughnutChart;