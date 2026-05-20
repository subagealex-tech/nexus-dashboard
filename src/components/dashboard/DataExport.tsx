"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/modal";
import type { DataEntry } from "@/types";

interface DataExportProps {
  data: DataEntry[];
}

const distributionColumns = [
  { key: "serialNumber", label: "Serial Number", required: true, type: "Number", amharic: "ቁጥር" },
  { key: "subCity", label: "Sub City", required: true, type: "Text", amharic: "ክፍለ ከተማ" },
  { key: "woreda", label: "Woreda", required: true, type: "Text", amharic: "ወረዳ" },
  { key: "numberOfCustomers", label: "Number of Customers", required: true, type: "Number", amharic: "ደንበኞች ቁጥር" },
  { key: "communitiesReceived", label: "Communities Received", required: true, type: "Number", amharic: "ለተጎዱ ማህበራት" },
  { key: "institutionCustomers", label: "Institution Customers", required: false, type: "Number", amharic: "ድርጅት ደንበኞች" },
  { key: "nursingMothersQuintals", label: "Nursing Mothers (Quintals)", required: false, type: "Number", amharic: "የሚያጠባት እናት (ኪሎ)" },
  { key: "communityQuintals", label: "Community (Quintals)", required: false, type: "Number", amharic: "ማህበር (ኪሎ)" },
  { key: "institutionQuintals", label: "Institution (Quintals)", required: false, type: "Number", amharic: "ድርጅት (ኪሎ)" },
  { key: "totalQuintals", label: "Total Quintals", required: true, type: "Number", amharic: "ጠቅላላ ኪሎ" },
];

const sampleData = [
  { serialNumber: "1", subCity: "አዲስ አባይ", woreda: "01", numberOfCustomers: "150", communitiesReceived: "5", totalQuintals: "2500" },
  { serialNumber: "2", subCity: "ቦሌ", woreda: "02", numberOfCustomers: "200", communitiesReceived: "8", totalQuintals: "3200" },
  { serialNumber: "3", subCity: "ለጋስታውን", woreda: "03", numberOfCustomers: "180", communitiesReceived: "6", totalQuintals: "2800" },
];

export default function DataExport({ data }: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFormat, setShowFormat] = useState(false);

  const exportToJSON = () => {
    setIsExporting(true);
    const distributionData = data.filter(d => d.category === "Distribution").map(item => {
      const parts = item.title?.split(" - ") || [];
      const desc = item.description || "";
      const customersMatch = desc.match(/Customers:\s*(\d+)/);
      const communitiesMatch = desc.match(/Communities:\s*(\d+)/);
      const monthMatch = desc.match(/Month:\s*(\d+)/);
      
      return {
        subCity: parts[0]?.trim() || "",
        woreda: parts[1]?.trim() || "",
        numberOfCustomers: customersMatch ? parseInt(customersMatch[1]) : 0,
        communitiesReceived: communitiesMatch ? parseInt(communitiesMatch[1]) : 0,
        totalQuintals: item.value || 0,
        month: monthMatch ? parseInt(monthMatch[1]) : new Date(item.createdAt).getMonth(),
      };
    });

    const jsonData = {
      exportedAt: new Date().toISOString(),
      totalRecords: distributionData.length,
      data: distributionData,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribution-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      setIsOpen(false);
    }, 1000);
  };

  const exportToCSV = () => {
    setIsExporting(true);
    const distributionData = data.filter(d => d.category === "Distribution").map(item => {
      const parts = item.title?.split(" - ") || [];
      const desc = item.description || "";
      const customersMatch = desc.match(/Customers:\s*(\d+)/);
      const communitiesMatch = desc.match(/Communities:\s*(\d+)/);
      const monthMatch = desc.match(/Month:\s*(\d+)/);
      
      return {
        subCity: parts[0]?.trim() || "",
        woreda: parts[1]?.trim() || "",
        numberOfCustomers: customersMatch ? parseInt(customersMatch[1]) : 0,
        communitiesReceived: communitiesMatch ? parseInt(communitiesMatch[1]) : 0,
        totalQuintals: item.value || 0,
        month: monthMatch ? parseInt(monthMatch[1]) : new Date(item.createdAt).getMonth(),
      };
    });

    const headers = ["Sub City", "Woreda", "Number of Customers", "Communities Received", "Total Quintals", "Month"];
    const rows = distributionData.map(item => [
      `"${item.subCity.replace(/"/g, '""')}"`,
      `"${item.woreda.replace(/"/g, '""')}"`,
      item.numberOfCustomers.toString(),
      item.communitiesReceived.toString(),
      item.totalQuintals.toString(),
      item.month.toString(),
    ]);

    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribution-data-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExporting(false);
      setIsOpen(false);
    }, 1000);
  };

  const downloadTemplate = () => {
    const headers = distributionColumns.map(c => c.label);
    const rows = sampleData.map(row => headers.map(h => row[h as keyof typeof row] || ""));
    const csv = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribution-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2">
        <Download className="w-4 h-4" />
        Export
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-outfit)]">
              Export Data
            </DialogTitle>
            <DialogDescription>
              Choose your preferred export format. {data.filter(d => d.category === "Distribution").length} distribution records will be exported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-2">
              <button
                onClick={exportToJSON}
                disabled={isExporting}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-glass-border bg-bg-secondary hover:border-accent-cyan/50 hover:bg-glass-bg transition-all disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                  <FileJson className="w-6 h-6 text-accent-purple" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-text-primary">JSON</p>
                  <p className="text-xs text-text-muted">Structured data</p>
                </div>
              </button>

              <button
                onClick={exportToCSV}
                disabled={isExporting}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-glass-border bg-bg-secondary hover:border-accent-cyan/50 hover:bg-glass-bg transition-all disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-accent-cyan" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-text-primary">CSV</p>
                  <p className="text-xs text-text-muted">Spreadsheet compatible</p>
                </div>
              </button>
            </div>

            <div className="border-t border-glass-border pt-4">
              <button
                onClick={() => setShowFormat(!showFormat)}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary w-full"
              >
                {showFormat ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <FileText className="w-4 h-4" />
                <span className="font-medium">Expected File Format (Distribution Data)</span>
              </button>

              {showFormat && (
                <div className="mt-4 space-y-3">
                  <div className="bg-glass-bg rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-glass-border">
                          <th className="text-left p-3 text-text-muted font-medium">Column</th>
                          <th className="text-left p-3 text-text-muted font-medium">አማርኛ</th>
                          <th className="text-left p-3 text-text-muted font-medium">Type</th>
                          <th className="text-center p-3 text-text-muted font-medium">Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distributionColumns.map((col) => (
                          <tr key={col.key} className="border-b border-glass-border">
                            <td className="p-3 text-text-primary font-medium">{col.label}</td>
                            <td className="p-3 text-accent-cyan">{col.amharic}</td>
                            <td className="p-3 text-text-secondary">{col.type}</td>
                            <td className="p-3 text-center">
                              {col.required ? (
                                <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Required</span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-glass-bg text-text-muted text-xs">Optional</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg p-4">
                    <div>
                      <p className="text-text-primary font-medium">Download Template</p>
                      <p className="text-sm text-text-muted">Get a sample CSV file with the correct format</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}