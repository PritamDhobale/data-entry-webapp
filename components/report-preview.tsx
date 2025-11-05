"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, FileSpreadsheet, Printer, Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

interface ReportPreviewProps {
  reportType: string;
  reportData: any;
  isLoading: boolean;
  selectedClients: string[];
  dateRange: string;
  customDateRange?: { agreement_date: string; end_date: string };
  onDataUpdate?: (data: any[]) => void; // 👈 NEW PROP
}


export function ReportPreview({
  reportType,
  reportData,
  isLoading,
  selectedClients,
  dateRange,
  customDateRange,
  onDataUpdate,
}: ReportPreviewProps) {
  const [activeView, setActiveView] = useState("preview");
  const [copied, setCopied] = useState(false);
  // --- Editable invoice fields ---
const [editableData, setEditableData] = useState<any[]>([]);

useEffect(() => {
  if (Array.isArray(reportData)) {
    const initialized = reportData.map((row) => ({
      ...row,
      servicePct: row.servicePct ?? 0,
      perEv: row.perEv ?? 0,
      perPa: row.perPa ?? 0,
      discount: row.discount ?? 0,
    }));
    setEditableData(initialized);
  }
}, [reportData]);

const handleInvoiceChange = (index: number, field: string, value: number) => {
  let updated = [...editableData];

  // --- If changing one of the common fields, update all rows ---
  if (["servicePct", "perEv", "perPa"].includes(field)) {
    updated = updated.map((row) => ({
      ...row,
      [field]: value,
    }));
  } else {
    // Update only the targeted row for other fields (like discount)
    updated[index] = { ...updated[index], [field]: value };
  }

  // --- Recalculate invoice + final total for all rows ---
  updated = updated.map((row) => {
    const servicePct = parseFloat(row.servicePct) || 0;
    const perEv = parseFloat(row.perEv) || 0;
    const perPa = parseFloat(row.perPa) || 0;
    const discount = parseFloat(row.discount) || 0;

    const totalPosted = parseFloat(row.total_posted_amt) || 0;
    const totalEv = parseFloat(row.total_ev) || 0;
    const totalPa = parseFloat(row.total_pa) || 0;

    const invoiceAmount = totalPosted * (servicePct / 100);
    const clientFinalTotal = invoiceAmount + totalEv * perEv + totalPa * perPa - discount;

    return {
      ...row,
      invoice_amount: invoiceAmount,
      client_final_total: clientFinalTotal,
    };
  });

  setEditableData(updated);
  if (onDataUpdate) onDataUpdate(updated); // keep parent in sync
};

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Format date range for display
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

  // Handle copy to clipboard
  const handleCopy = () => {
    if (reportData) {
      // In a real app, this would format the data properly
      const textData = JSON.stringify(reportData, null, 2);
      navigator.clipboard.writeText(textData);
      setCopied(true);
    }
  };

  // Generate mock report data based on report type
  const generateMockReportData = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    if (!reportData || selectedClients.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Data Available</h3>
          <p className="text-sm text-gray-400 mt-2">
            {selectedClients.length === 0
              ? "Please select at least one client to generate a report."
              : "No data available for the selected criteria."}
          </p>
        </div>
      );
    }

    // Different preview based on report type
    switch (reportType) {
      case "client-list":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Client List Report</h3>
              <Badge variant="outline">{getFormattedDateRange()}</Badge>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Practice Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Primary Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((client: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.UniqueID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.practice_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.primary_contact_first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant={client.client_status === "active" ? "default" : "secondary"}>
                          {client.client_status === "active" ? "active" : "inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reportData.length > 50 && (
              <p className="text-sm text-gray-500 italic text-center">
                Showing 5 of {reportData.length} records. Download the full report to see all data.
              </p>
            )}
          </div>
        );

      case "agreement-list":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Agreement List Report</h3>
              <Badge variant="outline">{getFormattedDateRange()}</Badge>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((agreement: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {agreement.UniqueID || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agreement.clients?.practice_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agreement.agreement_date ? new Date(agreement.agreement_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agreement.end_date ? new Date(agreement.end_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge
                          variant={
                            agreement.status === "active"
                              ? "default"
                              : agreement.status === "expiring-soon"
                              ? "outline"
                              : "secondary"
                          }
                          className={agreement.status === "expiring-soon" ? "text-amber-600 border-amber-600" : undefined}
                        >
                          {agreement.status === "active"
                            ? "active"
                            : agreement.status === "expiring-soon"
                            ? "Expiring Soon"
                            : "Expired"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reportData.length > 5 && (
              <p className="text-sm text-gray-500 italic text-center">
                Showing 5 of {reportData.length} records. Download the full report to see all data.
              </p>
            )}
          </div>
        );

        case "service-list":
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Service List Report</h3>
        <Badge variant="outline">{getFormattedDateRange()}</Badge>
      </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practice Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((service: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
  {service?.UniqueID ?? "N/A"}
</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.practice_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.services && typeof service.services === "string"
                    ? service.services
                    : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {reportData.length > 5 && (
        <p className="text-sm text-gray-500 italic text-center">
          Showing 5 of {reportData.length} records. Download the full report to see all data.
        </p>
      )}
    </div>
  );

      case "invoice-list":
  // --- Group report data by client ---
  const groupedData: Record<string, any[]> = editableData.reduce((acc, row) => {
    const key = `${row.practice_name || "Unknown Client"}_${row.UniqueID || "N/A"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedData).map(([clientKey, rows]) => {
        const [clientName, clientId] = clientKey.split("_");

        return (
          <div key={clientKey} className="border border-gray-200 rounded-lg p-4 shadow-sm">
            {/* ---- Client Header ---- */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-gray-700">
                {clientName} ({clientId})
              </h3>
              <Badge variant="outline">Invoice Summary</Badge>
            </div>

            {/* ---- Client Table ---- */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Month",
                      "Year",
                      "Total Posted Amt",
                      "Service %",
                      "Invoice Amount",
                      "Total EV",
                      "$ per EV",
                      "Total PA",
                      "$ per PA",
                      "Notes",
                      "Discount ($)",
                      "Client Final Total",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {row.month_label || row.month || "All"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{row.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        ${row.total_posted_amt?.toFixed(2) ?? "0.00"}
                      </td>

                      {/* Editable Service % */}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <Input
                          type="number"
                          value={row.servicePct}
                          onChange={(e) =>
                            handleInvoiceChange(index, "servicePct", Number(e.target.value))
                          }
                          className="w-20 text-center"
                        />
                      </td>

                      <td className="px-4 py-3 text-sm text-green-600">
                        ${row.invoice_amount?.toFixed(2) ?? "0.00"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500">{row.total_ev ?? 0}</td>

                      {/* Editable per EV */}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <Input
                          type="number"
                          value={row.perEv}
                          onChange={(e) =>
                            handleInvoiceChange(index, "perEv", Number(e.target.value))
                          }
                          className="w-20 text-center"
                        />
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500">{row.total_pa ?? 0}</td>

                      {/* Editable per PA */}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <Input
                          type="number"
                          value={row.perPa}
                          onChange={(e) =>
                            handleInvoiceChange(index, "perPa", Number(e.target.value))
                          }
                          className="w-20 text-center"
                        />
                      </td>

                      {/* Notes column — only display if exists */}
                      <td className="px-4 py-3 text-sm text-gray-500 italic">
                        {row.notes ? row.notes : ""}
                      </td>

                      {/* Editable Discount */}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <Input
                          type="number"
                          value={row.discount}
                          onChange={(e) =>
                            handleInvoiceChange(index, "discount", Number(e.target.value))
                          }
                          className="w-24 text-center"
                        />
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        ${row.client_final_total?.toFixed(2) ?? "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );


      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Report Preview</h3>
            <p className="text-sm text-gray-400 mt-2">Select a report type to preview data.</p>
          </div>
        );
    }
  };

  // Generate JSON view
  const generateJsonView = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    if (!reportData || selectedClients.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Data Available</h3>
          <p className="text-sm text-gray-400 mt-2">
            {selectedClients.length === 0
              ? "Please select at least one client to generate a report."
              : "No data available for the selected criteria."}
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
          disabled={!reportData}
        >
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? "Copied" : "Copy"}
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
              {/* <TabsTrigger value="json">JSON</TabsTrigger> */}
            </TabsList>
          </div>

          <TabsContent value="preview" className="mt-0">
            {generateMockReportData()}
          </TabsContent>

          <TabsContent value="json" className="mt-0">
            {generateJsonView()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
