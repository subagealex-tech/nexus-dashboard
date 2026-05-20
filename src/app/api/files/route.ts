import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IGNORE_DIRS = ["node_modules", ".next", ".git", "dist", "build", ".cache"];

const FILE_ICONS: Record<string, string> = {
  tsx: "FileCode",
  ts: "FileCode",
  js: "FileCode",
  jsx: "FileCode",
  json: "FileText",
  md: "FileText",
  txt: "FileText",
  css: "Palette",
  scss: "Palette",
  png: "Image",
  jpg: "Image",
  jpeg: "Image",
  svg: "Image",
  ico: "Image",
  env: "Settings",
  prisma: "Database",
};

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || "File";
}

interface FileNode {
  name: string;
  path: string;
  type: "folder" | "file";
  size?: number;
  modifiedAt?: string;
  extension?: string;
}

function readDirectory(dirPath: string, relativePath: string = ""): FileNode[] {
  const items: FileNode[] = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORE_DIRS.includes(entry.name)) continue;

      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        const children = readDirectory(fullPath, relPath);
        items.push({
          name: entry.name,
          path: relPath,
          type: "folder",
          modifiedAt: fs.statSync(fullPath).mtime.toISOString(),
        });
      } else {
        const stats = fs.statSync(fullPath);
        items.push({
          name: entry.name,
          path: relPath,
          type: "file",
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
          extension: entry.name.split(".").pop()?.toLowerCase(),
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET() {
  try {
    const projectRoot = path.join(process.cwd());
    const files = readDirectory(projectRoot);
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error reading project structure:", error);
    return NextResponse.json({ error: "Failed to read project structure" }, { status: 500 });
  }
}