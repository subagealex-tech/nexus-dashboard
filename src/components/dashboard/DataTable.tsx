"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/modal";
import { cn, formatDate } from "@/lib/utils";
import type { DataEntry, DataEntryFormData, Status } from "@/types";

interface DataTableProps {
  data: DataEntry[];
  onCreate?: (data: DataEntryFormData) => void;
  onUpdate?: (id: string, data: DataEntryFormData) => void;
  onDelete?: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
}

type SortDirection = "asc" | "desc";

export default function DataTable({
  data,
  onCreate,
  onUpdate,
  onDelete,
  onDeleteMultiple,
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<DataEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<DataEntryFormData>({
    title: "",
    description: "",
    category: "General",
    status: "ACTIVE",
    value: 0,
  });

  const categories = ["General", "Analytics", "Storage", "Network", "Security"];
  const statuses: Status[] = ["ACTIVE", "INACTIVE", "PENDING"];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower);

      let matchesDate = true;
      if (dateFilter.start || dateFilter.end) {
        const itemDate = new Date(item.createdAt);
        if (dateFilter.start) {
          matchesDate = matchesDate && itemDate >= new Date(dateFilter.start);
        }
        if (dateFilter.end) {
          matchesDate = matchesDate && itemDate <= new Date(dateFilter.end);
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [data, searchQuery, dateFilter]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey as keyof DataEntry];
      const bValue = b[sortKey as keyof DataEntry];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredData, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((item) => item.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      title: "",
      description: "",
      category: "General",
      status: "ACTIVE",
      value: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: DataEntry) => {
    setModalMode("edit");
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      status: item.status as Status,
      value: item.value,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (modalMode === "create") {
      onCreate?.(formData);
    } else if (editingItem) {
      onUpdate?.(editingItem.id, formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setDeleteConfirmId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30";
      case "INACTIVE":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "PENDING":
        return "bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-[family-name:var(--font-outfit)]">
          Data Records
        </CardTitle>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Record
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">From:</span>
            <Input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="w-36 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">To:</span>
            <Input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="w-36 h-9"
            />
          </div>
          {(dateFilter.start || dateFilter.end) && (
            <button
              onClick={() => setDateFilter({ start: "", end: "" })}
              className="text-sm text-accent-cyan hover:underline"
            >
              Clear dates
            </button>
          )}
          {selectedRows.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-text-secondary">
                {selectedRows.size} selected
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (onDeleteMultiple) {
                    onDeleteMultiple(Array.from(selectedRows));
                    setSelectedRows(new Set());
                  }
                }}
              >
                Delete Selected
              </Button>
            </motion.div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-glass-border bg-bg-secondary text-accent-cyan focus:ring-accent-cyan"
                  />
                </th>
                <th
                  className="text-left p-4 text-text-muted text-sm font-medium cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Title
                    {sortKey === "title" && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
                <th className="text-left p-4 text-text-muted text-sm font-medium">
                  Description
                </th>
                <th
                  className="text-left p-4 text-text-muted text-sm font-medium cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-2">
                    Category
                    {sortKey === "category" && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 text-text-muted text-sm font-medium cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortKey === "status" && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 text-text-muted text-sm font-medium cursor-pointer hover:text-text-primary"
                  onClick={() => handleSort("value")}
                >
                  <div className="flex items-center gap-2">
                    Value
                    {sortKey === "value" && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
                <th className="text-left p-4 text-text-muted text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-glass-border hover:bg-glass-bg transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        className="w-4 h-4 rounded border-glass-border bg-bg-secondary text-accent-cyan focus:ring-accent-cyan"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-text-primary">
                        {item.title}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-secondary text-sm">
                        {item.description || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-secondary text-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border",
                          getStatusColor(item.status)
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-[family-name:var(--font-jetbrains)] text-text-primary">
                        {item.value.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-glass-border bg-bg-secondary px-3 text-sm text-text-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-outfit)]">
              {modalMode === "create" ? "Create New Record" : "Edit Record"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new data entry to your records."
                : "Update the existing record details."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Status,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary">Value</label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {modalMode === "create" ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}