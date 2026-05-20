"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  X,
  Building2,
  Users,
  Package,
  FileText,
  Eye,
  Columns,
  CheckSquare,
  XCircle,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { DataEntry } from "@/types";

const months = [
  "ጥር", "ፈጋ", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ",
  "ነሐሴ", "መስከረም", "ጥቅምት", "ሕዳር", "ታህሳስ", "ጥሪ"
];

interface DistributionData {
  id: string;
  serialNumber: number;
  subCity: string;
  woreda: string;
  numberOfCustomers: number;
  communitiesReceived: number;
  institutionCustomers: number;
  nursingMothersQuintals: number;
  communityQuintals: number;
  institutionQuintals: number;
  totalQuintals: number;
  month: number;
  createdAt: Date;
}

interface DistributionTableProps {
  data: DataEntry[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<DataEntry>) => void;
}

export default function DistributionTable({ data, onDelete, onUpdate }: DistributionTableProps) {
  const [sortKey, setSortKey] = useState<string>("subCity");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "distribution">("distribution");
  const [editItem, setEditItem] = useState<DistributionData | null>(null);
  const [viewItem, setViewItem] = useState<DistributionData | null>(null);
  const [showColumns, setShowColumns] = useState<Record<string, boolean>>({
    serialNumber: true,
    subCity: true,
    woreda: true,
    numberOfCustomers: true,
    communitiesReceived: true,
    institutionCustomers: true,
    nursingMothersQuintals: true,
    communityQuintals: true,
    institutionQuintals: true,
    totalQuintals: true,
    month: true,
    createdAt: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkMonthEdit, setShowBulkMonthEdit] = useState(false);
  const [filters, setFilters] = useState({
    month: "" as string,
    subCity: "" as string,
    woreda: "" as string,
  });
  const [bulkMonth, setBulkMonth] = useState<number>(0);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const distributionData = useMemo((): DistributionData[] => {
    return data
      .filter(d => viewMode === "distribution" ? d.category === "Distribution" : true)
      .map((d, index) => {
        const parts = d.title?.split(" - ") || [];
        const desc = d.description || "";
        const serialMatch = desc.match(/Serial:\s*(\d+)/);
        const customersMatch = desc.match(/Customers:\s*(\d+)/);
        const communitiesMatch = desc.match(/Communities:\s*(\d+)/);
        const institutionCustomersMatch = desc.match(/Institution Customers:\s*(\d+)/);
        const nursingMothersMatch = desc.match(/Nursing Mothers:\s*([\d.]+)/);
        const communityQuintalsMatch = desc.match(/Community:\s*([\d.]+)/);
        const institutionQuintalsMatch = desc.match(/Institution:\s*([\d.]+)/);
        const monthMatch = desc.match(/Month:\s*(\d+)/);
        
        const subCityValue = parts[0]?.trim() || d.title?.trim() || "";
          const woredaValue = parts[1]?.trim() || "";
          
          return {
            id: d.id,
            serialNumber: serialMatch ? parseInt(serialMatch[1]) : index + 1,
            subCity: subCityValue || "N/A",
            woreda: woredaValue || "N/A",
            numberOfCustomers: customersMatch ? parseInt(customersMatch[1]) : 0,
          communitiesReceived: communitiesMatch ? parseInt(communitiesMatch[1]) : 0,
          institutionCustomers: institutionCustomersMatch ? parseInt(institutionCustomersMatch[1]) : 0,
          nursingMothersQuintals: nursingMothersMatch ? parseFloat(nursingMothersMatch[1]) : 0,
          communityQuintals: communityQuintalsMatch ? parseFloat(communityQuintalsMatch[1]) : 0,
          institutionQuintals: institutionQuintalsMatch ? parseFloat(institutionQuintalsMatch[1]) : 0,
          totalQuintals: d.value || 0,
          month: monthMatch ? parseInt(monthMatch[1]) : new Date(d.createdAt).getMonth(),
          createdAt: d.createdAt,
        };
      });
  }, [data, viewMode]);

  const filteredData = useMemo(() => {
    return distributionData.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        item.subCity.toLowerCase().includes(searchLower) ||
        item.woreda.toLowerCase().includes(searchLower);
      
      const matchesMonth = filters.month === "" || item.month === parseInt(filters.month);
      const matchesSubCity = filters.subCity === "" || item.subCity.toLowerCase().includes(filters.subCity.toLowerCase());
      const matchesWoreda = filters.woreda === "" || item.woreda.toLowerCase().includes(filters.woreda.toLowerCase());
      
      return matchesSearch && matchesMonth && matchesSubCity && matchesWoreda;
    });
  }, [distributionData, searchQuery, filters]);

  const uniqueSubCities = useMemo(() => 
    [...new Set(distributionData.map(d => d.subCity).filter(s => s))].sort(), 
  [distributionData]);

  const uniqueWoredas = useMemo(() => 
    [...new Set(distributionData.map(d => d.woreda).filter(w => w))].sort(), 
  [distributionData]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof DistributionData];
      const bVal = b[sortKey as keyof DistributionData];
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === -1) return sortedData;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(d => d.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedRows.size > 0 && onDelete) {
      selectedRows.forEach(id => onDelete(id));
      setSelectedRows(new Set());
    }
  };

  const handleBulkMonthUpdate = () => {
    if (selectedRows.size > 0 && onUpdate) {
      const selectedItems = distributionData.filter(item => selectedRows.has(item.id));
      selectedItems.forEach(item => {
        const monthLabel = months[bulkMonth];
        onUpdate(item.id, {
          title: `${item.subCity} - ${item.woreda}`,
          description: `Serial: ${item.serialNumber}, Customers: ${item.numberOfCustomers}, Communities: ${item.communitiesReceived}, Institution Customers: ${item.institutionCustomers}, Nursing Mothers: ${item.nursingMothersQuintals}, Community: ${item.communityQuintals}, Institution: ${item.institutionQuintals}, Total: ${item.totalQuintals} Quintals, Month: ${bulkMonth}`,
          value: item.totalQuintals,
        });
      });
      setSelectedRows(new Set());
      setShowBulkMonthEdit(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleSelectAllCurrent = () => {
    const currentIds = paginatedData.map(d => d.id);
    if (selectedRows.size === currentIds.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentIds));
    }
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setDeleteConfirmId(null);
  };

  const handleEditSave = () => {
    if (editItem) {
      onUpdate?.(editItem.id, {
        title: `${editItem.subCity} - ${editItem.woreda}`,
        description: `Serial: ${editItem.serialNumber}, Customers: ${editItem.numberOfCustomers}, Communities: ${editItem.communitiesReceived}, Institution Customers: ${editItem.institutionCustomers}, Nursing Mothers: ${editItem.nursingMothersQuintals}, Community: ${editItem.communityQuintals}, Institution: ${editItem.institutionQuintals}, Total: ${editItem.totalQuintals} Quintals, Month: ${editItem.month}`,
        value: editItem.totalQuintals,
      });
      setEditItem(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const stats = useMemo(() => {
    const dataToUse = (filters.month || filters.subCity || filters.woreda) ? filteredData : distributionData;
    return {
      totalRecords: dataToUse.length,
      totalCustomers: dataToUse.reduce((sum, d) => sum + d.numberOfCustomers, 0),
      totalQuintals: dataToUse.reduce((sum, d) => sum + d.totalQuintals, 0),
      subCities: new Set(dataToUse.map(d => d.subCity)).size,
    };
  }, [distributionData, filteredData, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("distribution")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "distribution"
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                : "bg-glass-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Distribution Data
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "all"
                ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                : "bg-glass-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            All Data
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
            {(filters.month || filters.subCity || filters.woreda) && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-accent-cyan rounded-full">
                {(filters.month ? 1 : 0) + (filters.subCity ? 1 : 0) + (filters.woreda ? 1 : 0)}
              </span>
            )}
          </Button>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-10 rounded-lg border border-glass-border bg-bg-secondary px-3 text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={-1}>All</option>
          </select>
          <div className="relative" ref={columnMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="gap-2"
            >
              <Columns className="w-4 h-4" />
              Columns
            </Button>
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-bg-secondary border border-glass-border rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-glass-border flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary">Toggle Columns</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowColumns({
                        serialNumber: true, subCity: true, woreda: true,
                        numberOfCustomers: true, communitiesReceived: true,
                        institutionCustomers: true, nursingMothersQuintals: true,
                        communityQuintals: true, institutionQuintals: true,
                        totalQuintals: true, month: true, createdAt: true
                      })}
                      className="text-xs text-accent-cyan hover:underline"
                    >
                      Show All
                    </button>
                    <span className="text-text-muted">|</span>
                    <button
                      onClick={() => setShowColumns({
                        serialNumber: true, subCity: true, woreda: true,
                        numberOfCustomers: true, communitiesReceived: true,
                        institutionCustomers: false, nursingMothersQuintals: false,
                        communityQuintals: false, institutionQuintals: false,
                        totalQuintals: true, month: true, createdAt: true
                      })}
                      className="text-xs text-text-muted hover:underline"
                    >
                      Common
                    </button>
                  </div>
                </div>
                <div className="p-2 max-h-80 overflow-y-auto">
                  {Object.entries(showColumns).map(([key, visible]) => {
                    const labels: Record<string, string> = {
                      serialNumber: "ተ.ቁ (Serial)",
                      subCity: "Sub-City (ክፍለ ከተማ)",
                      woreda: "Woreda (ወረዳ)",
                      numberOfCustomers: "ደንበኛ (Customers)",
                      communitiesReceived: "ማህበር (Communities)",
                      institutionCustomers: "ተቅዋም (Institution)",
                      nursingMothersQuintals: "እናት (Nursing Mothers)",
                      communityQuintals: "ማህበር ኪሎ",
                      institutionQuintals: "ተቅዋም ኪሎ",
                      totalQuintals: "ጠቅላላ (Total)",
                      month: "የተሰራበት ወር (Month)",
                      createdAt: "Date"
                    };
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-3 p-2 rounded hover:bg-glass-bg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visible}
                          onChange={() => setShowColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="w-4 h-4 rounded border-glass-border"
                        />
                        <span className="text-sm text-text-secondary">
                          {labels[key] || key}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-glass-bg border border-glass-border"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-muted">ወር (Month):</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="h-9 rounded-lg border border-glass-border bg-bg-secondary px-3 text-sm"
              >
                <option value="">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-text-muted">Sub-City:</label>
              <select
                value={filters.subCity}
                onChange={(e) => setFilters(prev => ({ ...prev, subCity: e.target.value }))}
                className="h-9 rounded-lg border border-glass-border bg-bg-secondary px-3 text-sm min-w-[150px]"
              >
                <option value="">All Sub-Cities</option>
                {uniqueSubCities.map(subCity => (
                  <option key={subCity} value={subCity}>{subCity}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-text-muted">Woreda:</label>
              <select
                value={filters.woreda}
                onChange={(e) => setFilters(prev => ({ ...prev, woreda: e.target.value }))}
                className="h-9 rounded-lg border border-glass-border bg-bg-secondary px-3 text-sm min-w-[150px]"
              >
                <option value="">All Woredas</option>
                {uniqueWoredas.map(woreda => (
                  <option key={woreda} value={woreda}>{woreda}</option>
                ))}
              </select>
            </div>

            {(filters.month || filters.subCity || filters.woreda) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ month: "", subCity: "", woreda: "" })}
                className="text-text-muted hover:text-accent-cyan"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {(filters.month || filters.subCity || filters.woreda) && (
            <div className="mt-3 text-sm text-text-muted">
              Showing {filteredData.length} of {distributionData.length} records
              {filters.month && <span className="ml-2">• Month: {months[parseInt(filters.month)]}</span>}
              {filters.subCity && <span className="ml-2">• Sub-City: {filters.subCity}</span>}
              {filters.woreda && <span className="ml-2">• Woreda: {filters.woreda}</span>}
            </div>
          )}
        </motion.div>
      )}

      {viewMode === "distribution" && (
        <>
        <div className="flex items-center justify-between mb-4">
          {(filters.month || filters.subCity || filters.woreda) ? (
            <div className="flex items-center gap-2 text-accent-cyan">
              <Filter className="w-4 h-4" />
              <span className="text-sm">
                Filtered: <strong>{filteredData.length}</strong> of {distributionData.length} records
              </span>
            </div>
          ) : (
            <span className="text-sm text-text-muted">{filteredData.length} total records</span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
            <div className="flex items-center gap-2 text-accent-cyan mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Total Records</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalRecords}</p>
            {(filters.month || filters.subCity || filters.woreda) && (
              <p className="text-xs text-text-muted mt-1">filtered</p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-accent-purple/10 border border-accent-purple/30">
            <div className="flex items-center gap-2 text-accent-purple mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Sub-Cities</span>
            </div>
            <p className="text-2xl font-bold">{stats.subCities}</p>
          </div>
          <div className="p-4 rounded-lg bg-accent-yellow/10 border border-accent-yellow/30">
            <div className="flex items-center gap-2 text-accent-yellow mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Total Customers</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
            {(filters.month || filters.subCity || filters.woreda) && (
              <p className="text-xs text-text-muted mt-1">filtered</p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-sm">Total Quintals</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalQuintals.toLocaleString()}</p>
            {(filters.month || filters.subCity || filters.woreda) && (
              <p className="text-xs text-text-muted mt-1">filtered</p>
            )}
          </div>
        </div>
        </>
      )}

      {selectedRows.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-lg bg-accent-yellow/10 border border-accent-yellow/30 mb-4"
        >
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-accent-yellow" />
            <span className="text-text-primary font-medium">
              {selectedRows.size} item{selectedRows.size > 1 ? "s" : ""} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-text-muted hover:text-text-primary ml-2"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllCurrent}
              className="gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkMonthEdit(true)}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Edit ወር
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </motion.div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border bg-glass-bg">
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-glass-border"
                    />
                  </th>
                  {showColumns.serialNumber && (
                  <th 
                    className="p-3 text-center text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("serialNumber")}
                  >
                    <div className="flex items-center gap-1">
                      ተ.ቁ
                      {getSortIcon("serialNumber")}
                    </div>
                  </th>
                  )}
                  {showColumns.subCity && (
                  <th 
                    className="p-3 text-left text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("subCity")}
                  >
                    <div className="flex items-center gap-1">
                      Sub-City (ክፍለ ከተማ)
                      {getSortIcon("subCity")}
                    </div>
                  </th>
                  )}
                  {showColumns.woreda && (
                  <th 
                    className="p-3 text-left text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("woreda")}
                  >
                    <div className="flex items-center gap-1">
                      Woreda (ወረዳ)
                      {getSortIcon("woreda")}
                    </div>
                  </th>
                  )}
                  {showColumns.numberOfCustomers && (
                  <th 
                    className="p-3 text-right text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("numberOfCustomers")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      ደንበኛ
                      {getSortIcon("numberOfCustomers")}
                    </div>
                  </th>
                  )}
                  {showColumns.communitiesReceived && (
                  <th 
                    className="p-3 text-right text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("communitiesReceived")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      ማህበር
                      {getSortIcon("communitiesReceived")}
                    </div>
                  </th>
                  )}
                  {showColumns.institutionCustomers && (
                  <th 
                    className="p-3 text-right text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("institutionCustomers")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      ተቅዋም
                      {getSortIcon("institutionCustomers")}
                    </div>
                  </th>
                  )}
                  {showColumns.nursingMothersQuintals && (
                  <th 
                    className="p-3 text-right text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("nursingMothersQuintals")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      እናት
                      {getSortIcon("nursingMothersQuintals")}
                    </div>
                  </th>
                  )}
                  {showColumns.communityQuintals && (
                  <th 
                    className="p-3 text-right text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("communityQuintals")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      ማህበር ኪሎ
                      {getSortIcon("communityQuintals")}
                    </div>
                  </th>
                  )}
                  {showColumns.institutionQuintals && (
                  <th 
                    className="p-3 text-right text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("institutionQuintals")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      ተቅዋም ኪሎ
                      {getSortIcon("institutionQuintals")}
                    </div>
                  </th>
                  )}
                  {showColumns.totalQuintals && (
                  <th 
                    className="p-3 text-right text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("totalQuintals")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      ጠቅላላ
                      {getSortIcon("totalQuintals")}
                    </div>
                  </th>
                  )}
                  {showColumns.month && (
                  <th 
                    className="p-3 text-left text-text-muted font-medium cursor-pointer hover:text-text-primary"
                    onClick={() => handleSort("month")}
                  >
                    <div className="flex items-center gap-1">
                      የተሰራበት ወር
                      {getSortIcon("month")}
                    </div>
                  </th>
                  )}
                  {showColumns.createdAt && (
                  <th className="p-3 text-left text-text-muted font-medium">
                    Date
                  </th>
                  )}
                  <th className="p-3 text-right text-text-muted font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="p-8 text-center text-text-muted">
                      No data available. Import data from the Import page.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-glass-border hover:bg-glass-bg"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 rounded border-glass-border"
                        />
                      </td>
                      {showColumns.serialNumber && (
                      <td className="p-3 text-center">
                        <span className="text-text-muted text-sm">{item.serialNumber}</span>
                      </td>
                      )}
                      {showColumns.subCity && (
                      <td className="p-3">
                        <span className="font-medium text-text-primary">{item.subCity}</span>
                      </td>
                      )}
                      {showColumns.woreda && (
                      <td className="p-3">
                        <span className="text-text-secondary">{item.woreda}</span>
                      </td>
                      )}
                      {showColumns.numberOfCustomers && (
                      <td className="p-3 text-right">
                        <span className="text-text-primary font-medium">{item.numberOfCustomers.toLocaleString()}</span>
                      </td>
                      )}
                      {showColumns.communitiesReceived && (
                      <td className="p-3 text-right">
                        <span className="text-text-secondary">{item.communitiesReceived.toLocaleString()}</span>
                      </td>
                      )}
                      {showColumns.institutionCustomers && (
                      <td className="p-3 text-right">
                        <span className="text-accent-purple">{item.institutionCustomers.toLocaleString()}</span>
                      </td>
                      )}
                      {showColumns.nursingMothersQuintals && (
                      <td className="p-3 text-right">
                        <span className="text-accent-pink">{item.nursingMothersQuintals.toLocaleString()}</span>
                      </td>
                      )}
                      {showColumns.communityQuintals && (
                      <td className="p-3 text-right">
                        <span className="text-accent-yellow">{item.communityQuintals.toLocaleString()}</span>
                      </td>
                      )}
                      {showColumns.institutionQuintals && (
                      <td className="p-3 text-right">
                        <span className="text-green-400">{item.institutionQuintals.toLocaleString()}</span>
                      </td>
                      )}
                      {showColumns.totalQuintals && (
                      <td className="p-3 text-right">
                        <span className="text-accent-cyan font-bold">{item.totalQuintals.toLocaleString()}</span>
                      </td>
                      )}
                      {showColumns.month && (
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-sm font-medium">
                          {months[item.month]}
                        </span>
                      </td>
                      )}
                      {showColumns.createdAt && (
                      <td className="p-3">
                        <span className="text-text-muted text-sm">{formatDate(item.createdAt)}</span>
                      </td>
                      )}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewItem(item)}
                            className="text-text-muted hover:text-accent-cyan"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditItem(item)}
                            className="text-text-muted hover:text-accent-yellow"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="text-red-400 hover:text-red-400/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sortedData.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-glass-border">
              <div className="text-sm text-text-muted">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-text-secondary">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-bg-secondary border border-glass-border rounded-xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-text-primary mb-2">Delete Record?</h3>
              <p className="text-text-secondary mb-6">
                This will permanently delete this record. This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleDelete(deleteConfirmId)} className="bg-red-500 hover:bg-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-bg-secondary border border-glass-border rounded-xl p-6 max-w-lg mx-4 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">Edit Record</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditItem(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ተ.ቁ (Serial)
                    </label>
                    <Input
                      type="number"
                      value={editItem.serialNumber}
                      onChange={(e) => setEditItem({ ...editItem, serialNumber: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      የተሰራበት ወር
                    </label>
                    <select
                      value={editItem.month}
                      onChange={(e) => setEditItem({ ...editItem, month: parseInt(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-glass-border bg-bg-secondary px-3 text-text-primary"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Sub-City (ክፍለ ከተማ)
                    </label>
                    <Input
                      value={editItem.subCity}
                      onChange={(e) => setEditItem({ ...editItem, subCity: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Woreda (ወረዳ)
                    </label>
                    <Input
                      value={editItem.woreda}
                      onChange={(e) => setEditItem({ ...editItem, woreda: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ደንበኛ (Customers)
                    </label>
                    <Input
                      type="number"
                      value={editItem.numberOfCustomers}
                      onChange={(e) => setEditItem({ ...editItem, numberOfCustomers: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ማህበር (Communities)
                    </label>
                    <Input
                      type="number"
                      value={editItem.communitiesReceived}
                      onChange={(e) => setEditItem({ ...editItem, communitiesReceived: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ተቅዋም (Institution Customers)
                    </label>
                    <Input
                      type="number"
                      value={editItem.institutionCustomers}
                      onChange={(e) => setEditItem({ ...editItem, institutionCustomers: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ጠቅላላ (Total Quintals)
                    </label>
                    <Input
                      type="number"
                      value={editItem.totalQuintals}
                      onChange={(e) => setEditItem({ ...editItem, totalQuintals: parseFloat(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      እናት (Nursing Mothers)
                    </label>
                    <Input
                      type="number"
                      value={editItem.nursingMothersQuintals}
                      onChange={(e) => setEditItem({ ...editItem, nursingMothersQuintals: parseFloat(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ማህበር ኪሎ
                    </label>
                    <Input
                      type="number"
                      value={editItem.communityQuintals}
                      onChange={(e) => setEditItem({ ...editItem, communityQuintals: parseFloat(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ተቅዋም ኪሎ
                    </label>
                    <Input
                      type="number"
                      value={editItem.institutionQuintals}
                      onChange={(e) => setEditItem({ ...editItem, institutionQuintals: parseFloat(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <Button variant="outline" onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSave}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setViewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-bg-secondary border border-glass-border rounded-xl p-6 max-w-lg mx-4 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">Record Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setViewItem(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-glass-bg">
                    <p className="text-sm text-text-muted mb-1">ተ.ቁ</p>
                    <p className="text-lg font-semibold text-text-primary">{viewItem.serialNumber}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent-yellow/10 border border-accent-yellow/30">
                    <p className="text-sm text-text-muted mb-1">የተሰራበት ወር</p>
                    <p className="text-lg font-bold text-accent-yellow">{months[viewItem.month]}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-glass-bg">
                    <p className="text-sm text-text-muted mb-1">Created Date</p>
                    <p className="text-text-primary">{formatDate(viewItem.createdAt)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-glass-bg">
                    <p className="text-sm text-text-muted mb-1">Sub-City (ክፍለ ከተማ)</p>
                    <p className="text-lg font-semibold text-text-primary">{viewItem.subCity}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-glass-bg">
                    <p className="text-sm text-text-muted mb-1">Woreda (ወረዳ)</p>
                    <p className="text-lg font-semibold text-text-primary">{viewItem.woreda}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
                    <p className="text-sm text-text-muted mb-1">ደንበኛ</p>
                    <p className="text-lg font-semibold text-accent-cyan">{viewItem.numberOfCustomers.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent-purple/10 border border-accent-purple/30">
                    <p className="text-sm text-text-muted mb-1">ማህበር</p>
                    <p className="text-lg font-semibold text-accent-purple">{viewItem.communitiesReceived.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent-pink/10 border border-accent-pink/30">
                    <p className="text-sm text-text-muted mb-1">ተቅዋም</p>
                    <p className="text-lg font-semibold text-accent-pink">{viewItem.institutionCustomers.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-glass-bg">
                    <p className="text-xs text-text-muted mb-1">እናት (ኪሎ)</p>
                    <p className="text-md font-semibold text-text-primary">{viewItem.nursingMothersQuintals.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-glass-bg">
                    <p className="text-xs text-text-muted mb-1">ማህበር ኪሎ</p>
                    <p className="text-md font-semibold text-text-primary">{viewItem.communityQuintals.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-glass-bg">
                    <p className="text-xs text-text-muted mb-1">ተቅዋም ኪሎ</p>
                    <p className="text-md font-semibold text-text-primary">{viewItem.institutionQuintals.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-xs text-text-muted mb-1">ጠቅላላ</p>
                    <p className="text-lg font-bold text-green-400">{viewItem.totalQuintals.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <Button variant="outline" onClick={() => setViewItem(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewItem(null);
                  setEditItem(viewItem);
                }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkMonthEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowBulkMonthEdit(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-bg-secondary border border-glass-border rounded-xl p-6 max-w-md mx-4 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">
                  Edit የተሰራበት ወር (Month)
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowBulkMonthEdit(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-text-secondary mb-4">
                Update month for {selectedRows.size} selected item{selectedRows.size > 1 ? "s" : ""}.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Select Month (ወር ይምረጡ)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {months.map((month, index) => (
                    <button
                      key={index}
                      onClick={() => setBulkMonth(index)}
                      className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                        bulkMonth === index
                          ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50"
                          : "border-glass-border text-text-secondary hover:bg-glass-bg"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => setShowBulkMonthEdit(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkMonthUpdate}>
                  Update Month
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}