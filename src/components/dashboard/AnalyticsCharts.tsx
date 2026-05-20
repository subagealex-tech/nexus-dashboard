"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const defaultLineChartData = [
  { name: "Jan", value: 400, value2: 300, value3: 500 },
  { name: "Feb", value: 300, value2: 400, value3: 450 },
  { name: "Mar", value: 500, value2: 500, value3: 600 },
  { name: "Apr", value: 450, value2: 350, value3: 550 },
  { name: "May", value: 600, value2: 450, value3: 700 },
  { name: "Jun", value: 550, value2: 500, value3: 650 },
  { name: "Jul", value: 700, value2: 600, value3: 800 },
];

const defaultAreaChartData = [
  { name: "Week 1", value: 1200 },
  { name: "Week 2", value: 1800 },
  { name: "Week 3", value: 2400 },
  { name: "Week 4", value: 3200 },
  { name: "Week 5", value: 2800 },
  { name: "Week 6", value: 3600 },
  { name: "Week 7", value: 4200 },
];

const defaultPieChartData = [
  { name: "Analytics", value: 35, color: "#00f5d4" },
  { name: "Storage", value: 25, color: "#9b5de5" },
  { name: "Network", value: 20, color: "#f15bb5" },
  { name: "Security", value: 15, color: "#fee440" },
  { name: "Other", value: 5, color: "#6b6b7b" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-glass-border">
        <p className="text-text-primary text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ChartProps {
  data?: any[];
}

export function MultiLineChart({ data = defaultLineChartData }: ChartProps) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-outfit)]">
          Data Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a25" />
            <XAxis
              dataKey="name"
              stroke="#6b6b7b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b6b7b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00f5d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#00f5d4" }}
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke="#9b5de5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#9b5de5" }}
            />
            <Line
              type="monotone"
              dataKey="value3"
              stroke="#f15bb5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#f15bb5" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AreaChartComponent({ data = defaultAreaChartData }: ChartProps) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-outfit)]">
          Cumulative Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b5de5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9b5de5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a25" />
            <XAxis
              dataKey="name"
              stroke="#6b6b7b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b6b7b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#9b5de5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DoughnutChart({ data = defaultPieChartData }: ChartProps) {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-outfit)]">
          Category Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || defaultPieChartData[index]?.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-text-secondary text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  sparklineData,
  color,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  sparklineData?: number[];
  color: string;
}) {
  const sparklinePoints = sparklineData
    ? sparklineData
        .map((v, i) => `${i === 0 ? "M" : "L"} ${i * 20} ${100 - v}`)
        .join(" ")
    : "";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card hover className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-10"
          style={{ background: color, filter: "blur(40px)" }}
        />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-muted text-sm">{title}</p>
              <p className="text-2xl font-bold text-text-primary mt-1 font-[family-name:var(--font-jetbrains)]">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {change !== undefined && (
                <p
                  className={`text-sm mt-1 ${
                    change >= 0 ? "text-accent-cyan" : "text-red-400"
                  }`}
                >
                  {change >= 0 ? "+" : ""}
                  {change}% from last month
                </p>
              )}
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-4 h-12">
              <svg width="100%" height="100%" viewBox="0 0 140 100">
                <path
                  d={sparklinePoints}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}