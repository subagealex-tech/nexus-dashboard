"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, Upload, FileSpreadsheet, FileText, Database, TrendingUp } from "lucide-react";
import DataTable from "@/components/dashboard/DataTable";
import DistributionTable from "@/components/dashboard/DistributionTable";
import DataExport from "@/components/dashboard/DataExport";
import DataImport from "@/components/dashboard/DataImport";
import { Button } from "@/components/ui/button";
import { useData } from "@/components/providers/DataContext";
import type { DataEntry, DataEntryFormData, DatabaseStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function DataManagementPage() {
  const { data, addData, updateData, deleteData, deleteMultiple, refreshData } = useData();
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [tableView, setTableView] = useState<"distribution" | "general">("distribution");
  const [showImport, setShowImport] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    setLastSyncTime(new Date().toLocaleTimeString());
    loadFromDatabase();
  }, []);

  const loadFromDatabase = async () => {
    try {
      const res = await fetch("/api/data/import");
      if (!res.ok) return;
      const dbEntries: any[] = await res.json();
      if (dbEntries.length === 0) return;

      const converted: DataEntry[] = dbEntries.map((e) => ({
        id: e.id,
        title: `${e.subCity || "Unknown"} - ${e.woreda || "Unknown"}`,
        description: `Serial: ${e.serialNumber}, Customers: ${e.numberOfCustomers}, Communities: ${e.communitiesReceived}, Institution Customers: ${e.institutionCustomers}, Nursing Mothers: ${e.nursingMothersQuintals}, Community: ${e.communityQuintals}, Institution: ${e.institutionQuintals}, Total: ${e.totalQuintals} Quintals, Month: ${new Date(e.createdAt).getMonth()}`,
        category: "Distribution",
        status: "ACTIVE" as const,
        value: e.totalQuintals,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      }));
      addData(converted);
    } catch (err) {
      console.error("Failed to load from database:", err);
    }
  };
  
  const [dbStatus] = useState<DatabaseStatus>({
    status: "connected",
    lastSync: new Date(),
  });

  const handleCreate = (formData: DataEntryFormData) => {
    const newEntry: DataEntry = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addData([newEntry]);
  };

  const handleUpdate = (id: string, data: Partial<DataEntry>) => {
    updateData(id, data);
  };

  const handleDelete = (id: string) => {
    deleteData(id);
  };

  const handleDeleteMultiple = (ids: string[]) => {
    deleteMultiple(ids);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFromDatabase();
    refreshData();
    setLastSyncTime(new Date().toLocaleTimeString());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleImport = async (importedData: Partial<DataEntry>[], fileName?: string, fileType?: "csv" | "xlsx") => {
    const newEntries: DataEntry[] = importedData.map((item, index) => ({
      id: Date.now().toString() + index,
      title: item.title || "Untitled",
      description: item.description || null,
      category: item.category || "Distribution",
      status: (item.status as any) || "ACTIVE",
      value: item.value || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    addData(newEntries);

    try {
      const parsed = importedData.map((item, index) => {
        const desc = item.description || "";
        const getField = (label: string) => {
          const m = desc.match(new RegExp(`${label}:\\s*([\\d.]+)`));
          return m ? parseFloat(m[1]) : 0;
        };
        return {
          serialNumber: index + 1,
          subCity: item.title?.split(" - ")[0] || "",
          woreda: item.title?.split(" - ")[1] || "",
          numberOfCustomers: getField("Customers"),
          communitiesReceived: getField("Communities"),
          institutionCustomers: getField("Institution Customers"),
          nursingMothersQuintals: getField("Nursing Mothers"),
          communityQuintals: getField("Community"),
          institutionQuintals: getField("Institution"),
          totalQuintals: getField("Total"),
        };
      });

      const res = await fetch("/api/data/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: parsed, fileName }),
      });

      if (!res.ok) {
        console.error("Failed to save to database:", await res.text());
      }
    } catch (err) {
      console.error("Error saving to database:", err);
    }
  };

  const distributionData = useMemo(() => {
    return data.filter(d => d.category === "Distribution");
  }, [data]);

  const stats = useMemo(() => {
    return {
      totalRecords: distributionData.length,
      totalValue: distributionData.reduce((sum, d) => sum + d.value, 0),
      totalCustomers: distributionData.reduce((sum, d) => {
        const match = d.description?.match(/Customers:\s*(\d+)/);
        return sum + (match ? parseInt(match[1]) : 0);
      }, 0),
      categories: [...new Set(distributionData.map(d => d.category))].length,
    };
  }, [distributionData]);

  const getStatusIcon = () => {
    switch (dbStatus.status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-accent-cyan" />;
      case "syncing":
        return <RefreshCw className="w-4 h-4 text-accent-yellow animate-spin" />;
      case "offline":
        return <WifiOff className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (dbStatus.status) {
      case "connected":
        return "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30";
      case "syncing":
        return "bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30";
      case "offline":
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
            Data Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your data records with full CRUD operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={showImport ? "default" : "outline"}
            onClick={() => setShowImport(!showImport)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {showImport ? "Hide Import" : "Import Data"}
          </Button>
          <DataExport data={data} />
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span className="text-sm font-medium capitalize">
              {dbStatus.status}
            </span>
            {dbStatus.lastSync && lastSyncTime && (
              <span className="text-xs text-text-muted ml-2">
                Last sync: {lastSyncTime}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {showImport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataImport onImport={handleImport} />
        </motion.div>
      )}

      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="rounded-xl border border-glass-border bg-card-bg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-accent-cyan" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Records</p>
                <p className="text-xl font-bold text-text-primary">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-glass-border bg-card-bg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Value</p>
                <p className="text-xl font-bold text-text-primary">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-glass-border bg-card-bg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-pink/10 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-accent-pink" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Categories</p>
                <p className="text-xl font-bold text-text-primary">{stats.categories}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setTableView("distribution")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tableView === "distribution"
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                : "bg-glass-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            Distribution Table
          </button>
          <button
            onClick={() => setTableView("general")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tableView === "general"
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                : "bg-glass-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            General Table
          </button>
        </div>
        
        {tableView === "distribution" ? (
          <DistributionTable
            data={data}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ) : (
          <DataTable
            data={data}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
          />
        )}
      </motion.div>
    </div>
  );
}