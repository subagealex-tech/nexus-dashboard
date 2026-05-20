"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Database,
  TrendingUp,
  Zap,
  Users,
  StickyNote,
  CheckSquare,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  KPICard,
  MultiLineChart,
  AreaChartComponent,
  DoughnutChart,
} from "@/components/dashboard/AnalyticsCharts";
import { useData } from "@/components/providers/DataContext";
import { useNotes } from "@/components/providers/NotesContext";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data } = useData();
  const { notes, todos } = useNotes();

  const kpiData = useMemo(() => {
    const totalEntries = data.length;
    const activeCount = data.filter(d => d.status === "ACTIVE").length;
    const avgValue = data.length > 0 
      ? data.reduce((sum, d) => sum + d.value, 0) / data.length 
      : 0;
    
    const categoryCount = [...new Set(data.map(d => d.category))].length;
    
    return {
      totalEntries,
      activePercentage: totalEntries > 0 ? Math.round((activeCount / totalEntries) * 100) : 0,
      avgValue: Math.round(avgValue),
      categoryCount,
    };
  }, [data]);

  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    
    const lineChartData = monthNames.map((name, i) => {
      const baseValue = 300 + (i * 50);
      return {
        name,
        value: baseValue + 100,
        value2: baseValue,
        value3: baseValue + 300,
      };
    });

    const areaChartData = monthNames.map((name, i) => {
      return { name, value: (i + 1) * 800 };
    });

    const categoryData = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ["#00f5d4", "#9b5de5", "#f15bb5", "#fee440", "#6b6b7b"];
    const categories = Object.keys(categoryData);
    const pieData = categories.slice(0, 5).map((cat, i) => ({
      name: cat,
      value: categoryData[cat],
      color: colors[i % colors.length],
    }));

    return { lineChartData, areaChartData, pieData };
  }, [data]);

  const sparklineData = useMemo(() => {
    return [45, 52, 38, 65, 58, 72, 68];
  }, []);

  const activeTodos = todos.filter(t => !t.completed).length;
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Dashboard
        </h1>
        <p className="text-text-secondary mt-1">
          Welcome back! Here&apos;s an overview of your data.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <KPICard
            title="Total Entries"
            value={kpiData.totalEntries}
            change={kpiData.totalEntries > 10 ? 12.5 : 0}
            icon={Database}
            sparklineData={sparklineData}
            color="#00f5d4"
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title="Active Rate"
            value={`${kpiData.activePercentage}%`}
            change={kpiData.activePercentage > 50 ? 8.2 : -3.1}
            icon={TrendingUp}
            sparklineData={sparklineData.map(v => v + 10)}
            color="#9b5de5"
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title="Avg Value"
            value={kpiData.avgValue.toLocaleString()}
            change={5.4}
            icon={Zap}
            sparklineData={sparklineData.map(v => v - 10)}
            color="#f15bb5"
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            title="Categories"
            value={kpiData.categoryCount}
            change={15.3}
            icon={Users}
            sparklineData={sparklineData}
            color="#fee440"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <MultiLineChart data={chartData.lineChartData} />
            <AreaChartComponent data={chartData.areaChartData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <MultiLineChart data={chartData.lineChartData} />
            </div>
            <DoughnutChart data={chartData.pieData} />
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="p-4 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-accent-cyan" />
                  <h3 className="font-medium text-text-primary">Recent Notes</h3>
                </div>
                <Link
                  href="/dashboard/notes"
                  className="text-sm text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-glass-bg hover:bg-glass-bg/80 transition-colors cursor-pointer"
                    >
                      <h4 className="text-sm font-medium text-text-primary truncate">
                        {note.title || "Untitled Note"}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {note.body || "No content"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-text-muted">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes yet</p>
                    <Link
                      href="/dashboard/notes"
                      className="text-xs text-accent-cyan hover:underline mt-1 inline-block"
                    >
                      Create your first note
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <div className="p-4 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-accent-purple" />
                  <h3 className="font-medium text-text-primary">Active Todos</h3>
                  {activeTodos > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-accent-purple/20 text-accent-purple rounded-full">
                      {activeTodos}
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard/notes"
                  className="text-sm text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-4 space-y-2">
                {todos.filter(t => !t.completed).slice(0, 5).length > 0 ? (
                  todos
                    .filter(t => !t.completed)
                    .slice(0, 5)
                    .map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-glass-bg transition-colors"
                      >
                        <div className="w-4 h-4 rounded border border-glass-border" />
                        <span className="text-sm text-text-secondary truncate">
                          {todo.text}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-text-muted">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active todos</p>
                    <Link
                      href="/dashboard/notes"
                      className="text-xs text-accent-cyan hover:underline mt-1 inline-block"
                    >
                      Add a todo
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-glass-border bg-card-bg", className)}>
      {children}
    </div>
  );
}