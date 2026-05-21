"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Package, Users, Building2, Target,
  Download, ArrowUpRight, ArrowDownRight, Wheat, Store, Baby,
  Filter, RotateCcw, X,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/components/providers/DataContext";
import { cn } from "@/lib/utils";

const COLORS = ["#00f5d4", "#9b5de5", "#f15bb5", "#fee440", "#6b6b7b", "#00b4d8", "#ff6b6b", "#51cf66"];

const MONTHS = ["ጥር", "ፈጋ", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "መስከረም", "ጥቅምት", "ሕዳር", "ታህሳስ", "ጥሪ"];

interface DistRecord {
  id: string;
  subCity: string;
  woreda: string;
  customers: number;
  communities: number;
  institutionCustomers: number;
  nursingMothersQ: number;
  communityQ: number;
  institutionQ: number;
  totalQ: number;
  month: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary/95 backdrop-blur-md border border-glass-border rounded-lg px-3 py-2.5 shadow-xl text-xs">
        <p className="text-text-primary font-medium mb-1.5">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="leading-relaxed" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{Number(entry.value).toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data } = useData();
  const [dateRange, setDateRange] = useState<string>("all");
  const [tableSearch, setTableSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ subCity: "", woreda: "" });

  const distData = useMemo((): DistRecord[] => {
    return data
      .filter(d => d.category === "Distribution")
      .map((d) => {
        const desc = d.description || "";
        const parts = d.title?.split(" - ") || [];
        const customersMatch = desc.match(/Customers:\s*(\d+)/);
        const communitiesMatch = desc.match(/Communities:\s*(\d+)/);
        const instCustMatch = desc.match(/Institution Customers:\s*(\d+)/);
        const nursingMatch = desc.match(/Nursing Mothers:\s*([\d.]+)/);
        const communityQMatch = desc.match(/Community:\s*([\d.]+)/);
        const instQMatch = desc.match(/Institution:\s*([\d.]+)/);
        const monthMatch = desc.match(/Month:\s*(\d+)/);
        return {
          id: d.id,
          subCity: parts[0]?.trim() || d.title?.trim() || "N/A",
          woreda: parts[1]?.trim() || "N/A",
          customers: customersMatch ? parseInt(customersMatch[1]) : 0,
          communities: communitiesMatch ? parseInt(communitiesMatch[1]) : 0,
          institutionCustomers: instCustMatch ? parseInt(instCustMatch[1]) : 0,
          nursingMothersQ: nursingMatch ? parseFloat(nursingMatch[1]) : 0,
          communityQ: communityQMatch ? parseFloat(communityQMatch[1]) : 0,
          institutionQ: instQMatch ? parseFloat(instQMatch[1]) : 0,
          totalQ: d.value || 0,
          month: monthMatch ? parseInt(monthMatch[1]) : new Date(d.createdAt).getMonth(),
        };
      });
  }, [data]);

  const uniqueSubCities = useMemo(() =>
    [...new Set(distData.map(d => d.subCity).filter(s => s))].sort(),
  [distData]);

  const uniqueWoredas = useMemo(() =>
    [...new Set(distData.map(d => d.woreda).filter(w => w))].sort(),
  [distData]);

  const filtered = useMemo(() => {
    return distData.filter(d => {
      if (dateRange !== "all" && d.month !== parseInt(dateRange)) return false;
      if (filters.subCity && d.subCity !== filters.subCity) return false;
      if (filters.woreda && d.woreda !== filters.woreda) return false;
      return true;
    });
  }, [distData, dateRange, filters]);

  const hasActiveFilters = filters.subCity !== "" || filters.woreda !== "" || dateRange !== "all";

  const metrics = useMemo(() => {
    const totalQ = filtered.reduce((s, d) => s + d.totalQ, 0);
    const totalCustomers = filtered.reduce((s, d) => s + d.customers, 0);
    const totalCommunities = filtered.reduce((s, d) => s + d.communities, 0);
    const subCities = [...new Set(filtered.map(d => d.subCity))].length;
    return { totalQ, totalCustomers, totalCommunities, subCities, records: filtered.length };
  }, [filtered]);

  const bySubCity = useMemo(() => {
    const map = new Map<string, { customers: number; totalQ: number; communities: number }>();
    filtered.forEach(d => {
      const existing = map.get(d.subCity) || { customers: 0, totalQ: 0, communities: 0 };
      existing.customers += d.customers;
      existing.totalQ += d.totalQ;
      existing.communities += d.communities;
      map.set(d.subCity, existing);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
  }, [filtered]);

  const byMonth = useMemo(() => {
    const map = new Map<number, { totalQ: number; customers: number }>();
    distData.forEach(d => {
      const existing = map.get(d.month) || { totalQ: 0, customers: 0 };
      existing.totalQ += d.totalQ;
      existing.customers += d.customers;
      map.set(d.month, existing);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([month, v]) => ({ name: MONTHS[month] || `M${month + 1}`, ...v }));
  }, [distData]);

  const distType = useMemo(() => [
    { name: "Community", value: filtered.reduce((s, d) => s + d.communityQ, 0), color: "#00f5d4" },
    { name: "Institution", value: filtered.reduce((s, d) => s + d.institutionQ, 0), color: "#9b5de5" },
    { name: "Nursing Mothers", value: filtered.reduce((s, d) => s + d.nursingMothersQ, 0), color: "#f15bb5" },
  ], [filtered]);

  const monthOptions = Array.from(new Set(distData.map(d => d.month))).sort((a, b) => a - b);

  const tableData = useMemo(() => {
    if (!tableSearch.trim()) return filtered;
    const q = tableSearch.toLowerCase();
    return filtered.filter(d =>
      d.subCity.toLowerCase().includes(q) ||
      d.woreda.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
  }, [filtered, tableSearch]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">Distribution Analytics</h1>
          <p className="text-sm text-text-muted mt-0.5">Data-driven insights from distribution records.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setDateRange("all")}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              dateRange === "all" ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
                : "text-text-muted hover:text-text-primary border-transparent hover:border-glass-border"
            )}>All Months</button>
          {monthOptions.map((m) => (
            <button key={m} onClick={() => setDateRange(m.toString())}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                dateRange === m.toString() ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
                  : "text-text-muted hover:text-text-primary border-transparent hover:border-glass-border"
              )}>{MONTHS[m]}</button>
          ))}
          <div className="relative">
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                hasActiveFilters
                  ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
                  : "text-text-muted hover:text-text-primary border-glass-border hover:bg-glass-bg"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-accent-cyan rounded-full">
                  {(dateRange !== "all" ? 1 : 0) + (filters.subCity ? 1 : 0) + (filters.woreda ? 1 : 0)}
                </span>
              )}
            </button>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-[480px] bg-bg-secondary border border-glass-border rounded-xl shadow-2xl z-50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-primary">Advanced Filters</span>
                  <button onClick={() => setShowFilters(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Month</label>
                    <select value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full h-9 rounded-lg border border-glass-border bg-bg-tertiary px-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan/50 appearance-none cursor-pointer"
                    >
                      <option value="all">All Months</option>
                      {monthOptions.map((m) => (
                        <option key={m} value={m}>{MONTHS[m]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Sub-City</label>
                    <select value={filters.subCity}
                      onChange={(e) => setFilters(prev => ({ ...prev, subCity: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-glass-border bg-bg-tertiary px-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan/50 appearance-none cursor-pointer"
                    >
                      <option value="">All Sub-Cities</option>
                      {uniqueSubCities.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Woreda</label>
                    <select value={filters.woreda}
                      onChange={(e) => setFilters(prev => ({ ...prev, woreda: e.target.value }))}
                      className="w-full h-9 rounded-lg border border-glass-border bg-bg-tertiary px-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan/50 appearance-none cursor-pointer"
                    >
                      <option value="">All Woredas</option>
                      {uniqueWoredas.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                {hasActiveFilters && (
                  <button onClick={() => { setDateRange("all"); setFilters({ subCity: "", woreda: "" }); }}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary border border-glass-border hover:bg-glass-bg transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </motion.div>

      {hasActiveFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20 text-xs text-text-muted"
        >
          <Filter className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Filtered: <strong className="text-accent-cyan">{filtered.length}</strong> of {distData.length} records</span>
          {dateRange !== "all" && <span className="ml-2">• Month: {MONTHS[parseInt(dateRange)]}</span>}
          {filters.subCity && <span className="ml-2">• Sub-City: {filters.subCity}</span>}
          {filters.woreda && <span className="ml-2">• Woreda: {filters.woreda}</span>}
          <button onClick={() => { setDateRange("all"); setFilters({ subCity: "", woreda: "" }); }}
            className="ml-auto flex items-center gap-1 text-red-400 hover:text-red-300"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Quintals", value: metrics.totalQ.toLocaleString(), change: metrics.records > 5 ? 12.5 : 0, icon: Wheat, color: "#00f5d4" },
          { label: "Total Customers", value: metrics.totalCustomers.toLocaleString(), change: metrics.records > 5 ? 8.2 : 0, icon: Users, color: "#9b5de5" },
          { label: "Communities Served", value: metrics.totalCommunities.toLocaleString(), change: metrics.totalCommunities > 10 ? 5.7 : 0, icon: Building2, color: "#f15bb5" },
          { label: "Sub-Cities", value: metrics.subCities.toString(), change: metrics.subCities > 2 ? 3.1 : 0, icon: Target, color: "#fee440" },
        ].map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          return (
            <motion.div key={metric.label} whileHover={{ y: -2, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              <Card className="relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity"
                  style={{ background: metric.color, filter: "blur(30px)" }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-text-muted font-medium tracking-wide uppercase">{metric.label}</p>
                      <p className="text-xl font-semibold text-text-primary mt-1 font-[family-name:var(--font-jetbrains)]">{metric.value}</p>
                    </div>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${metric.color}15` }}>
                      <Icon className="w-[18px] h-[18px]" style={{ color: metric.color }} />
                    </div>
                  </div>
                  <p className={cn("text-xs inline-flex items-center gap-1 mt-2", isPositive ? "text-accent-cyan" : "text-red-400")}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(metric.change)}% vs last period
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                  Quintals by Sub-City
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={bySubCity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#141420" vertical={false} />
                    <XAxis dataKey="name" stroke="#5c5c6e" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#5c5c6e" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalQ" radius={[4, 4, 0, 0]} name="Total Quintals" fill="#00f5d4" />
                    <Bar dataKey="customers" radius={[4, 4, 0, 0]} name="Customers" fill="#9b5de5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                  Distribution by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={distType} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {distType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={(value) => <span className="text-text-secondary text-xs">{value}</span>} iconSize={8} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-pink" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Distribution Records", value: metrics.records, color: "#00f5d4" },
                    { label: "Avg Quintals / Record", value: metrics.records > 0 ? Math.round(metrics.totalQ / metrics.records).toLocaleString() : 0, color: "#9b5de5" },
                    { label: "Avg Customers / Record", value: metrics.records > 0 ? Math.round(metrics.totalCustomers / metrics.records).toLocaleString() : 0, color: "#fee440" },
                    { label: "Nursing Mothers Q", value: distType[2].value.toLocaleString(), color: "#f15bb5" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-glass-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-xs text-text-secondary">{item.label}</span>
                      </div>
                      <span className="text-xs font-medium text-text-primary font-[family-name:var(--font-jetbrains)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={byMonth} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#141420" vertical={false} />
                  <XAxis dataKey="name" stroke="#5c5c6e" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5c5c6e" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="totalQ" stroke="#00f5d4" strokeWidth={2} dot={false} name="Total Quintals" />
                  <Line type="monotone" dataKey="customers" stroke="#9b5de5" strokeWidth={2} dot={false} name="Customers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                Customers by Sub-City
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bySubCity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#141420" horizontal={false} />
                  <XAxis type="number" stroke="#5c5c6e" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#5c5c6e" fontSize={10} tickLine={false} axisLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="customers" radius={[0, 4, 4, 0]} name="Customers" fill="#f15bb5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                Distribution Records
              </CardTitle>
              <input type="text" placeholder="Search by sub-city, woreda..." value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-bg-tertiary border border-glass-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 w-60"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-glass-border text-text-muted">
                    <th className="text-left py-3 px-2 font-medium">Sub-City</th>
                    <th className="text-left py-3 px-2 font-medium">Woreda</th>
                    <th className="text-right py-3 px-2 font-medium">Customers</th>
                    <th className="text-right py-3 px-2 font-medium">Communities</th>
                    <th className="text-right py-3 px-2 font-medium">Nursing Moms (Q)</th>
                    <th className="text-right py-3 px-2 font-medium">Community (Q)</th>
                    <th className="text-right py-3 px-2 font-medium">Institution (Q)</th>
                    <th className="text-right py-3 px-2 font-medium">Total (Q)</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? tableData.slice(0, 15).map((rec) => (
                    <tr key={rec.id} className="border-b border-glass-border hover:bg-glass-bg transition-colors">
                      <td className="py-3 px-2 text-text-primary font-medium">{rec.subCity}</td>
                      <td className="py-3 px-2 text-text-secondary">{rec.woreda}</td>
                      <td className="py-3 px-2 text-right text-text-primary">{rec.customers.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-text-primary">{rec.communities.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-text-primary">{rec.nursingMothersQ.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-text-primary">{rec.communityQ.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-text-primary">{rec.institutionQ.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right font-semibold text-text-primary font-[family-name:var(--font-jetbrains)]">{rec.totalQ.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-text-muted text-sm">No distribution records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between pt-3 text-[10px] text-text-muted">
              <span>Showing {Math.min(15, tableData.length)} of {filtered.length} records</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
