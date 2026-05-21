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
import { Card, CardContent } from "@/components/ui/card";

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
  { name: "Other", value: 5, color: "#5c5c6e" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary/95 backdrop-blur-md border border-glass-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-text-primary text-xs font-medium mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs leading-relaxed" style={{ color: entry.color }}>
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
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#141420" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#5c5c6e"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#5c5c6e"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#00f5d4"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#00f5d4", strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="value2"
          stroke="#9b5de5"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#9b5de5", strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="value3"
          stroke="#f15bb5"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#f15bb5", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaChartComponent({ data = defaultAreaChartData }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9b5de5" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#9b5de5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#141420" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#5c5c6e"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#5c5c6e"
          fontSize={11}
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
  );
}

export function DoughnutChart({ data = defaultPieChartData }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color || defaultPieChartData[index]?.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-text-secondary text-xs">{value}</span>
          )}
          iconSize={8}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
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
  const maxSpark = sparklineData ? Math.max(...sparklineData) : 100;
  const minSpark = sparklineData ? Math.min(...sparklineData) : 0;
  const range = maxSpark - minSpark || 1;
  const points = sparklineData
    ? sparklineData
        .map((v, i) => {
          const x = (i / (sparklineData.length - 1)) * 100;
          const y = 100 - ((v - minSpark) / range) * 80 - 10;
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ")
    : "";

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden h-full group">
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
          style={{ background: color, filter: "blur(30px)" }}
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-text-muted font-medium tracking-wide uppercase">
                {title}
              </p>
              <p className="text-xl font-semibold text-text-primary mt-1 font-[family-name:var(--font-jetbrains)] tracking-tight">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color }} />
            </div>
          </div>
          {change !== undefined && (
            <p className={`text-xs inline-flex items-center gap-1 ${change >= 0 ? "text-accent-cyan" : "text-red-400"}`}>
              <span>{change >= 0 ? "↑" : "↓"}</span>
              {Math.abs(change)}% from last month
            </p>
          )}
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-3 h-8">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                />
              </svg>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
