"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Building2,
  MapPin,
  Package,
  Users,
  ChevronDown,
  Printer,
  Loader2,
  RefreshCw,
  Database,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/components/providers/DataContext";

interface DistributionData {
  subCity: string;
  woreda: string;
  numberOfCustomers: number;
  communitiesReceived: number;
  institutionCustomers: number;
  nursingMothersQuintals: number;
  communityQuintals: number;
  institutionQuintals: number;
  totalQuintals: number;
}

const months = [
  "ጥር", "ፈጋ", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ",
  "ነሐሴ", "መስከረም", "ጥቅምት", "ሕዳር", "ታህሳስ", "ጥሪ"
];

export default function ReportPage() {
  const { data } = useData();
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [reportType, setReportType] = useState<"subcity" | "woreda">("subcity");
  const [selectedSubCity, setSelectedSubCity] = useState("");
  const [selectedWoreda, setSelectedWoreda] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefresh(new Date());
  }, []);
  const [dataStats, setDataStats] = useState<{
    totalRecords: number;
    subCityCount: number;
    woredaCount: number;
    totalQuintals: number;
    totalCustomers: number;
  }>({ totalRecords: 0, subCityCount: 0, woredaCount: 0, totalQuintals: 0, totalCustomers: 0 });

  const refreshData = () => {
    setLastRefresh(new Date());
    const stored = localStorage.getItem("nexus-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("Data refreshed:", parsed.length, "records");
      } catch (e) {
        console.error("Failed to refresh:", e);
      }
    }
  };

  const distributionData = useMemo(() => {
    const parsed = data
      .filter(d => d.category === "Distribution")
      .map(d => {
        const parts = d.title?.split(" - ") || [];
        const desc = d.description || "";
        
        const customersMatch = desc.match(/Customers:\s*(\d+)/);
        const communitiesMatch = desc.match(/Communities:\s*(\d+)/);
        const totalMatch = desc.match(/Total:\s*([\d.]+)/);
        
        const subCityValue = parts[0]?.trim();
        const woredaValue = parts[1]?.trim();
        
        return {
          subCity: subCityValue || "N/A",
          woreda: woredaValue || "N/A",
          numberOfCustomers: customersMatch ? parseInt(customersMatch[1]) : 0,
          communitiesReceived: communitiesMatch ? parseInt(communitiesMatch[1]) : 0,
          institutionCustomers: 0,
          nursingMothersQuintals: 0,
          communityQuintals: 0,
          institutionQuintals: 0,
          totalQuintals: totalMatch ? parseFloat(totalMatch[1]) : (d.value || 0),
        } as DistributionData;
      });
    
    const stats = {
      totalRecords: parsed.length,
      subCityCount: new Set(parsed.map(d => d.subCity)).size,
      woredaCount: new Set(parsed.map(d => d.woreda)).size,
      totalQuintals: parsed.reduce((sum, d) => sum + d.totalQuintals, 0),
      totalCustomers: parsed.reduce((sum, d) => sum + d.numberOfCustomers, 0),
    };
    setDataStats(stats);
    
    return parsed;
  }, [data]);

  const availableSubCities = useMemo(() => {
    const cities = new Set(distributionData.map(d => d.subCity));
    return Array.from(cities).sort();
  }, [distributionData]);

  const availableWoredas = useMemo(() => {
    if (!selectedSubCity) return [];
    const woredas = new Set(
      distributionData
        .filter(d => d.subCity === selectedSubCity)
        .map(d => d.woreda)
    );
    return Array.from(woredas).sort();
  }, [distributionData, selectedSubCity]);

  const subCityData = useMemo(() => {
    if (!selectedSubCity) return null;
    return distributionData.filter(d => d.subCity === selectedSubCity);
  }, [distributionData, selectedSubCity]);

  const woredaData = useMemo(() => {
    if (!selectedSubCity || !selectedWoreda) return null;
    return distributionData.filter(d => d.subCity === selectedSubCity && d.woreda === selectedWoreda);
  }, [distributionData, selectedSubCity, selectedWoreda]);

  const generateSubCityReport = () => {
    if (!subCityData) return null;
    
    const total = subCityData.reduce((acc, d) => ({
      customers: acc.customers + d.numberOfCustomers,
      communities: acc.communities + d.communitiesReceived,
      institutionCustomers: acc.institutionCustomers + d.institutionCustomers,
      nursingMothers: acc.nursingMothers + d.nursingMothersQuintals,
      community: acc.community + d.communityQuintals,
      institution: acc.institution + d.institutionQuintals,
      total: acc.total + d.totalQuintals,
    }), { customers: 0, communities: 0, institutionCustomers: 0, nursingMothers: 0, community: 0, institution: 0, total: 0 });

    const received = total.total + 50;
    const remaining = 50;

    return `
ለ ${selectedSubCity} ንግድ ጽሕፈት ቤት
አ.አ

ጉዳዩ፡- በ${months[selectedMonth]} ወር በ${selectedSubCity} ክፍለ ከተማ የተሰራ ስራ ሪፖርት

የዚህ ወር ኮታ ${received} ኩንታል ከማእከላዊ ተቋም ተረክበናል። ከዚህ ውስጥ ጠቅላላ የተረከቡ ደንበኞች ${total.customers} ደንበኞች ነው። ለማህበረሰብ በኩንታል ${total.community} ኩንታል ተሰራጨ። ለተቋም በኩንታል ${total.institution} ኩንታል ተሰራጨ እና ${total.institutionCustomers} ደንበኞች ተጠቃሚ ሆነዋል። ለምግብ እናቶች ${total.nursingMothers} ኩንታል ተሰራጨ። ጠቅላላ የተሰራጨው ምርት ${total.total} ኩንታል ነው። ቀሪ ምርት ${remaining} ኩንታል በድምፅ ቤት ውስጥ ይገኛል።

ከሰላምታ ጋር።

የቅርንጫፍ ስራ አስኪያጅ
___________________
___________________

ግልባጭ
• ለፋይል
`;
  };

  const generateWoredaReport = () => {
    if (!woredaData) return null;
    
    const total = woredaData.reduce((acc, d) => ({
      customers: acc.customers + d.numberOfCustomers,
      beneficiaries: acc.beneficiaries + d.communitiesReceived,
      total: acc.total + d.totalQuintals,
    }), { customers: 0, beneficiaries: 0, total: 0 });

    const letter = `
ለ ${selectedSubCity} ክፍለ ከተማ ወረዳ ${selectedWoreda} ንግድ ጽሕፈት ቤት
አ.አ

ጉዳዩ፡- የ${months[selectedMonth]} ወር ኮታ የተሰራጨ ሪፖርት ስላሳወቅ

የዚህ ወር ኮታ ተረክበናል። ጠቅላላ የተመዘገቡ ደንበኞች ${total.customers} ናቸው። ለማህበረሰብ በቤት በቤት የተሰራጨ ሲሆን ጠቅላላ የተሰራጨ ምርት ${total.total} ኩንታል ነው። ዝርዝር ሪፖርትና ሰንጠረዡ ይያያዛል።

ከሰላምታ ጋር።

የቅርንጫፍ ስራ አስኪያጅ
___________________
___________________

ግልባጭ
• ለፋይል
`;

    const tableRows = woredaData.map((d, i) => (
      <tr key={i}>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>ወረዳ - {selectedWoreda}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>ዙር - {i + 1}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{d.numberOfCustomers}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{d.communitiesReceived}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{d.totalQuintals}</td>
      </tr>
    ));

    return { letter, tableRows, total };
  };

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setReportGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-text-primary">
          Report Generator
        </h1>
        <p className="text-text-secondary mt-1">
          Generate official distribution reports for Sub-Cities and Woredas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-outfit)] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Report Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setReportType("subcity"); setSelectedWoreda(""); }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      reportType === "subcity"
                        ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                        : "bg-glass-bg text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Sub-City (ክፍለ ከተማ)
                  </button>
                  <button
                    onClick={() => setReportType("woreda")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      reportType === "woreda"
                        ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                        : "bg-glass-bg text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Woreda (ወረዳ)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Month (ወር)</label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full h-11 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary appearance-none pr-10"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-text-secondary flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Sub-City (ክፍለ ከተማ)
                </label>
                <div className="relative">
                  <select
                    value={selectedSubCity}
                    onChange={(e) => { setSelectedSubCity(e.target.value); setSelectedWoreda(""); }}
                    className="w-full h-11 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary appearance-none pr-10"
                    disabled={availableSubCities.length === 0}
                  >
                    <option value="">
                      {availableSubCities.length > 0 ? "Select Sub-City" : "No data available"}
                    </option>
                    {availableSubCities.map(subCity => (
                      <option key={subCity} value={subCity}>{subCity}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              {reportType === "woreda" && (
                <div className="space-y-2">
                  <label className="text-sm text-text-secondary flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Woreda (ወረዳ)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedWoreda}
                      onChange={(e) => setSelectedWoreda(e.target.value)}
                      className="w-full h-11 rounded-lg border border-glass-border bg-bg-secondary px-4 text-sm text-text-primary appearance-none pr-10"
                      disabled={!selectedSubCity || availableWoredas.length === 0}
                    >
                      <option value="">
                        {availableWoredas.length > 0 ? "Select Woreda" : "No woredas available"}
                      </option>
                      {availableWoredas.map(woreda => (
                        <option key={woreda} value={woreda}>{woreda}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading || (reportType === "woreda" && !selectedWoreda) || !selectedSubCity || distributionData.length === 0}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[family-name:var(--font-outfit)]">Data Summary</CardTitle>
            <Button variant="ghost" size="sm" onClick={refreshData} className="gap-1">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
              <Database className="w-5 h-5 text-accent-cyan" />
              <div>
                <p className="text-sm text-text-muted">Data Source</p>
                <p className="text-sm font-medium text-accent-cyan">Import Page Connected</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-glass-bg">
                <p className="text-xs text-text-muted">Total Records</p>
                <p className="text-xl font-bold text-accent-cyan">{dataStats.totalRecords}</p>
              </div>
              <div className="p-3 rounded-lg bg-glass-bg">
                <p className="text-xs text-text-muted">Sub-Cities</p>
                <p className="text-xl font-bold text-text-primary">{dataStats.subCityCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-glass-bg">
                <p className="text-xs text-text-muted">Woredas</p>
                <p className="text-xl font-bold text-text-primary">{dataStats.woredaCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-glass-bg">
                <p className="text-xs text-text-muted">Total Quintals</p>
                <p className="text-xl font-bold text-accent-purple">{dataStats.totalQuintals.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-glass-bg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-text-muted" />
                <p className="text-xs text-text-muted">Total Customers</p>
              </div>
              <p className="text-lg font-bold text-text-primary">{dataStats.totalCustomers.toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-glass-border">
              <span>Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : "Loading..."}</span>
            </div>

            {distributionData.length === 0 && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">No Data Available</p>
                    <p className="text-xs text-yellow-400/70 mt-1">
                      Import distribution data from the Import page to generate reports.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {distributionData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-outfit)] flex items-center gap-2">
                <Database className="w-5 h-5" />
                Imported Data Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-glass-border">
                      <th className="text-left p-3 text-text-muted font-medium">Sub-City</th>
                      <th className="text-left p-3 text-text-muted font-medium">Woreda</th>
                      <th className="text-right p-3 text-text-muted font-medium">Customers</th>
                      <th className="text-right p-3 text-text-muted font-medium">Communities</th>
                      <th className="text-right p-3 text-text-muted font-medium">Total (Quintals)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributionData.slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-b border-glass-border hover:bg-glass-bg">
                        <td className="p-3 text-text-primary">{item.subCity}</td>
                        <td className="p-3 text-text-secondary">{item.woreda}</td>
                        <td className="p-3 text-right text-text-primary">{item.numberOfCustomers}</td>
                        <td className="p-3 text-right text-text-primary">{item.communitiesReceived}</td>
                        <td className="p-3 text-right text-accent-cyan font-medium">{item.totalQuintals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {distributionData.length > 10 && (
                  <p className="text-sm text-text-muted text-center py-3">
                    Showing 10 of {distributionData.length} records
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AnimatePresence>
        {reportGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="print:border-0 print:shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-[family-name:var(--font-outfit)]">
                  Generated Report - {months[selectedMonth]} {reportType === "woreda" ? `- ${selectedWoreda}` : ""}
                </CardTitle>
                <Button variant="outline" onClick={handlePrint} className="gap-2 print:hidden">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-white text-gray-900 p-8 rounded-lg font-noto">
                  {reportType === "subcity" ? (
                    <pre className="whitespace-pre-wrap font-noto text-sm leading-relaxed">
                      {generateSubCityReport()}
                    </pre>
                  ) : (
                    <div>
                      <pre className="whitespace-pre-wrap font-noto text-sm leading-relaxed mb-6">
                        {generateWoredaReport()?.letter}
                      </pre>
                      <div className="mt-6">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-accent-cyan text-white">
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>የተሰራበት ወረዳ</th>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ስርጭት መርሃግብር</th>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>የደንበኞች ብዛት</th>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ምርት የተረከቡ ደንበኞች ብዛት</th>
                              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ጠቅላላ በኩንታል</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generateWoredaReport()?.tableRows}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}