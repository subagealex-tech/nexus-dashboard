"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  FileCode,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Database,
  Layout,
  Server,
  Settings,
  Palette,
  Package,
  GitBranch,
  Box,
  Type,
  Image,
  Zap,
  Search,
  RefreshCw,
  FileText,
  Clock,
  HardDrive,
  X,
  Upload,
  Trash2,
  Edit3,
  FolderPlus,
  Download,
  MoreVertical,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "folder" | "file";
  size?: number;
  modifiedAt?: string;
  extension?: string;
  children?: FileNode[];
}

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tsx: FileCode,
  ts: FileCode,
  js: FileCode,
  jsx: FileCode,
  json: FileText,
  md: FileText,
  txt: FileText,
  css: Palette,
  scss: Palette,
  prisma: Database,
};

const FOLDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  src: Layout,
  app: Layout,
  components: Box,
  lib: Package,
  types: Type,
  public: Image,
  prisma: Database,
  api: Server,
};

function getIcon(name: string, type: string, extension?: string): React.ReactNode {
  if (type === "file") {
    const IconComponent = extension && FILE_ICONS[extension] ? FILE_ICONS[extension] : File;
    return <IconComponent className="w-4 h-4 text-accent-purple" />;
  }
  const IconComponent = FOLDER_ICONS[name] ? FOLDER_ICONS[name] : Folder;
  const color = name === "src" ? "text-accent-cyan" :
                name === "components" ? "text-accent-yellow" :
                name === "lib" ? "text-accent-cyan" :
                name === "types" ? "text-accent-purple" :
                name === "public" ? "text-accent-yellow" :
                "text-accent-cyan";
  return <IconComponent className={cn("w-4 h-4", color)} />;
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
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const namingConventions = [
  { convention: "Components", rule: "PascalCase", example: "DataTable.tsx, Sidebar.tsx", description: "Capitalize first letter of each word" },
  { convention: "Pages/Routes", rule: "kebab-case", example: "data-management.tsx, import-data.page.tsx", description: "All lowercase, hyphens between words" },
  { convention: "Utilities", rule: "camelCase", example: "utils.ts, db.ts, auth.ts", description: "Lowercase first word, capitalize subsequent" },
  { convention: "Hooks", rule: "camelCase", example: "useData.ts, useAuth.ts", description: "Prefix with 'use'" },
  { convention: "Context", rule: "PascalCase", example: "DataContext.tsx, ThemeProvider.tsx", description: "Capitalize, suffix with Context/Provider" },
  { convention: "Types", rule: "PascalCase", example: "DataEntry.ts, User.ts", description: "Capitalize, singular noun" },
  { convention: "Constants", rule: "UPPER_SNAKE_CASE", example: "API_URL, MAX_RETRY_COUNT", description: "All caps with underscores" },
  { convention: "CSS Classes", rule: "kebab-case", example: "text-primary, bg-accent-cyan", description: "All lowercase with hyphens" },
];

const bestPractices = [
  { title: "Colocate Files", description: "Keep files close to where they're used. Components near pages, tests near components." },
  { title: "Feature-Based Folders", description: "Group by feature instead of type in larger projects." },
  { title: "Index Exports", description: "Use index.ts files for clean imports from folders." },
  { title: "Named Exports", description: "Prefer named exports over default exports for better refactoring." },
  { title: "Absolute Imports", description: "Use @/ prefix for clean relative paths in imports." },
  { title: "Barrel Files", description: "Create index.ts to re-export from subfolders." },
];

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
  const [currentPath, setCurrentPath] = useState("");
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

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleDelete = async (file: FileNode) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;
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
    } catch (err) {
      console.error("Delete error:", err);
    }
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
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const parentPath = currentPath || "";
    try {
      const res = await fetch("/api/files/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: parentPath, name: newFolderName }),
      });
      if (!res.ok) throw new Error("Create folder failed");
      setIsCreatingFolder(false);
      setNewFolderName("");
      if (parentPath) setExpandedFolders((prev) => new Set([...prev, parentPath]));
      await fetchFiles();
    } catch (err) {
      console.error("Create folder error:", err);
    }
  };

  const handleDownload = (file: FileNode) => {
    window.open(`/${file.path}`, "_blank");
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const filteredFiles = useMemo(() => {
    let result = files;
    if (currentPath) {
      const prefix = currentPath + "/";
      result = files.filter((file) => {
        const relativePath = file.path.substring(currentPath.length + 1);
        const depth = relativePath.split("/").filter(Boolean).length;
        return file.path === currentPath || (file.path.startsWith(prefix) && depth === 1);
      });
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((file) => 
        file.name.toLowerCase().includes(query) || 
        file.path.toLowerCase().includes(query)
      );
    }
    return result;
  }, [files, searchQuery, currentPath]);

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

    const sortItems = (items: FileNode[]): FileNode[] => {
      return items.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      }).map((item) => ({
        ...item,
        children: item.children ? sortItems(item.children) : undefined,
      }));
    };

    return sortItems(root);
  };

  const treeData = useMemo(() => organizeIntoTree(filteredFiles), [filteredFiles]);

  const breadcrumbs = currentPath ? currentPath.split("/").filter(Boolean) : [];

  const renderTree = (items: FileNode[], depth: number = 0) => {
    return items.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFile?.path === node.path;

      return (
        <div key={node.path} className={cn("ml-4")}>
          <div
            className={cn(
              "flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-glass-bg cursor-pointer transition-colors group",
              isSelected && "bg-accent-cyan/20"
            )}
            onClick={() => {
              if (node.type === "folder") {
                setCurrentPath(node.path);
                setExpandedFolders(new Set());
              }
              setSelectedFile(node);
            }}
            onContextMenu={(e) => handleContextMenu(e, node)}
          >
            {node.type === "folder" ? (
              <>
                {!currentPath && (isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                ))}
                {getIcon(node.name, node.type)}
              </>
            ) : (
              <>
                <span className="w-4" />
                {getIcon(node.name, node.type, node.extension)}
              </>
            )}
            {isRenaming && isSelected ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRename(node)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(node)}
                className="flex-1 px-1 py-0.5 bg-card-bg border border-accent-cyan rounded text-sm text-text-primary"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={cn("text-sm truncate", node.type === "folder" ? "text-text-primary font-medium" : "text-text-secondary")}>
                {node.name}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleContextMenu(e, node); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-glass-bg rounded transition-opacity"
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
            Project Organization
          </h1>
          <p className="text-text-secondary mt-1">
            Explore and manage your project file structure.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-yellow/10 text-accent-yellow hover:bg-accent-yellow/20 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors cursor-pointer">
            <Upload className={cn("w-4 h-4", isImporting && "animate-spin")} />
            {isImporting ? "Importing..." : "Import File"}
            <input
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsImporting(true);
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("destination", currentPath || "public");
                  const res = await fetch("/api/files/import", { method: "POST", body: formData });
                  if (!res.ok) throw new Error("Import failed");
                  await fetchFiles();
                } catch (err) {
                  console.error("Import error:", err);
                } finally {
                  setIsImporting(false);
                  e.target.value = "";
                }
              }}
              disabled={isImporting}
            />
          </label>
          <button
            onClick={fetchFiles}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </motion.div>

      {isCreatingFolder && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card-bg border border-glass-border">
          <FolderPlus className="w-4 h-4 text-accent-yellow" />
          <input
            type="text"
            placeholder="New folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            autoFocus
          />
          <button onClick={handleCreateFolder} className="px-3 py-1 rounded bg-accent-cyan text-card-bg text-sm font-medium">
            Create
          </button>
          <button onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }} className="p-1 hover:bg-glass-bg rounded">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search files and folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-card-bg border border-glass-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"
        />
      </div>

      {currentPath && (
        <button
          onClick={() => { setCurrentPath(""); setSelectedFile(null); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Root
        </button>
      )}

      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 text-sm">
          <button onClick={() => setCurrentPath("")} className="text-accent-cyan hover:underline">Home</button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-text-muted" />
              <button onClick={() => setCurrentPath(breadcrumbs.slice(0, i + 1).join("/"))} className="text-text-secondary hover:text-accent-cyan">
                {crumb}
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-glass-border bg-card-bg overflow-hidden">
          <div className="p-4 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-accent-cyan" />
              <h2 className="font-medium text-text-primary">File Explorer</h2>
            </div>
            <span className="text-xs text-text-muted">{filteredFiles.length} items</span>
          </div>
          <div className="p-4 max-h-[500px] overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-accent-cyan animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                <p>Error: {error}</p>
                <button onClick={fetchFiles} className="mt-2 text-accent-cyan underline">Retry</button>
              </div>
            ) : (
              renderTree(treeData)
            )}
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-card-bg overflow-hidden">
          <div className="p-4 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-accent-purple" />
              <h2 className="font-medium text-text-primary">Details</h2>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setIsRenaming(true); setRenameValue(selectedFile.name); }}
                  className="p-1 hover:bg-glass-bg rounded"
                  title="Rename"
                >
                  <Edit3 className="w-4 h-4 text-text-muted" />
                </button>
                <button
                  onClick={() => handleDelete(selectedFile)}
                  className="p-1 hover:bg-glass-bg rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
                {selectedFile.type === "file" && (
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="p-1 hover:bg-glass-bg rounded"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-text-muted" />
                  </button>
                )}
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-glass-bg rounded">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            )}
          </div>
          <div className="p-4">
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getIcon(selectedFile.name, selectedFile.type, selectedFile.extension)}
                  <div>
                    <p className="font-medium text-text-primary">{selectedFile.name}</p>
                    <p className="text-xs text-text-muted capitalize">{selectedFile.type}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{selectedFile.path}</span>
                  </div>
                  {selectedFile.type === "file" && (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <HardDrive className="w-4 h-4" />
                      <span>{formatSize(selectedFile.size)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(selectedFile.modifiedAt)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-text-muted text-sm text-center py-8">Select a file to view details</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-card-bg border border-glass-border rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.file.type === "file" && (
              <button
                onClick={() => handleDownload(contextMenu.file)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-glass-bg"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            )}
            <button
              onClick={() => { setSelectedFile(contextMenu.file); setIsRenaming(true); setRenameValue(contextMenu.file.name); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-glass-bg"
            >
              <Edit3 className="w-4 h-4" /> Rename
            </button>
            <button
              onClick={() => handleDelete(contextMenu.file)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-glass-bg"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-glass-border bg-card-bg">
          <div className="p-4 border-b border-glass-border flex items-center gap-2">
            <FileCode className="w-5 h-5 text-accent-purple" />
            <h2 className="font-medium text-text-primary">Naming Conventions</h2>
          </div>
          <div className="p-4 space-y-4">
            {namingConventions.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{item.convention}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan">{item.rule}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 font-mono">{item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-card-bg">
          <div className="p-4 border-b border-glass-border flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-pink" />
            <h2 className="font-medium text-text-primary">Configuration Files</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-glass-bg">
              <Settings className="w-4 h-4 text-text-muted" />
              <div>
                <p className="text-sm text-text-primary">Environment Variables</p>
                <p className="text-xs text-text-muted">.env, .env.example</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-glass-bg">
              <Package className="w-4 h-4 text-text-muted" />
              <div>
                <p className="text-sm text-text-primary">Dependencies</p>
                <p className="text-xs text-text-muted">package.json, package-lock.json</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-glass-bg">
              <GitBranch className="w-4 h-4 text-text-muted" />
              <div>
                <p className="text-sm text-text-primary">Build & Lint</p>
                <p className="text-xs text-text-muted">tsconfig.json, next.config.ts, eslint.config.mjs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-glass-border bg-card-bg">
        <div className="p-4 border-b border-glass-border flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-yellow" />
          <h2 className="font-medium text-text-primary">Best Practices</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bestPractices.map((practice, index) => (
              <div key={index} className="p-4 rounded-lg bg-glass-bg">
                <h3 className="text-sm font-medium text-text-primary mb-1">{practice.title}</h3>
                <p className="text-xs text-text-muted">{practice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}