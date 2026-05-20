"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Loader2,
  FileSpreadsheet,
  FileJson,
  ChevronDown,
  X,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useData } from "@/components/providers/DataContext";
import type { DataEntry } from "@/types";

interface ReportConfig {
  dataSource: string;
  startDate: string;
  endDate: string;
  filters: {
    includeInactive: boolean;
    includePending: boolean;
    selectedCategories: string[];
  };
}

const dataSources = [
  { value: "all", label: "All Data" },
  { value: "sales", label: "Sales Records" },
  { value: "user_activity", label: "User Activity" },
  { value: "inventory", label: "Inventory" },
];

const categories = ["General", "Analytics", "Storage", "Network", "Security", "Marketing"];

export default function ReportPage() {
  const { data } = useData();
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    dataSource: "all",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    filters: {
      includeInactive: false,
      includePending: true,
      selectedCategories: [],
    },
  });

  const uniqueCategories = useMemo(() => {
    const cats = new Set(data.map((d) => d.category));
    return Array.from(cats);
  }, [data]);

  const filteredData = useMemo(() => {
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    endDate.setHours(23, 59, 59, 999);

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      const inDateRange = itemDate >= startDate && itemDate <= endDate;
      const inCategory =
        config.filters.selectedCategories.length === 0 ||
        config.filters.selectedCategories.includes(item.category);
      const includeStatus =
        (config.filters.includeInactive || item.status !== "INACTIVE") &&
        (config.filters.includePending || item.status !== "PENDING");

      return inDateRange && inCategory && includeStatus;
    });
  }, [data, config]);

  const previewData = useMemo(() => {
    return filteredData.slice(0, 10);
  }, [filteredData]);

  const handleGenerate = async () => {
    setLoading(true);
    setReportGenerated(false);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoading(false);
    setReportGenerated(true);
  };

  const handleExport = async (format: "csv" | "json") => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, format }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${config.dataSource}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetReport = () => {
    setReportGenerated(false);
    setConfig({
      dataSource: "all",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      filters: {
        includeInactive: false,
        includePending: true,
        selectedCategories: [],
      },
    });
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Report Generator
        </h1>
        <p className="text-text-secondary mt-1">
          Generate and export custom reports from your data.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-outfit)] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Data Source</label>
                <div className="relative">
                  <select
                    value={config.dataSource}
                    onChange={(e) => setConfig({ ...config, dataSource: e.target.value })}
                    className="w-full h-11 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary appearance-none pr-10"
                  >
                    {dataSources.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Date Range</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={config.startDate}
                      onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                      className="w-full h-11 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                  <span className="flex items-center text-text-muted">to</span>
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={config.endDate}
                      onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                      className="w-full h-11 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-text-secondary flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.filters.includeInactive}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        filters: { ...config.filters, includeInactive: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded border-glass-border bg-bg-secondary text-accent-cyan focus:ring-accent-cyan"
                  />
                  <span className="text-sm text-text-primary">Include Inactive</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.filters.includePending}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        filters: { ...config.filters, includePending: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded border-glass-border bg-bg-secondary text-accent-cyan focus:ring-accent-cyan"
                  />
                  <span className="text-sm text-text-primary">Include Pending</span>
                </label>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-text-secondary">Categories</span>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        const selected = config.filters.selectedCategories.includes(cat)
                          ? config.filters.selectedCategories.filter((c) => c !== cat)
                          : [...config.filters.selectedCategories, cat];
                        setConfig({
                          ...config,
                          filters: { ...config.filters, selectedCategories: selected },
                        });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all",
                        config.filters.selectedCategories.includes(cat)
                          ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                          : "bg-glass-bg text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleGenerate} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Generate Report</span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </Button>
              {reportGenerated && (
                <>
                  <Button variant="outline" onClick={() => handleExport("csv")} disabled={loading} className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleExport("json")} disabled={loading} className="gap-2">
                    <FileJson className="w-4 h-4" />
                    <span className="hidden sm:inline">Export JSON</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-outfit)]">Report Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-glass-bg">
              <p className="text-sm text-text-muted">Total Records</p>
              <p className="text-2xl font-bold text-text-primary">{filteredData.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-glass-bg">
              <p className="text-sm text-text-muted">Preview Rows</p>
              <p className="text-2xl font-bold text-text-primary">{previewData.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-glass-bg">
              <p className="text-sm text-text-muted">Active Records</p>
              <p className="text-2xl font-bold text-accent-cyan">
                {filteredData.filter((d) => d.status === "ACTIVE").length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-glass-bg">
              <p className="text-sm text-text-muted">Total Value</p>
              <p className="text-2xl font-bold text-accent-purple">
                ${filteredData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {reportGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-[family-name:var(--font-outfit)]">
                  Preview (First 10 Rows)
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={resetReport}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border">
                        <th className="text-left p-3 text-text-muted font-medium">Title</th>
                        <th className="text-left p-3 text-text-muted font-medium">Category</th>
                        <th className="text-left p-3 text-text-muted font-medium">Status</th>
                        <th className="text-left p-3 text-text-muted font-medium">Value</th>
                        <th className="text-left p-3 text-text-muted font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item) => (
                        <tr key={item.id} className="border-b border-glass-border hover:bg-glass-bg">
                          <td className="p-3 text-text-primary">{item.title}</td>
                          <td className="p-3 text-text-secondary">{item.category}</td>
                          <td className="p-3">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                item.status === "ACTIVE" && "bg-accent-cyan/20 text-accent-cyan",
                                item.status === "INACTIVE" && "bg-red-500/20 text-red-400",
                                item.status === "PENDING" && "bg-yellow-500/20 text-yellow-400"
                              )}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-text-primary">${item.value.toLocaleString()}</td>
                          <td className="p-3 text-text-muted">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}