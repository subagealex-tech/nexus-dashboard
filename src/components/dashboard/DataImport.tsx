"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  Table,
  Trash2,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DataEntry } from "@/types";
import { useData } from "@/components/providers/DataContext";

interface ParsedData {
  headers: string[];
  rows: string[][];
  fileName: string;
  fileType: "csv" | "xlsx";
}

interface SavedFile {
  name: string;
  type: "csv" | "xlsx";
  data: string;
  importedAt: string;
  recordCount: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface FileFormatField {
  column: string;
  amharicColumn: string;
  required: boolean;
  type: string;
  example: string;
}

const amharicFields = {
  serialNumber: ["ተ.ቁ", "ቁጥር", "serial", "id", "መለያ"],
  subCity: ["ክፍለ ከተማ", "sub-city", "subcity", "ክፍለ"],
  woreda: ["ወረዳ", "woreda", "district", "ወረዳ"],
  numberOfCustomers: ["የደንበኛ ብዛት", "customers", "ደንበኛ", "ብዛት"],
  communitiesReceived: ["ምርት የተረከቡ ማህበረሰብ ብዛት", "communities", "ማህበረሰብ", "ህብረተሰብ"],
  institutionCustomers: ["ተቅዋም ላይ ተረከቡ ደንበኞች", "institution customers", "ተቅዋም"],
  nursingMothersQuintals: ["ለምግብ እናቶች በ ኩንታል የተሰራጨ", "nursing mothers", "እናቶች", "ምግብ እናቶች"],
  communityQuintals: ["ምርት የተሰራጨው ለማህበረሰብ በኩንታል", "community", "ማህበረሰብ"],
  institutionQuintals: ["ተቅዋም ላይ የተሰራጨው በኩንታል", "institution", "ተቅዋም"],
  totalQuintals: ["ጠቅላላ የተሰራጨው በ ኩንታል", "total", "ጠቅላላ", "ድምር"],
};

export default function DataImport({ onImport }: { onImport?: (data: Partial<DataEntry>[], fileName?: string, fileType?: "csv" | "xlsx") => void }) {
  const { data, deleteMultiple } = useData();
  const [dragActive, setDragActive] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("importedFiles");
    if (stored) {
      try {
        setSavedFiles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load saved files:", e);
      }
    }
  }, []);

  const saveFile = (file: File, recordCount: number) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      const newFile: SavedFile = {
        name: file.name,
        type: file.name.endsWith(".csv") ? "csv" : "xlsx",
        data: base64,
        importedAt: new Date().toISOString(),
        recordCount,
      };
      const updated = [newFile, ...savedFiles].slice(0, 10);
      setSavedFiles(updated);
      localStorage.setItem("importedFiles", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (savedFile: SavedFile) => {
    const link = document.createElement("a");
    link.href = `data:application/${savedFile.type === "csv" ? "csv" : "vnd.openxmlformats-officedocument.spreadsheetml.sheet"};base64,${savedFile.data}`;
    link.download = savedFile.name;
    link.click();
  };

  const deleteSavedFile = (index: number) => {
    const updated = savedFiles.filter((_, i) => i !== index);
    setSavedFiles(updated);
    localStorage.setItem("importedFiles", JSON.stringify(updated));
  };
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [importStatus, setImportStatus] = useState<"idle" | "preview" | "success">("idle");
  const [importedCount, setImportedCount] = useState(0);
  const [isEditingFormat, setIsEditingFormat] = useState(false);
  const [fileFormat, setFileFormat] = useState<FileFormatField[]>([
    { column: "Serial Number (ተ.ቁ)", amharicColumn: "ተ.ቁ", required: true, type: "Integer", example: "1, 2, 3..." },
    { column: "Sub-City (ክፍለ ከተማ)", amharicColumn: "ክፍለ ከተማ", required: true, type: "String", example: "ንፋስ ስልክ ላፍቶ" },
    { column: "Woreda (ወረዳ)", amharicColumn: "ወረዳ", required: true, type: "String", example: "ወረዳ 5, ክፍለ ከተማ ተቋም" },
    { column: "Number of Customers (የደንበኛ ብዛት)", amharicColumn: "የደንበኛ ብዛት", required: true, type: "Integer", example: "150, 200, 500" },
    { column: "Communities Received (ምርት የተረከቡ ማህበረሰብ ብዛት)", amharicColumn: "ምርት የተረከቡ ማህበረሰብ ብዛት", required: true, type: "Integer", example: "10, 25, 50" },
    { column: "Institution Customers (ተቅዋም ላይ ተረከቡ ደንበኞች)", amharicColumn: "ተቅዋም ላይ ተረከቡ ደንበኞች", required: false, type: "Integer", example: "5, 10, 20" },
    { column: "Nursing Mothers (Quintals) (ለምግብ እናቶች)", amharicColumn: "ለምግብ እናቶች በ ኩንታል የተሰራጨ", required: false, type: "Decimal", example: "12.50, 25.00" },
    { column: "Community (Quintals) (ማህበረሰብ)", amharicColumn: "ምርት የተሰራጨው ለማህበረሰብ በኩንታል", required: true, type: "Decimal", example: "100.00, 250.50" },
    { column: "Institution (Quintals) (ተቅዋም)", amharicColumn: "ተቅዋም ላይ የተሰራጨው በኩንታል", required: false, type: "Decimal", example: "50.00, 75.25" },
    { column: "Total (Quintals) (ጠቅላላ)", amharicColumn: "ጠቅላላ የተሰራጨው በ ኩንታል", required: true, type: "Decimal", example: "162.50, 350.75" },
  ]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const parseFile = (file: File) => {
    setCurrentFile(file);
    const fileType = file.name.endsWith(".csv") ? "csv" : "xlsx";
    const fileName = file.name;

    if (fileType === "csv") {
      Papa.parse(file, {
        complete: (results) => {
          const headers = results.data[0] as string[];
          const rows = (results.data as string[][]).slice(1).filter(row => row.length === headers.length);
          setParsedData({ headers, rows, fileName, fileType });
          setImportStatus("preview");
          autoMapColumns(headers);
        },
        error: (error) => {
          setErrors([{ row: 0, field: "file", message: error.message }]);
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 }) as string[][];
          
          if (jsonData.length > 0) {
            const headers = jsonData[0];
            const rows = jsonData.slice(1).filter(row => row.length === headers.length);
            setParsedData({ headers, rows, fileName, fileType });
            setImportStatus("preview");
            autoMapColumns(headers);
          } else {
            setErrors([{ row: 0, field: "file", message: "No data found in the file" }]);
          }
        } catch (err) {
          setErrors([{ row: 0, field: "file", message: "Failed to parse Excel file. Make sure it's a valid .xlsx or .xls file." }]);
        }
      };
      reader.onerror = () => {
        setErrors([{ row: 0, field: "file", message: "Failed to read file" }]);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const autoMapColumns = (headers: string[]) => {
    const mapping: Record<string, string> = {};

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      for (const [field, variants] of Object.entries(amharicFields)) {
        if (variants.some(v => normalizedHeader.includes(v.toLowerCase()))) {
          mapping[field] = header;
          break;
        }
      }
    });

    setSelectedColumns(mapping);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        parseFile(file);
      } else {
        setErrors([{ row: 0, field: "file", message: "Please upload a CSV or Excel file" }]);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
      e.target.value = '';
    }
  };

  const handleColumnChange = (field: string, column: string) => {
    setSelectedColumns(prev => ({ ...prev, [field]: column }));
  };

  const validateData = (): ValidationError[] => {
    if (!parsedData) return [];
    
    const newErrors: ValidationError[] = [];
    const requiredFields = [
      "serialNumber", "subCity", "woreda", "numberOfCustomers",
      "communitiesReceived", "communityQuintals", "totalQuintals"
    ];
    const numericFields = [
      "serialNumber", "numberOfCustomers", "communitiesReceived",
      "institutionCustomers", "nursingMothersQuintals", "communityQuintals",
      "institutionQuintals", "totalQuintals"
    ];

    parsedData.rows.forEach((row, index) => {
      requiredFields.forEach(field => {
        const column = selectedColumns[field];
        if (column) {
          const colIndex = parsedData.headers.indexOf(column);
          if (colIndex >= 0 && colIndex < row.length) {
            const value = row[colIndex];
            
            if (!value || value.toString().trim() === "") {
              newErrors.push({ row: index + 1, field, message: `${field} is required` });
            }

            if (numericFields.includes(field) && value && isNaN(Number(value))) {
              newErrors.push({ row: index + 1, field, message: `${field} must be a number` });
            }
          }
        }
      });
    });

    return newErrors;
  };

  const handleImport = () => {
    if (!parsedData) return;

    const validationErrors = validateData();
    setErrors(validationErrors);

    const importedData: Partial<DataEntry>[] = parsedData.rows.map((row, index) => {
      const data: Partial<DataEntry> = {
        status: "ACTIVE",
        category: "General",
        value: 0,
      };
      
      const serialNumber = selectedColumns.serialNumber ? parseInt(row[parsedData.headers.indexOf(selectedColumns.serialNumber)]) || index + 1 : index + 1;
      const subCity = selectedColumns.subCity ? row[parsedData.headers.indexOf(selectedColumns.subCity)] || "" : "";
      const woreda = selectedColumns.woreda ? row[parsedData.headers.indexOf(selectedColumns.woreda)] || "" : "";
      const numberOfCustomers = selectedColumns.numberOfCustomers ? parseInt(row[parsedData.headers.indexOf(selectedColumns.numberOfCustomers)]) || 0 : 0;
      const communitiesReceived = selectedColumns.communitiesReceived ? parseInt(row[parsedData.headers.indexOf(selectedColumns.communitiesReceived)]) || 0 : 0;
      const institutionCustomers = selectedColumns.institutionCustomers ? parseInt(row[parsedData.headers.indexOf(selectedColumns.institutionCustomers)]) || 0 : 0;
      const nursingMothersQuintals = selectedColumns.nursingMothersQuintals ? parseFloat(row[parsedData.headers.indexOf(selectedColumns.nursingMothersQuintals)]) || 0 : 0;
      const communityQuintals = selectedColumns.communityQuintals ? parseFloat(row[parsedData.headers.indexOf(selectedColumns.communityQuintals)]) || 0 : 0;
      const institutionQuintals = selectedColumns.institutionQuintals ? parseFloat(row[parsedData.headers.indexOf(selectedColumns.institutionQuintals)]) || 0 : 0;
      const totalQuintals = selectedColumns.totalQuintals ? parseFloat(row[parsedData.headers.indexOf(selectedColumns.totalQuintals)]) || 0 : 0;

      data.title = `${subCity || "Unknown"} - ${woreda || "Unknown"}`;
      data.description = `Serial: ${serialNumber}, Customers: ${numberOfCustomers}, Communities: ${communitiesReceived}, Institution Customers: ${institutionCustomers}, Nursing Mothers: ${nursingMothersQuintals}, Community: ${communityQuintals}, Institution: ${institutionQuintals}, Total: ${totalQuintals} Quintals, Month: ${new Date().getMonth()}`;
      data.category = "Distribution";
      data.value = totalQuintals;

      return data;
    });

    setImportedCount(importedData.length);
    setImportStatus("success");
    onImport?.(importedData, parsedData?.fileName, parsedData?.fileType);
    
    if (currentFile) {
      saveFile(currentFile, importedData.length);
      setCurrentFile(null);
    }
  };

  const resetImport = () => {
    setParsedData(null);
    setSelectedColumns({});
    setErrors([]);
    setImportStatus("idle");
    setImportedCount(0);
    setCurrentFile(null);
  };

  const clearAllData = async () => {
    if (data.length > 0) {
      const allIds = data.map(d => d.id);
      deleteMultiple(allIds);
      localStorage.removeItem("nexus-data");
      localStorage.removeItem("dataEntries");
      setShowClearConfirm(false);
    }
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
            Data Import
          </h1>
          <p className="text-text-secondary mt-1">
            Import data from Excel (.xlsx, .xls) or CSV files.
          </p>
        </div>
        {data.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowClearConfirm(true)}
            className="text-red-400 border-red-400/30 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data ({data.length})
          </Button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {importStatus === "idle" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="p-12">
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "block border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                    dragActive
                      ? "border-accent-cyan bg-accent-cyan/10"
                      : "border-glass-border hover:border-accent-cyan/50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-accent-cyan" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-text-primary">
                        Drop your file here
                      </p>
                      <p className="text-sm text-text-muted mt-1">
                        or click to browse
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-text-muted">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">CSV</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="text-sm">Excel</span>
                      </div>
                    </div>
                    <Button variant="outline" type="button" onClick={(e) => e.stopPropagation()}>
                      Select File
                    </Button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                </label>

                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                  >
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error.message}
                      </p>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-[family-name:var(--font-outfit)]">
                  Expected File Format (Distribution Data)
                </CardTitle>
                <button
                  onClick={() => setIsEditingFormat(!isEditingFormat)}
                  className="text-sm text-accent-cyan hover:text-accent-cyan/80"
                >
                  {isEditingFormat ? "Done" : "Edit"}
                </button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border">
                        <th className="text-left p-3 text-text-muted font-medium">Column (English / አማርኛ)</th>
                        <th className="text-left p-3 text-text-muted font-medium">Type</th>
                        <th className="text-left p-3 text-text-muted font-medium">Required</th>
                        <th className="text-left p-3 text-text-muted font-medium">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileFormat.map((field, index) => (
                        <tr key={index} className="border-b border-glass-border">
                          <td className="p-3">
                            {isEditingFormat ? (
                              <input
                                type="text"
                                value={field.column}
                                onChange={(e) => {
                                  const updated = [...fileFormat];
                                  updated[index].column = e.target.value;
                                  setFileFormat(updated);
                                }}
                                className="w-full bg-transparent border border-glass-border rounded px-2 py-1 text-text-primary"
                              />
                            ) : (
                              <span className="text-text-primary">{field.column}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="text-text-muted">{field.type}</span>
                          </td>
                          <td className="p-3">
                            {isEditingFormat ? (
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => {
                                  const updated = [...fileFormat];
                                  updated[index].required = e.target.checked;
                                  setFileFormat(updated);
                                }}
                                className="w-4 h-4"
                              />
                            ) : (
                              <span className={field.required ? "text-accent-cyan" : "text-text-muted"}>
                                {field.required ? "Yes" : "No"}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {isEditingFormat ? (
                              <input
                                type="text"
                                value={field.example}
                                onChange={(e) => {
                                  const updated = [...fileFormat];
                                  updated[index].example = e.target.value;
                                  setFileFormat(updated);
                                }}
                                className="w-full bg-transparent border border-glass-border rounded px-2 py-1 text-text-primary"
                              />
                            ) : (
                              <span className="text-text-muted">{field.example}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {savedFiles.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-[family-name:var(--font-outfit)]">
                    Imported Files History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-glass-bg border border-glass-border"
                      >
                        <div className="flex items-center gap-3">
                          {file.type === "csv" ? (
                            <FileText className="w-5 h-5 text-accent-cyan" />
                          ) : (
                            <FileSpreadsheet className="w-5 h-5 text-accent-purple" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-text-primary">{file.name}</p>
                            <p className="text-xs text-text-muted">
                              {file.recordCount} records • {new Date(file.importedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(file)}
                            className="text-accent-cyan hover:text-accent-cyan/80"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSavedFile(index)}
                            className="text-red-400 hover:text-red-400/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {importStatus === "preview" && parsedData && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                  {parsedData.fileType === "csv" ? (
                    <FileText className="w-5 h-5 text-accent-cyan" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-accent-cyan" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{parsedData.fileName}</p>
                  <p className="text-sm text-text-muted">
                    {parsedData.rows.length} rows, {parsedData.headers.length} columns
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={resetImport}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-outfit)]">
                  Column Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { field: "serialNumber", label: "Serial Number (ተ.ቁ)", required: true },
                    { field: "subCity", label: "Sub-City (ክፍለ ከተማ)", required: true },
                    { field: "woreda", label: "Woreda (ወረዳ)", required: true },
                    { field: "numberOfCustomers", label: "Customers (የደንበኛ ብዛት)", required: true },
                    { field: "communitiesReceived", label: "Communities (ማህበረሰብ)", required: true },
                    { field: "institutionCustomers", label: "Institution Customers (ተቅዋም)", required: false },
                    { field: "nursingMothersQuintals", label: "Nursing Mothers (እናቶች)", required: false },
                    { field: "communityQuintals", label: "Community (ማህበረሰብ)", required: true },
                    { field: "institutionQuintals", label: "Institution (ተቅዋም)", required: false },
                    { field: "totalQuintals", label: "Total (ጠቅላላ)", required: true },
                  ].map(({ field, label, required }) => (
                    <div key={field} className="space-y-2">
                      <label className="text-sm text-text-secondary">
                        {label} {required && "*"}
                      </label>
                      <select
                        value={selectedColumns[field] || ""}
                        onChange={(e) => handleColumnChange(field, e.target.value)}
                        className="w-full h-11 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary"
                      >
                        <option value="">Select column</option>
                        {parsedData.headers.map(header => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-[family-name:var(--font-outfit)]">
                  Data Preview
                </CardTitle>
                <span className="text-sm text-text-muted">
                  Showing first 5 of {parsedData.rows.length} rows
                </span>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border">
                        {parsedData.headers.map(header => (
                          <th
                            key={header}
                            className="text-left p-3 text-text-muted font-medium whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b border-glass-border hover:bg-glass-bg">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-3 text-text-primary whitespace-nowrap">
                              {cell || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {errors.length > 0 && (
              <Card className="border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 font-[family-name:var(--font-outfit)]">
                    Validation Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {errors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                    {errors.length > 10 && (
                      <p className="text-sm text-text-muted">
                        ...and {errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={resetImport}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={errors.length > 0}>
                <Table className="w-4 h-4 mr-2" />
                Import {parsedData.rows.length} Rows
              </Button>
            </div>
          </motion.div>
        )}

        {importStatus === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-accent-cyan/30">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-accent-cyan/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-accent-cyan" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)]">
                  Import Successful!
                </h2>
                <p className="text-text-secondary mt-2">
                  {importedCount} records have been imported successfully.
                </p>
                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="outline" onClick={resetImport}>
                    Import More
                  </Button>
                  <Button onClick={() => window.location.href = "/dashboard/data"}>
                    <ChevronRight className="w-4 h-4 mr-2" />
                    View Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-bg-secondary border border-glass-border rounded-xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Clear All Data?
              </h3>
              <p className="text-text-secondary mb-6">
                This will permanently delete all {data.length} imported records. This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={clearAllData}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}