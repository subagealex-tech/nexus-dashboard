import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const destination = formData.get("destination") as string || "public";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(process.cwd(), destination, file.name);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      path: `${destination}/${file.name}`,
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error("Error importing file:", error);
    return NextResponse.json({ error: "Failed to import file" }, { status: 500 });
  }
}