"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import DataTable from "@/components/dashboard/DataTable";
import DataExport from "@/components/dashboard/DataExport";
import { useData } from "@/components/providers/DataContext";
import type { DataEntry, DataEntryFormData, DatabaseStatus } from "@/types";

export default function DataManagementPage() {
  const { data, addData, updateData, deleteData, deleteMultiple } = useData();
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  
  useEffect(() => {
    setLastSyncTime(new Date().toLocaleTimeString());
  }, []);
  
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

  const handleUpdate = (id: string, formData: DataEntryFormData) => {
    updateData(id, formData);
  };

  const handleDelete = (id: string) => {
    deleteData(id);
  };

  const handleDeleteMultiple = (ids: string[]) => {
    deleteMultiple(ids);
  };

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
          <DataExport data={data} />
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={data}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteMultiple}
        />
      </motion.div>
    </div>
  );
}