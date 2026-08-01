import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", incidents: 120 },
  { month: "Feb", incidents: 160 },
  { month: "Mar", incidents: 145 },
  { month: "Apr", incidents: 190 },
  { month: "May", incidents: 240 },
  { month: "Jun", incidents: 280 },
  { month: "Jul", incidents: 255 },
  { month: "Aug", incidents: 310 },
  { month: "Sep", incidents: 290 },
  { month: "Oct", incidents: 335 },
  { month: "Nov", incidents: 360 },
  { month: "Dec", incidents: 390 },
];

const AreaChart = () => {
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
            borderRadius: 12,
            border: "none",
            background: "#111827",
            color: "#ffffff",
          }}
        />

        <Area
          type="monotone"
          dataKey="incidents"
          stroke="#4F8CFF"
          strokeWidth={3}
          fill="url(#incidentGradient)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;