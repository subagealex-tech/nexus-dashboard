import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entries, fileName } = body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "No entries provided" }, { status: 400 });
    }

    await prisma.distributionEntry.createMany({
      data: entries.map((e: any) => ({
        serialNumber: e.serialNumber,
        subCity: e.subCity,
        woreda: e.woreda,
        numberOfCustomers: e.numberOfCustomers,
        communitiesReceived: e.communitiesReceived,
        institutionCustomers: e.institutionCustomers ?? 0,
        nursingMothersQuintals: e.nursingMothersQuintals ?? 0,
        communityQuintals: e.communityQuintals ?? 0,
        institutionQuintals: e.institutionQuintals ?? 0,
        totalQuintals: e.totalQuintals,
        fileName: fileName ?? null,
      })),
    });

    const count = entries.length;
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await prisma.distributionEntry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching distribution entries:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
