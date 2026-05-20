"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import DataImport from "@/components/dashboard/DataImport";
import { useData } from "@/components/providers/DataContext";
import type { DataEntry } from "@/types";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  FileText,
  Database,
  TrendingUp,
} from "lucide-react";

interface ImportRecord {
  id: string;
  fileName: string;
  fileType: "csv" | "xlsx";
  importedAt: Date;
  recordCount: number;
}

const IMPORT_HISTORY_KEY = "nexus-import-history";

export default function ImportPage() {
  const { data } = useData();
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);

  const handleImport = (importedData: Partial<DataEntry>[], fileName?: string, fileType?: "csv" | "xlsx") => {
    const newEntries: DataEntry[] = importedData.map((item, index) => ({
      id: Date.now().toString() + index,
      title: item.title || "Untitled",
      description: item.description || null,
      category: item.category || "General",
      status: (item.status as any) || "ACTIVE",
      value: item.value || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (fileName) {
      const record: ImportRecord = {
        id: Date.now().toString(),
        fileName,
        fileType: fileType || "csv",
        importedAt: new Date(),
        recordCount: importedData.length,
      };
      const updatedHistory = [record, ...importHistory].slice(0, 10);
      setImportHistory(updatedHistory);
      localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(updatedHistory));
    }
  };

  const stats = useMemo(() => {
    return {
      totalRecords: data.length,
      totalValue: data.reduce((sum, d) => sum + d.value, 0),
      categories: [...new Set(data.map(d => d.category))].length,
    };
  }, [data]);

  const recentImports = data.slice(0, 10);

  return (
    <div className="space-y-8">
      <DataImport 
        onImport={(importedData) => handleImport(importedData)} 
      />

      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          <div className="rounded-xl border border-glass-border bg-card-bg">
            <div className="p-4 border-b border-glass-border">
              <h3 className="font-medium text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-cyan" />
                Imported Data Preview
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left p-3 text-text-muted font-medium">Title</th>
                    <th className="text-left p-3 text-text-muted font-medium">Category</th>
                    <th className="text-left p-3 text-text-muted font-medium">Status</th>
                    <th className="text-left p-3 text-text-muted font-medium">Value</th>
                    <th className="text-left p-3 text-text-muted font-medium">Imported</th>
                  </tr>
                </thead>
                <tbody>
                  {recentImports.map((item) => (
                    <tr key={item.id} className="border-b border-glass-border hover:bg-glass-bg">
                      <td className="p-3 text-text-primary font-medium">{item.title}</td>
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
            {data.length > 10 && (
              <div className="p-4 text-center text-sm text-text-muted border-t border-glass-border">
                Showing 10 of {data.length} records. View all in Data Management.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}