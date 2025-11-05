"use client"
 
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, FileSpreadsheet, Eye, Search, X } from "lucide-react"
import { ReportPreview } from "@/components/report-preview"
import { SchemaReference } from "@/components/schema-reference"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// import { supabase } from "@/lib/supabaseClient"
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";
 
 
interface ReportsGeneratorProps {
  type: "client" | "agreement" | "service" | "financial" | "invoice";
}

// Report types based on the selected category
const reportTypes = {
  client: [
    { id: "client-list", name: "Client List" },
    // { id: "client-status", name: "Client Status Report" },
  ],
  agreement: [
    { id: "agreement-list", name: "Agreement List" },
    // { id: "agreement-expiry", name: "Agreement Expiry Report" },
  ],
  service: [
    { id: "service-list", name: "Service List" },
    // { id: "service-rates", name: "Service Rates Report" },
  ],
  financial: [
    { id: "financial-summary", name: "Financial Summary" },
  ],
  invoice: [
    { id: "invoice-list", name: "Invoice List" },]
}
 
export function ReportsGenerator({ type }: ReportsGeneratorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [reportFormat, setReportFormat] = useState("pdf")
  const [dateRange, setDateRange] = useState("last30")
  const [customDateRange, setCustomDateRange] = useState({
    agreement_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  })
  const [selectedReportType, setSelectedReportType] = useState(reportTypes[type][0].id)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [showSchemaReference, setShowSchemaReference] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const [clientStatusFilter, setClientStatusFilter] = useState("both")
 
  const [clients, setClients] = useState<any[]>([])
  const [reportType, setReportType] = useState("client-list"); // if using state
  // add these
  // helper years (last 7 yrs + All)

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/reports/get");
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      setClients(data);

      if (reportType === "agreement-list") {
        const flattenedAgreements = data.flatMap((client) =>
          (client.agreements || []).map((agreement: any) => ({
            ...agreement,
            practice_name: client.practice_name,
            UniqueID: client.UniqueID,
          }))
        );
        setReportData(flattenedAgreements);
      } else if (reportType === "service-list") {
        const flattenedServices = data.flatMap((client) =>
          (client.services || []).map((service: any) => ({
            ...service,
            practice_name: client.practice_name,
            UniqueID: client.UniqueID,
            services: service.service_name || "N/A",
          }))
        );
        setReportData(flattenedServices);
      } else {
        // client-list
        setReportData(data.map((client: any) => ({
          ...client,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch reports data:", error);
    }
  };

  fetchData();
}, [reportType]); // ✅ use correct variable



 
  // Filter clients based on search term
  const filteredClients = clients.filter((client) => {
  const matchesSearch =
    client.practice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.UniqueID.toLowerCase().includes(searchTerm.toLowerCase())


  const matchesStatus =
    clientStatusFilter === "both" || client.client_status === clientStatusFilter

  const agreement = client.agreements?.[0]
  const agreementDate = agreement ? new Date(agreement.agreement_date) : null
  const today = new Date()

  let matchesDate = true
  if (agreementDate) {
    if (dateRange === "last30") {
      const past30 = new Date(today)
      past30.setDate(today.getDate() - 30)
      matchesDate = agreementDate >= past30 && agreementDate <= today
    } else if (dateRange === "last90") {
      const past90 = new Date(today)
      past90.setDate(today.getDate() - 90)
      matchesDate = agreementDate >= past90 && agreementDate <= today
    } else if (dateRange === "lastYear") {
      const pastYear = new Date(today)
      pastYear.setFullYear(today.getFullYear() - 1)
      matchesDate = agreementDate >= pastYear && agreementDate <= today
    } else if (dateRange === "custom") {
      const start = new Date(customDateRange.agreement_date)
      const end = new Date(customDateRange.end_date)

      if (!agreementDate) {
        matchesDate = false
      } else {
        matchesDate = agreementDate >= start && agreementDate <= end
      }
    }
  }

  return matchesSearch && matchesStatus && matchesDate
})

 
  const exportReportToPDF = () => {
    const doc = new jsPDF();
 
    // Add Title
    doc.text("Client Report", 10, 10);
 
    // Prepare the data
    const tableData = reportData.map((client: any) => [
      client.client_id,
      client.practice_name,
      client.primary_contact_first_name,
      client.client_status === "active" ? "Active" : "Inactive"
    ]);
 
    // Add the table
    (doc as any).autoTable({
      head: [["Client ID", "Practice Name", "Primary Contact", "Status"]],
      body: tableData,
    });
 
    // Save the PDF
    doc.save("client-report.pdf");
  };
 
 
  // Toggle client selection
  const toggleClient = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    )
  }
 
  const exportReportToCSV = () => {
    let csvData;
  
    switch (selectedReportType) {
      case "client-list":
  csvData = Papa.unparse(reportData.map((client: any) => ({
    // IDENTIFIERS (no Client ID, keep Unique ID)
    "Unique ID": client.UniqueID,
    "Practice Name": client.practice_name,
    "DBA": client.dba || "N/A",
    "Client Code": client.code || "",

    // STATUS / CATEGORY
    "Status": client.client_status, // active / inactive
    // If you have owner_code in this payload, prefer it; otherwise fall back:
    "Category": client.owner_code || client.category_id || "",

    // CONTACT SIGNER (Primary)
    "Contact Signer - Last Name": client.primary_contact_last_name || "",
    "Contact Signer - First Name": client.primary_contact_first_name || "",
    "Contact Signer - Title": client.primary_contact_title || "",
    "Contact Signer - Direct Phone": client.primary_contact_phone || "",
    "Contact Signer - Direct Email": client.primary_contact_email || "",

    // ADMIN & BILLING
    "Admin & Billing - Last Name": client.admin_contact_last_name || "",
    "Admin & Billing - First Name": client.admin_contact_first_name || "",
    "Admin & Billing - Title": client.admin_contact_title || "",
    "Admin & Billing - Direct Phone": client.admin_contact_phone || "",
    "Admin & Billing - Direct Email": client.admin_contact_email || "",

    // OTHER (fill in…)
    "Other - Last Name": client.authorized_rep_last_name || "",
    "Other - First Name": client.authorized_rep_first_name || "",
    "Other - Title": client.authorized_rep_title || "",
    "Other - Direct Phone": client.authorized_rep_phone || "",
    "Other - Direct Email": client.authorized_rep_email || "",

    // CORPORATE INFO
    "Street Address": client.street_address || "",
    "City": client.city || "",
    "State": client.state || "",
    "ZIP": client.zip || "",
    "State of Formation": client.state_of_formation || "",
    "EHR": client.current_ehr || "",
    "Type of Entity": client.type_of_entity || "",
    "Website": client.website || "",

    // ROLLED-UP TEXT
    "Agreements":
      client.agreements?.map((a: any) =>
        `Agreement: ${a.agreement_date || ""}, Commencement: ${a.commencement_date || ""}, Term: ${a.term || ""}, End: ${a.end_date || ""}, Status: ${a.status || ""}`
      ).join(" | ") || "N/A",

    "Services":
      client.services?.map((s: any) =>
        `${s.service_name || "N/A"} (Rate: ${s.rate || "N/A"}, Min: ${s.minimum || "N/A"}, NPP: ${s.npp_status || "N/A"})`
      ).join(" | ") || "N/A"
  })));
  break;  
      default:
        csvData = Papa.unparse([]);
    }
  
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${selectedReportType}.csv`);
  };
  
 
  const exportReportToExcel = () => {
    let sheetData;
  
    switch (selectedReportType) {
      case "client-list":
  sheetData = reportData.map((client: any) => ({
    "Unique ID": client.UniqueID,
    "Practice Name": client.practice_name,
    "DBA": client.dba || "N/A",
    "Client Code": client.code || "",
    "Status": client.client_status,
    "Category": client.owner_code || client.category_id || "",

    "Contact Signer - Last Name": client.primary_contact_last_name || "",
    "Contact Signer - First Name": client.primary_contact_first_name || "",
    "Contact Signer - Title": client.primary_contact_title || "",
    "Contact Signer - Direct Phone": client.primary_contact_phone || "",
    "Contact Signer - Direct Email": client.primary_contact_email || "",

    "Admin & Billing - Last Name": client.admin_contact_last_name || "",
    "Admin & Billing - First Name": client.admin_contact_first_name || "",
    "Admin & Billing - Title": client.admin_contact_title || "",
    "Admin & Billing - Direct Phone": client.admin_contact_phone || "",
    "Admin & Billing - Direct Email": client.admin_contact_email || "",

    "Other (fill in...) - Last Name": client.authorized_rep_last_name || "",
    "Other (fill in...) - First Name": client.authorized_rep_first_name || "",
    "Other (fill in...) - Title": client.authorized_rep_title || "",
    "Other (fill in...) - Direct Phone": client.authorized_rep_phone || "",
    "Other (fill in...) - Direct Email": client.authorized_rep_email || "",

    "Street Address": client.street_address || "",
    "City": client.city || "",
    "State": client.state || "",
    "ZIP": client.zip || "",
    "State of Formation": client.state_of_formation || "",
    "EHR": client.current_ehr || "",
    "Type of Entity": client.type_of_entity || "",
    "Website": client.website || "",

    "Agreements":
      client.agreements?.map((a: any) =>
        `Agreement: ${a.agreement_date || ""}, Commencement: ${a.commencement_date || ""}, Term: ${a.term || ""}, End: ${a.end_date || ""}, Status: ${a.status || ""}`
      ).join(" | ") || "N/A",

    "Services":
      client.services?.map((s: any) =>
        `${s.service_name || "N/A"} (Rate: ${s.rate || "N/A"}, Min: ${s.minimum || "N/A"}, NPP: ${s.npp_status || "N/A"})`
      ).join(" | ") || "N/A"
  }));
  break;
      default:
        sheetData = [];
    }
  
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${selectedReportType}.xlsx`);
  };  
 
  const exportReport = () => {
    // Export to PDF, CSV, or Excel based on selected format
    switch (reportFormat) {
      case "pdf":
        exportReportToPDF();
        break;
      case "csv":
        exportReportToCSV();
        break;
      case "excel":
        exportReportToExcel();
        break;
      default:
        console.error("Unsupported format");
        break;
    }
  };
 
 
  // Clear report data
  const clearReport = () => {
    setReportData(null)
    setSelectedClients([])
    setSearchTerm("")
  }
 
  // Handle bulk client selection
  const handleBulkSelection = (select: boolean) => {
    if (select) {
      setSelectedClients(filteredClients.map((client) => client.client_id))
    } else {
      setSelectedClients([])
    }
  }
 
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="preview" disabled={!reportData}>
            Preview Report
          </TabsTrigger>
        </TabsList>
 
        <TabsContent value="generate" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={selectedReportType} onValueChange={(value: string | string[]) => setSelectedReportType(value as string)}
>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes[type].map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
 
              <div className="space-y-2">
  <Label htmlFor="date-range">Date Range</Label>
  <Select
    value={dateRange}
    onValueChange={(value: string | string[]) => setDateRange(value as string)}
  >
    <SelectTrigger id="date-range">
      <SelectValue placeholder="Select date range" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="last30">Last 30 Days</SelectItem>
      <SelectItem value="last90">Last 90 Days</SelectItem>
      <SelectItem value="lastYear">Last Year</SelectItem>
      <SelectItem value="custom">Custom Range</SelectItem>
    </SelectContent>
  </Select>
</div>

{/* ✅ End of new Year/Month block */}

{dateRange === "custom" && (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="start-date">Start Date</Label>
      <Input
        id="start-date"
        type="date"
        value={customDateRange.agreement_date}
        onChange={(e) =>
          setCustomDateRange((prev) => ({ ...prev, agreement_date: e.target.value }))
        }
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="end-date">End Date</Label>
      <Input
        id="end-date"
        type="date"
        value={customDateRange.end_date}
        onChange={(e) =>
          setCustomDateRange((prev) => ({ ...prev, end_date: e.target.value }))
        }
      />
    </div>
  </div>
)}

              <div className="space-y-2">
                <Label htmlFor="format">Report Format</Label>
                <Select value={reportFormat} onValueChange={(value: string | string[]) => setReportFormat(value as string)}
>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="pdf">PDF</SelectItem> */}
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-status">Client Status</Label>
                <Select
                  value={clientStatusFilter}
                  onValueChange={(value: string | string[]) =>
                    setClientStatusFilter(value as string)
                  }
                >
                  <SelectTrigger id="client-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
 
              <div className="pt-4">
                <Button
                  disabled={selectedClients.length === 0 || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
 
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Clients</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-5 w-5 p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Clear</span>
                    </Button>
                  )}
                </div>
              </div>
 
              <div className="border rounded-md h-[350px] overflow-y-auto p-2">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No clients found</div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between space-x-2 pb-2 border-b">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={
                            filteredClients.length > 0 &&
                            filteredClients.every((client) => selectedClients.includes(client.client_id))
                          }
                          onCheckedChange={(checked) => handleBulkSelection(!!checked)}
                        />
                        <Label htmlFor="select-all">Select All</Label>
                      </div>
                      {selectedClients.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => handleBulkSelection(false)}>
                          Clear Selection
                        </Button>
                      )}
                    </div>
                    {filteredClients.map((client) => (
                      <div key={client.client_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={client.client_id}
                          checked={selectedClients.includes(client.client_id)}
                          onCheckedChange={() => toggleClient(client.client_id)}
                        />
                        <Label htmlFor={client.client_id} className="flex-1">
                          <span className="font-medium">{client.practice_name}</span>
                          <span className="text-xs text-gray-500 ml-2">{client.client_id}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
 
              <div className="text-sm text-gray-500">
                {selectedClients.length} of {filteredClients.length} clients selected
              </div>
            </div>
          </div>
        </TabsContent>
 
        <TabsContent value="preview" className="mt-4">
          <ReportPreview
            reportType={selectedReportType}
            reportData={reportData}
            isLoading={isGenerating}
            selectedClients={selectedClients}
            dateRange={dateRange}
            customDateRange={dateRange === "custom" ? customDateRange : undefined}
            onDataUpdate={(data) => setReportData(data)} // 👈 Capture updated invoice edits
          />
 
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={() => setActiveTab("generate")}>
              Back to Generator
            </Button>
            <Button variant="outline" onClick={exportReportToCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button onClick={exportReportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
          </div>
 
        </TabsContent>
 
        <TabsContent value="schema" className="mt-4">
          <SchemaReference />
        </TabsContent>
      </Tabs>
    </div>
  )
}