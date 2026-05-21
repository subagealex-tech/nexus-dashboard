"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Database,
  TrendingUp,
  Zap,
  Layers,
  StickyNote,
  CheckSquare,
  ChevronRight,
  FileText,
  Activity,
  Users,
  UserCog,
  Settings,
  FolderTree,
  BarChart3,
  ListTodo,
  Calendar,
} from "lucide-react";
import {
  KPICard,
  MultiLineChart,
  AreaChartComponent,
  DoughnutChart,
} from "@/components/dashboard/AnalyticsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/components/providers/DataContext";
import { useNotes } from "@/components/providers/NotesContext";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "Active" | "Lead" | "Inactive";
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data } = useData();
  const { notes, todos } = useNotes();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("contacts");
    if (stored) {
      try { setContacts(JSON.parse(stored)); } catch { setContacts([]); }
    }
  }, []);

  const kpiData = useMemo(() => {
    const totalEntries = data.length;
    const activeCount = data.filter(d => d.status === "ACTIVE").length;
    const avgValue = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length) : 0;
    const categoryCount = [...new Set(data.map(d => d.category))].length;
    return { totalEntries, activePercentage: totalEntries > 0 ? Math.round((activeCount / totalEntries) * 100) : 0, avgValue, categoryCount };
  }, [data]);

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const lineChartData = months.map((name, i) => ({ name, value: 300 + i * 50 + 100, value2: 300 + i * 50, value3: 300 + i * 50 + 300 }));
    const areaChartData = months.map((name, i) => ({ name, value: (i + 1) * 800 }));
    const categoryData = data.reduce((acc, item) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    const colors = ["#00f5d4", "#9b5de5", "#f15bb5", "#fee440", "#6b6b7b"];
    const categories = Object.keys(categoryData);
    const pieData = categories.slice(0, 5).map((cat, i) => ({ name: cat, value: categoryData[cat], color: colors[i % colors.length] }));
    return { lineChartData, areaChartData, pieData };
  }, [data]);

  const sparklineData = useMemo(() => [45, 52, 38, 65, 58, 72, 68], []);
  const activeTodos = todos.filter(t => !t.completed).length;
  const recentNotes = notes.slice(0, 3);
  const activeContacts = contacts.filter(c => c.status === "Active").length;

  const overviewCards = [
    { href: "/dashboard/data", label: "Data", icon: Database, value: kpiData.totalEntries, sub: `${kpiData.activePercentage}% active`, color: "#00f5d4" },
    { href: "/dashboard/notes", label: "Notes", icon: StickyNote, value: notes.length, sub: `${activeTodos} active todos`, color: "#9b5de5" },
    { href: "/dashboard/contacts", label: "Contacts", icon: Users, value: contacts.length, sub: `${activeContacts} active`, color: "#f15bb5" },
    { href: "/dashboard/organization", label: "Documents", icon: FolderTree, value: "—", sub: "Browse files", color: "#fee440" },
  ];

  const statusOptions = ["Active", "Lead", "Inactive"] as const;
  const contactsByStatus = useMemo(() => {
    return statusOptions.map((s) => ({
      status: s,
      count: contacts.filter((c) => c.status === s).length,
      percentage: contacts.length > 0 ? Math.round((contacts.filter((c) => c.status === s).length / contacts.length) * 100) : 0,
    }));
  }, [contacts]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Welcome back — here&apos;s an overview across all sections.</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-text-muted bg-glass-bg border border-glass-border px-3 py-1.5 rounded-full">
          <Activity className="w-3.5 h-3.5 text-accent-cyan" />
          All systems normal
        </span>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <KPICard title="Total Entries" value={kpiData.totalEntries} change={kpiData.totalEntries > 10 ? 12.5 : 0}
            icon={Database} sparklineData={sparklineData} color="#00f5d4" />
        </motion.div>
        <motion.div variants={item}>
          <KPICard title="Active Rate" value={`${kpiData.activePercentage}%`} change={kpiData.activePercentage > 50 ? 8.2 : -3.1}
            icon={TrendingUp} sparklineData={sparklineData.map(v => v + 10)} color="#9b5de5" />
        </motion.div>
        <motion.div variants={item}>
          <KPICard title="Avg Value" value={kpiData.avgValue.toLocaleString()} change={5.4}
            icon={Zap} sparklineData={sparklineData.map(v => v - 10)} color="#f15bb5" />
        </motion.div>
        <motion.div variants={item}>
          <KPICard title="Categories" value={kpiData.categoryCount} change={15.3}
            icon={Layers} sparklineData={sparklineData} color="#fee440" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card hover className="h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${card.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">{card.label}</p>
                    <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-jetbrains)]">{card.value}</p>
                    <p className="text-[10px] text-text-muted truncate">{card.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                  Data Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MultiLineChart data={chartData.lineChartData} />
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                    Cumulative Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChartComponent data={chartData.areaChartData} />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-pink" />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DoughnutChart data={chartData.pieData} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent-cyan" />
                    Contacts Overview
                  </CardTitle>
                  <Link href="/dashboard/contacts" className="text-xs text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contactsByStatus.map((s) => (
                    <div key={s.status} className="flex items-center gap-3">
                      <span className="text-xs text-text-secondary w-16">{s.status}</span>
                      <div className="flex-1 h-2 rounded-full bg-glass-bg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.percentage}%` }}
                          className={cn(
                            "h-full rounded-full",
                            s.status === "Active" ? "bg-accent-cyan" : s.status === "Lead" ? "bg-accent-yellow" : "bg-text-muted"
                          )}
                        />
                      </div>
                      <span className="text-xs text-text-muted w-8 text-right">{s.count}</span>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-xs text-text-muted text-center py-4">No contacts yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-accent-cyan" />
                    Recent Notes
                  </CardTitle>
                  <Link href="/dashboard/notes" className="text-xs text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentNotes.length > 0 ? recentNotes.map((note) => (
                    <div key={note.id}
                      className="p-3 rounded-lg bg-glass-bg hover:bg-glass-bg/80 transition-colors cursor-pointer border border-glass-border"
                    >
                      <h4 className="text-sm font-medium text-text-primary truncate">{note.title || "Untitled Note"}</h4>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{note.body || "No content"}</p>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-text-muted">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No notes yet</p>
                      <Link href="/dashboard/notes" className="text-xs text-accent-cyan hover:underline mt-1 inline-block">Create your first note</Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium font-[family-name:var(--font-outfit)] flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-accent-purple" />
                    Active Todos
                    {activeTodos > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-accent-purple/20 text-accent-purple rounded-full">{activeTodos}</span>
                    )}
                  </CardTitle>
                  <Link href="/dashboard/notes" className="text-xs text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {todos.filter(t => !t.completed).slice(0, 5).length > 0 ? todos.filter(t => !t.completed).slice(0, 5).map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-glass-bg transition-colors">
                      <div className="w-4 h-4 rounded-md border border-glass-border flex-shrink-0" />
                      <span className="text-sm text-text-secondary truncate">{todo.text}</span>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-text-muted">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No active todos</p>
                      <Link href="/dashboard/notes" className="text-xs text-accent-cyan hover:underline mt-1 inline-block">Add a todo</Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
