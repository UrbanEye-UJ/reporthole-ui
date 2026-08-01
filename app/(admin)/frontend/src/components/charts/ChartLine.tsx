import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", hours: 5.8 },
  { month: "Feb", hours: 5.2 },
  { month: "Mar", hours: 4.9 },
  { month: "Apr", hours: 4.3 },
  { month: "May", hours: 3.9 },
  { month: "Jun", hours: 3.5 },
  { month: "Jul", hours: 3.2 },
  { month: "Aug", hours: 3.0 },
  { month: "Sep", hours: 2.9 },
  { month: "Oct", hours: 2.7 },
  { month: "Nov", hours: 2.5 },
  { month: "Dec", hours: 2.3 },
];

const LineChart = () => {
  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <RechartsLineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2C3E50"
        />

        <XAxis
          dataKey="month"
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

        <Line
          type="monotone"
          dataKey="hours"
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

export default LineChart;