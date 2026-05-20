"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/modal";
import type { DataEntry } from "@/types";

interface DataExportProps {
  data: DataEntry[];
}

export default function DataExport({ data }: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportToJSON = () => {
    setIsExporting(true);
    const jsonData = data.map(item => ({
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      value: item.value,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      setIsOpen(false);
    }, 1000);
  };

  const exportToCSV = () => {
    setIsExporting(true);
    const headers = ["Title", "Description", "Category", "Status", "Value", "Created At", "Updated At"];
    const rows = data.map(item => [
      `"${(item.title || "").replace(/"/g, '""')}"`,
      `"${(item.description || "").replace(/"/g, '""')}"`,
      item.category || "",
      item.status || "",
      item.value?.toString() || "0",
      item.createdAt ? new Date(item.createdAt).toISOString() : "",
      item.updatedAt ? new Date(item.updatedAt).toISOString() : "",
    ]);

    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-data-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      setIsOpen(false);
    }, 1000);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2">
        <Download className="w-4 h-4" />
        Export
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-outfit)]">
              Export Data
            </DialogTitle>
            <DialogDescription>
              Choose your preferred export format. {data.length} records will be exported.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={exportToJSON}
              disabled={isExporting}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-glass-border bg-bg-secondary hover:border-accent-cyan/50 hover:bg-glass-bg transition-all disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                <FileJson className="w-6 h-6 text-accent-purple" />
              </div>
              <div className="text-center">
                <p className="font-medium text-text-primary">JSON</p>
                <p className="text-xs text-text-muted">Structured data</p>
              </div>
            </button>

            <button
              onClick={exportToCSV}
              disabled={isExporting}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-glass-border bg-bg-secondary hover:border-accent-cyan/50 hover:bg-glass-bg transition-all disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-accent-cyan" />
              </div>
              <div className="text-center">
                <p className="font-medium text-text-primary">CSV</p>
                <p className="text-xs text-text-muted">Spreadsheet compatible</p>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}