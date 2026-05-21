"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  FileText,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  Clock,
  HardDrive,
  X,
  Upload,
  Trash2,
  Edit3,
  FolderPlus,
  Download,
  MoreVertical,
  ArrowLeft,
  FileSpreadsheet,
  Presentation,
  FileImage,
  FileArchive,
  Tag,
  User,
  Calendar,
  Building,
  AlertCircle,
  Star,
  Filter,
  Grid3X3,
  List,
  FileIcon,
  FileUp,
  Eye,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileNode {
  name: string;
  path: string;
  type: "folder" | "file";
  size?: number;
  modifiedAt?: string;
  extension?: string;
  children?: FileNode[];
}

type ViewMode = "grid" | "list";
type DocCategory = "all" | "documents" | "spreadsheets" | "presentations" | "pdfs" | "images" | "archives" | "other";

const DOC_ICONS: Record<string, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; label: string }> = {
  docx: { icon: FileText, color: "#2b5797", label: "Word Document" },
  doc: { icon: FileText, color: "#2b5797", label: "Word Document" },
  xlsx: { icon: FileSpreadsheet, color: "#217346", label: "Excel Spreadsheet" },
  xls: { icon: FileSpreadsheet, color: "#217346", label: "Excel Spreadsheet" },
  csv: { icon: FileSpreadsheet, color: "#217346", label: "CSV File" },
  pptx: { icon: Presentation, color: "#d04423", label: "PowerPoint" },
  ppt: { icon: Presentation, color: "#d04423", label: "PowerPoint" },
  pdf: { icon: FileIcon, color: "#b30b00", label: "PDF Document" },
  txt: { icon: FileText, color: "#5c5c6e", label: "Text File" },
  rtf: { icon: FileText, color: "#5c5c6e", label: "Rich Text" },
  jpg: { icon: FileImage, color: "#7c3aed", label: "Image" },
  jpeg: { icon: FileImage, color: "#7c3aed", label: "Image" },
  png: { icon: FileImage, color: "#7c3aed", label: "Image" },
  gif: { icon: FileImage, color: "#7c3aed", label: "Image" },
  svg: { icon: FileImage, color: "#7c3aed", label: "Vector Image" },
  zip: { icon: FileArchive, color: "#eab308", label: "Archive" },
  rar: { icon: FileArchive, color: "#eab308", label: "Archive" },
  "7z": { icon: FileArchive, color: "#eab308", label: "Archive" },
};

const CATEGORY_FOLDERS = [
  { name: "Reports", icon: FileText, color: "cyan" },
  { name: "Invoices", icon: FileSpreadsheet, color: "purple" },
  { name: "Presentations", icon: Presentation, color: "pink" },
  { name: "Contracts", icon: FileIcon, color: "yellow" },
  { name: "Meeting Notes", icon: FileText, color: "cyan" },
  { name: "Templates", icon: FileText, color: "purple" },
];

const RECENT_FILES = [
  { name: "Q4_Financial_Report.xlsx", author: "Sarah Chen", date: "2026-05-20", type: "spreadsheets" },
  { name: "Client_Proposal_2026.pptx", author: "Mike Johnson", date: "2026-05-19", type: "presentations" },
  { name: "Employment_Contract_v3.docx", author: "Legal Team", date: "2026-05-18", type: "documents" },
  { name: "Annual_Review_Summary.pdf", author: "HR Dept", date: "2026-05-17", type: "pdfs" },
  { name: "Budget_Allocation_2026.xlsx", author: "Finance", date: "2026-05-16", type: "spreadsheets" },
];



function getDocIcon(extension?: string): { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; label: string } {
  if (!extension) return { icon: File, color: "#5c5c6e", label: "File" };
  return DOC_ICONS[extension.toLowerCase()] || { icon: File, color: "#5c5c6e", label: "File" };
}

function getDocCategory(extension?: string): DocCategory {
  if (!extension) return "other";
  const ext = extension.toLowerCase();
  if (["docx", "doc", "txt", "rtf"].includes(ext)) return "documents";
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheets";
  if (["pptx", "ppt"].includes(ext)) return "presentations";
  if (["pdf"].includes(ext)) return "pdfs";
  if (["jpg", "jpeg", "png", "gif", "svg"].includes(ext)) return "images";
  if (["zip", "rar", "7z"].includes(ext)) return "archives";
  return "other";
}

function formatSize(bytes?: number): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function OrganizationPage() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [currentPath, setCurrentPath] = useState("documents");
  const [folderReady, setFolderReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeCategory, setActiveCategory] = useState<DocCategory>("all");
  const [showDetails, setShowDetails] = useState(true);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const ensureDocumentsFolder = async () => {
    try {
      const res = await fetch("/api/files");
      const data: FileNode[] = await res.json();
      const hasDocuments = data.some((f) => f.path === "documents" && f.type === "folder");
      if (!hasDocuments) {
        await fetch("/api/files/manage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "", name: "documents" }),
        });
        const subs = ["Reports", "Invoices", "Presentations", "Contracts", "Meeting Notes", "Templates"];
        for (const sub of subs) {
          await fetch("/api/files/manage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: "documents", name: sub }),
          });
        }
      }
      setFolderReady(true);
    } catch {
      setFolderReady(true);
    }
  };

  useEffect(() => {
    ensureDocumentsFolder().then(fetchFiles);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const handleDelete = async (file: FileNode) => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    try {
      const res = await fetch("/api/files/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: file.path }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchFiles();
      setSelectedFile(null);
      setContextMenu(null);
    } catch (err) { console.error(err); }
  };

  const handleRename = async (file: FileNode) => {
    if (!renameValue.trim()) return;
    try {
      const res = await fetch("/api/files/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: file.path, newName: renameValue }),
      });
      if (!res.ok) throw new Error("Rename failed");
      setIsRenaming(false);
      setSelectedFile(null);
      await fetchFiles();
    } catch (err) { console.error(err); }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/files/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: currentPath || "documents", name: newFolderName }),
      });
      if (!res.ok) throw new Error("Create failed");
      setIsCreatingFolder(false);
      setNewFolderName("");
      if (currentPath) setExpandedFolders((prev) => new Set([...prev, currentPath]));
      await fetchFiles();
    } catch (err) { console.error(err); }
  };

  const filteredFiles = useMemo(() => {
    let result = files.filter((f) => f.path.startsWith("documents/"));
    const base = currentPath || "documents";
    const prefix = base + "/";
    result = result.filter((file) => {
      if (file.path === base) return false;
      return file.path.startsWith(prefix) && file.path.split("/").filter(Boolean).length === base.split("/").filter(Boolean).length + 1;
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (activeCategory !== "all") {
      result = result.filter((f) => f.type === "file" && getDocCategory(f.extension) === activeCategory);
    }
    return result;
  }, [files, searchQuery, currentPath, activeCategory]);

  const docStats = useMemo(() => {
    const docFiles = files.filter((f) => f.path.startsWith("documents/") && f.type === "file");
    const totalDocuments = docFiles.length;
    const now = new Date();
    const thisMonth = docFiles.filter((f) => {
      if (!f.modifiedAt) return false;
      const d = new Date(f.modifiedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const totalBytes = docFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    const categories = new Set(docFiles.map((f) => getDocCategory(f.extension)));
    return [
      { label: "Total Documents", value: totalDocuments.toLocaleString(), icon: FileText, color: "#00f5d4" },
      { label: "This Month", value: thisMonth.toLocaleString(), icon: FileUp, color: "#9b5de5" },
      { label: "Storage Used", value: formatSize(totalBytes) || "0 B", icon: HardDrive, color: "#f15bb5" },
      { label: "Categories", value: categories.size.toString(), icon: FolderTree, color: "#fee440" },
    ];
  }, [files]);

  const organizeIntoTree = (flatFiles: FileNode[]): FileNode[] => {
    const root: FileNode[] = [];
    const pathMap: Record<string, FileNode> = {};
    flatFiles.forEach((file) => {
      const node: FileNode = { ...file, children: [] };
      pathMap[file.path] = node;
      const parts = file.path.split("/");
      if (parts.length === 1) {
        root.push(node);
      } else {
        const parentPath = parts.slice(0, -1).join("/");
        const parent = pathMap[parentPath];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          root.push(node);
        }
      }
    });
    const sort = (items: FileNode[]): FileNode[] =>
      items.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      }).map((item) => ({ ...item, children: item.children ? sort(item.children) : undefined }));
    return sort(root);
  };

  const treeData = useMemo(() => organizeIntoTree(filteredFiles), [filteredFiles]);
  const breadcrumbs = currentPath ? currentPath.split("/").filter(Boolean) : [];

  const docTypeFilters: { key: DocCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "documents", label: "Documents" },
    { key: "spreadsheets", label: "Spreadsheets" },
    { key: "presentations", label: "Presentations" },
    { key: "pdfs", label: "PDFs" },
    { key: "images", label: "Images" },
    { key: "archives", label: "Archives" },
  ];

  const renderTree = (items: FileNode[], depth: number = 0) =>
    items.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFile?.path === node.path;
      const docInfo = node.type === "file" ? getDocIcon(node.extension) : null;

      return (
        <div key={node.path}>
          <div
            className={cn(
              "flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-glass-bg cursor-pointer transition-colors group",
              isSelected && "bg-accent-cyan/10"
            )}
            onClick={() => {
              if (node.type === "folder") {
                setCurrentPath(node.path);
                setExpandedFolders(new Set());
              }
              setSelectedFile(node);
            }}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, file: node }); }}
          >
            {node.type === "folder" ? (
              <>
                {!currentPath && (
                  isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                )}
                <Folder className="w-4 h-4 text-accent-cyan flex-shrink-0" />
              </>
            ) : (
              <>
                <span className="w-4 flex-shrink-0" />
                {docInfo && <docInfo.icon className="w-4 h-4 flex-shrink-0" style={{ color: docInfo.color }} />}
              </>
            )}
            {isRenaming && isSelected ? (
              <input
                type="text" value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRename(node)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(node)}
                className="flex-1 px-1 py-0.5 bg-bg-tertiary border border-accent-cyan rounded text-sm text-text-primary focus:outline-none"
                autoFocus onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={cn("text-sm truncate", node.type === "folder" ? "text-text-primary font-medium" : "text-text-secondary")}>
                {node.name}
              </span>
            )}
            <span className="text-[10px] text-text-muted ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0">
              {node.type === "file" && formatSize(node.size)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, file: node }); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-glass-bg rounded transition-opacity flex-shrink-0"
            >
              <MoreVertical className="w-3 h-3 text-text-muted" />
            </button>
          </div>
          {node.type === "folder" && isExpanded && node.children && (
            <div className="border-l border-glass-border ml-2">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight">
            Office Documents
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">Organize, browse, and manage your office documents.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-yellow/10 text-accent-yellow hover:bg-accent-yellow/20 transition-colors text-sm"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors cursor-pointer text-sm">
            <Upload className={cn("w-4 h-4", isImporting && "animate-spin")} />
            {isImporting ? "Uploading..." : "Upload"}
            <input type="file" className="hidden" disabled={isImporting}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsImporting(true);
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  fd.append("destination", currentPath || "documents");
                  const res = await fetch("/api/files/import", { method: "POST", body: fd });
                  if (!res.ok) throw new Error("Import failed");
                  await fetchFiles();
                } catch (err) { console.error(err); }
                finally { setIsImporting(false); e.target.value = ""; }
              }}
            />
          </label>
          <button onClick={fetchFiles} className="p-2 rounded-lg hover:bg-glass-bg transition-colors">
            <RefreshCw className={cn("w-4 h-4 text-text-muted", loading && "animate-spin")} />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {docStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                  <Icon className="w-[18px] h-[18px]" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                  <p className="text-lg font-semibold text-text-primary font-[family-name:var(--font-jetbrains)]">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isCreatingFolder && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-secondary border border-glass-border">
          <FolderPlus className="w-4 h-4 text-accent-yellow" />
          <input type="text" placeholder="Folder name..." value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-sm"
            autoFocus
          />
          <button onClick={handleCreateFolder} className="px-3 py-1 rounded-lg bg-accent-cyan text-bg-primary text-xs font-medium">Create</button>
          <button onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }} className="p-1 hover:bg-glass-bg rounded">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search documents..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-secondary border border-glass-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan text-sm"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {docTypeFilters.map((f) => (
            <button key={f.key} onClick={() => setActiveCategory(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                activeCategory === f.key
                  ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                  : "text-text-muted hover:text-text-primary hover:bg-glass-bg border border-transparent"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-bg-secondary rounded-lg border border-glass-border p-0.5">
          <button onClick={() => setViewMode("grid")}
            className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-glass-bg text-text-primary" : "text-text-muted hover:text-text-primary")}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")}
            className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-glass-bg text-text-primary" : "text-text-muted hover:text-text-primary")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {currentPath && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrentPath("documents"); setSelectedFile(null); }}
            className="flex items-center gap-1 text-xs text-accent-cyan hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Documents
          </button>
          <span className="text-text-muted">|</span>
          <div className="flex items-center gap-1 text-xs">
            <button onClick={() => setCurrentPath("documents")} className="text-accent-cyan font-medium hover:underline flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" /> Documents
            </button>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-text-muted" />
                <button onClick={() => setCurrentPath(breadcrumbs.slice(0, i + 1).join("/"))}
                  className="text-text-muted hover:text-accent-cyan"
                >
                  {crumb}
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: showDetails ? "1fr 320px" : "1fr" }}>
        <div className="rounded-xl border border-glass-border bg-bg-secondary/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-[18px] h-[18px] text-accent-cyan" />
              <h2 className="text-sm font-medium text-text-primary">File Browser</h2>
            </div>
            <span className="text-xs text-text-muted">{filteredFiles.length} items</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-5 h-5 text-accent-cyan animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={fetchFiles} className="mt-2 text-xs text-accent-cyan hover:underline">Retry</button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="p-4 max-h-[520px] overflow-auto">
              {filteredFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredFiles.map((node) => {
                    const docInfo = node.type === "file" ? getDocIcon(node.extension) : null;
                    const ExtIcon = docInfo?.icon || Folder;
                    return (
                      <div key={node.path} onClick={() => setSelectedFile(node)}
                        onDoubleClick={() => node.type === "folder" && (setCurrentPath(node.path), setExpandedFolders(new Set()))}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, file: node }); }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all group",
                          selectedFile?.path === node.path
                            ? "border-accent-cyan/40 bg-accent-cyan/5"
                            : "border-glass-border hover:border-glass-border/50 hover:bg-glass-bg"
                        )}
                      >
                        {node.type === "folder" ? (
                          <Folder className="w-10 h-10 text-accent-cyan" />
                        ) : (
                          <ExtIcon className="w-10 h-10" style={{ color: docInfo?.color }} />
                        )}
                        <span className="text-xs text-text-secondary text-center truncate w-full">{node.name}</span>
                        {node.type === "file" && (
                          <span className="text-[10px] text-text-muted">{formatSize(node.size)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No documents match your filter</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-[520px] overflow-auto">
              {filteredFiles.length > 0 ? (
                <div className="divide-y divide-glass-border">
                  <div className="px-4 py-2 flex items-center gap-4 text-xs text-text-muted font-medium">
                    <span className="flex-1">Name</span>
                    <span className="w-20 hidden sm:block">Size</span>
                    <span className="w-32 hidden md:block">Modified</span>
                  </div>
                  {filteredFiles.map((node) => {
                    const docInfo = node.type === "file" ? getDocIcon(node.extension) : null;
                    const ExtIcon = docInfo?.icon || Folder;
                    return (
                      <div key={node.path} onClick={() => setSelectedFile(node)}
                        onDoubleClick={() => node.type === "folder" && (setCurrentPath(node.path), setExpandedFolders(new Set()))}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, file: node }); }}
                        className={cn(
                          "flex items-center gap-4 px-4 py-2.5 cursor-pointer transition-colors hover:bg-glass-bg",
                          selectedFile?.path === node.path && "bg-accent-cyan/5"
                        )}
                      >
                        <ExtIcon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: docInfo?.color }} />
                        <span className="flex-1 text-sm text-text-primary truncate">{node.name}</span>
                        <span className="w-20 text-xs text-text-muted hidden sm:block">{node.type === "file" ? formatSize(node.size) : "—"}</span>
                        <span className="w-32 text-xs text-text-muted hidden md:block">{formatDate(node.modifiedAt)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No documents found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showDetails && (
          <div className="space-y-4">
            {selectedFile ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Document Info</CardTitle>
                    <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-glass-bg rounded">
                      <X className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {selectedFile.type === "folder" ? (
                        <Folder className="w-8 h-8 text-accent-cyan" />
                      ) : (() => {
                        const info = getDocIcon(selectedFile.extension);
                        const Icon = info.icon;
                        return <Icon className="w-8 h-8" style={{ color: info.color }} />;
                      })()}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{selectedFile.name}</p>
                        <p className="text-xs text-text-muted capitalize">
                          {selectedFile.type === "folder" ? "Folder" : getDocIcon(selectedFile.extension).label}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="truncate">{selectedFile.path}</span>
                      </div>
                      {selectedFile.type === "file" && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>{formatSize(selectedFile.size)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(selectedFile.modifiedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-glass-border">
                      <button onClick={() => { setIsRenaming(true); setRenameValue(selectedFile.name); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass-bg hover:bg-glass-bg/80 text-text-secondary hover:text-text-primary transition-colors text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Rename
                      </button>
                      {selectedFile.type === "file" && (
                        <button onClick={() => window.open(`/${selectedFile.path}`, "_blank")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass-bg hover:bg-glass-bg/80 text-text-secondary hover:text-text-primary transition-colors text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      )}
                      <button onClick={() => handleDelete(selectedFile)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-5">
                  <div className="text-center py-8 text-text-muted">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Select a file to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_FOLDERS.map((cat) => {
                    const Icon = cat.icon;
                    const colorMap: Record<string, string> = {
                      cyan: "text-accent-cyan bg-accent-cyan/10",
                      purple: "text-accent-purple bg-accent-purple/10",
                      pink: "text-accent-pink bg-accent-pink/10",
                      yellow: "text-accent-yellow bg-accent-yellow/10",
                    };
                    return (
                      <button key={cat.name} onClick={() => { setCurrentPath(`documents/${cat.name}`); setSelectedFile(null); setActiveCategory("all"); }}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-glass-bg border border-glass-border hover:border-glass-border/50 transition-all text-left"
                      >
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", colorMap[cat.color])}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-text-secondary">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {RECENT_FILES.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-glass-bg transition-colors cursor-pointer">
                      <FileText className="w-4 h-4 text-accent-cyan flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-text-primary truncate">{doc.name}</p>
                        <p className="text-[10px] text-text-muted">{doc.author} · {doc.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-bg-secondary border border-glass-border rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.file.type === "file" && (
              <button onClick={() => { window.open(`/${contextMenu.file.path}`, "_blank"); setContextMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-glass-bg"
              >
                <Eye className="w-4 h-4" /> View
              </button>
            )}
            <button onClick={() => { setSelectedFile(contextMenu.file); setIsRenaming(true); setRenameValue(contextMenu.file.name); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-glass-bg"
            >
              <Edit3 className="w-4 h-4" /> Rename
            </button>
            {contextMenu.file.type === "file" && (
              <button onClick={() => { setContextMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-glass-bg"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            )}
            <button onClick={() => handleDelete(contextMenu.file)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-glass-bg"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
