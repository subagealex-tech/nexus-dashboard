import { NextRequest, NextResponse } from "next/server";

const defaultData = [
  { id: "1", title: "Q4 Sales Report", description: "Quarterly sales performance analysis", category: "Analytics", status: "ACTIVE", value: 12500, createdAt: "2024-01-15", updatedAt: "2024-01-15" },
  { id: "2", title: "Customer Database", description: "Primary customer records backup", category: "Storage", status: "ACTIVE", value: 45000, createdAt: "2024-01-14", updatedAt: "2024-01-14" },
  { id: "3", title: "Network Logs", description: "System network activity logs", category: "Network", status: "PENDING", value: 8200, createdAt: "2024-01-13", updatedAt: "2024-01-13" },
  { id: "4", title: "Security Audit", description: "Annual security assessment results", category: "Security", status: "ACTIVE", value: 3200, createdAt: "2024-01-12", updatedAt: "2024-01-12" },
  { id: "5", title: "Marketing Campaign", description: "Q1 marketing initiative data", category: "Analytics", status: "INACTIVE", value: 15000, createdAt: "2024-01-11", updatedAt: "2024-01-11" },
  { id: "6", title: "User Activity Logs", description: "Daily user interaction metrics", category: "Network", status: "ACTIVE", value: 28000, createdAt: "2024-01-10", updatedAt: "2024-01-10" },
  { id: "7", title: "Product Inventory", description: "Current stock levels and updates", category: "Storage", status: "ACTIVE", value: 5600, createdAt: "2024-01-09", updatedAt: "2024-01-09" },
  { id: "8", title: "API Performance", description: "Backend API response metrics", category: "Network", status: "ACTIVE", value: 9100, createdAt: "2024-01-08", updatedAt: "2024-01-08" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataSource, startDate, endDate, filters, format } = body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredData = defaultData.filter((item) => {
      const itemDate = new Date(item.createdAt);
      const inDateRange = itemDate >= start && itemDate <= end;
      const inCategory =
        filters.selectedCategories.length === 0 ||
        filters.selectedCategories.includes(item.category);
      const includeStatus =
        (filters.includeInactive || item.status !== "INACTIVE") &&
        (filters.includePending || item.status !== "PENDING");

      return inDateRange && inCategory && includeStatus;
    });

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === "csv") {
      const headers = ["id", "title", "description", "category", "status", "value", "createdAt"];
      const rows = filteredData.map((item) =>
        headers.map((h) => {
          const val = item[h as keyof typeof item];
          return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
        }).join(",")
      );
      content = [headers.join(","), ...rows].join("\n");
      contentType = "text/csv";
      filename = `report-${dataSource}-${Date.now()}.csv`;
    } else {
      content = JSON.stringify(filteredData, null, 2);
      contentType = "application/json";
      filename = `report-${dataSource}-${Date.now()}.json`;
    }

    const blob = new Blob([content], { type: contentType });
    
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}