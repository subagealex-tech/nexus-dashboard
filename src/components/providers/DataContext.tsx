"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { DataEntry } from "@/types";

interface DataContextType {
  data: DataEntry[];
  addData: (entries: DataEntry[]) => void;
  updateData: (id: string, entry: Partial<DataEntry>) => void;
  deleteData: (id: string) => void;
  deleteMultiple: (ids: string[]) => void;
  refreshData: () => void;
}

const defaultData: DataEntry[] = [
  {
    id: "1",
    title: "Q4 Sales Report",
    description: "Quarterly sales performance analysis",
    category: "Analytics",
    status: "ACTIVE",
    value: 12500,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Customer Database",
    description: "Primary customer records backup",
    category: "Storage",
    status: "ACTIVE",
    value: 45000,
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    title: "Network Logs",
    description: "System network activity logs",
    category: "Network",
    status: "PENDING",
    value: 8200,
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    title: "Security Audit",
    description: "Annual security assessment results",
    category: "Security",
    status: "ACTIVE",
    value: 3200,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    title: "Marketing Campaign",
    description: "Q1 marketing initiative data",
    category: "Analytics",
    status: "INACTIVE",
    value: 15000,
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },
  {
    id: "6",
    title: "User Activity Logs",
    description: "Daily user interaction metrics",
    category: "Network",
    status: "ACTIVE",
    value: 28000,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "7",
    title: "Product Inventory",
    description: "Current stock levels and updates",
    category: "Storage",
    status: "ACTIVE",
    value: 5600,
    createdAt: new Date("2024-01-09"),
    updatedAt: new Date("2024-01-09"),
  },
  {
    id: "8",
    title: "API Performance",
    description: "Backend API response metrics",
    category: "Network",
    status: "ACTIVE",
    value: 9100,
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nexus-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })));
      } catch {
        setData(defaultData);
      }
    } else {
      setData(defaultData);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nexus-data", JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const addData = (entries: DataEntry[]) => {
    setData(prev => [...entries, ...prev]);
  };

  const updateData = (id: string, entry: Partial<DataEntry>) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, ...entry, updatedAt: new Date() } : item
    ));
  };

  const deleteData = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  const deleteMultiple = (ids: string[]) => {
    setData(prev => prev.filter(item => !ids.includes(item.id)));
  };

  const refreshData = () => {
    const stored = localStorage.getItem("nexus-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })));
      } catch {
        setData(defaultData);
      }
    }
  };

  return (
    <DataContext.Provider value={{ data, addData, updateData, deleteData, deleteMultiple, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}