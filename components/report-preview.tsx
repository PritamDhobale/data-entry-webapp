"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, FileSpreadsheet, Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ReportPreviewProps {
  reportType: string;
  reportData: any[];
  isLoading: boolean;
  selectedClients: string[];
  dateRange: string;
  customDateRange?: { agreement_date: string; end_date: string };
  onDataUpdate?: (data: any[]) => void;
}

export function ReportPreview({
  reportType,
  reportData,
  isLoading,
  selectedClients,
  dateRange,
  customDateRange,
}: ReportPreviewProps) {
  const [activeView, setActiveView] = useState("preview");
  const [copied, setCopied] = useState(false);

  // Reset "copied" state automatically
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // 🔹 Format date range for header badge
  const getFormattedDateRange = () => {
    if (dateRange === "custom" && customDateRange) {
      return `${new Date(customDateRange.agreement_date).toLocaleDateString()} - ${new Date(
        customDateRange.end_date
      ).toLocaleDateString()}`;
    }

    switch (dateRange) {
      case "last30":
        return "Last 30 Days";
      case "last90":
        return "Last 90 Days";
      case "lastYear":
        return "Last Year";
      default:
        return "Custom Range";
    }
  };

  // 🔹 Handle Copy
  const handleCopy = () => {
    if (reportData && Array.isArray(reportData)) {
      const text = JSON.stringify(reportData, null, 2);
      navigator.clipboard.writeText(text);
      setCopied(true);
    }
  };

  // 🔹 Export to Excel
  const handleExportExcel = () => {
    if (!reportData?.length) return;
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "company_report.xlsx");
  };

  // 🔹 Export to PDF
  const handleExportPDF = () => {
    if (!reportData?.length) return;

    const doc = new jsPDF();
    doc.text("Company Report", 14, 10);

    const tableData = reportData.map((c) => [
      c.account_name || "-",
      c.website_city || "-",
      c.website_state || "-",
      c.website || "-",
    ]);

    (doc as any).autoTable({
      head: [["Company Name", "City", "State", "Website"]],
      body: tableData,
      startY: 20,
    });

    doc.save("company_report.pdf");
  };

  // 🔹 Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
    </div>
  );

  // 🔹 Table preview rendering
  const renderPreview = () => {
    if (isLoading) return <LoadingSkeleton />;

    if (!reportData?.length || selectedClients.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Data Available</h3>
          <p className="text-sm text-gray-400 mt-2">
            {selectedClients.length === 0
              ? "Please select at least one company to generate a report."
              : "No data available for the selected criteria."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Company Report Preview</h3>
          <Badge variant="outline">{getFormattedDateRange()}</Badge>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  City
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  State
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  Website
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {reportData.map((company, index) => (
                <tr key={company.id}>
                  <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {company.account_name || "-"}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{company.website_city || "-"}</td>
                  <td className="px-4 py-2 text-gray-700">{company.website_state || "-"}</td>
                  <td className="px-4 py-2 text-blue-600 underline">
                    <a href={company.website} target="_blank" rel="noreferrer">
                      {company.website || "N/A"}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.length > 50 && (
          <p className="text-sm text-gray-500 italic text-center">
            Showing first 50 records. Download full report for complete data.
          </p>
        )}
      </div>
    );
  };

  // 🔹 JSON view rendering
  const renderJsonView = () => {
    if (isLoading) return <LoadingSkeleton />;

    if (!reportData?.length) {
      return (
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Data Available</h3>
          <p className="text-sm text-gray-400 mt-2">
            Please select at least one company to generate a report.
          </p>
        </div>
      );
    }

    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="absolute right-0 top-0 m-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </>
          )}
        </Button>
        <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[400px] text-xs">
          {JSON.stringify(reportData, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>

            {/* Export buttons */}
            {reportData?.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="text-[#112B74] border-[#112B74]"
                >
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="text-[#112B74] border-[#112B74]"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="preview" className="mt-0">
            {renderPreview()}
          </TabsContent>

          <TabsContent value="json" className="mt-0">
            {renderJsonView()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
