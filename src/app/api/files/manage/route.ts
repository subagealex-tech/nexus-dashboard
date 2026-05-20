import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(request: Request) {
  try {
    const { path: filePath } = await request.json();
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.rmdirSync(fullPath, { recursive: true });
    } else {
      fs.unlinkSync(fullPath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { path: filePath, newName, newPath } = await request.json();
    const oldFullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(oldFullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    let newFullPath;
    if (newPath) {
      newFullPath = path.join(process.cwd(), newPath, newName);
    } else {
      const dir = path.dirname(oldFullPath);
      newFullPath = path.join(dir, newName);
    }

    fs.renameSync(oldFullPath, newFullPath);

    return NextResponse.json({ success: true, newPath: newPath || filePath.replace(/[^/]+$/, newName) });
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json({ error: "Failed to rename" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { path: folderPath, name } = await request.json();
    const fullPath = path.join(process.cwd(), folderPath, name);

    if (fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "Folder already exists" }, { status: 400 });
    }

    fs.mkdirSync(fullPath, { recursive: true });

    return NextResponse.json({ success: true, path: `${folderPath}/${name}` });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}