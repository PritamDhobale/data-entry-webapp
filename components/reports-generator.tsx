"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, Download, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";

export function ReportsGenerator() {
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Fetch all clients
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/reports/get");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.clients || [];
        setClients(list);
        setFilteredClients(list);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setClients([]);
        setFilteredClients([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredClients(
      clients.filter(
        (c) =>
          c.account_name?.toLowerCase().includes(lower) ||
          c.website_city?.toLowerCase().includes(lower) ||
          c.website_state?.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, clients]);

  // 🧩 Bulk selection
  const handleBulkSelect = (checked: boolean) => {
    if (checked) setSelectedClients(filteredClients.map((c) => String(c.id)));
    else setSelectedClients([]);
  };

  const toggleClient = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🧾 Export as Excel
  const exportExcel = () => {
    const selected = clients.filter((c) => selectedClients.includes(String(c.id)));
    const ws = XLSX.utils.json_to_sheet(selected);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    XLSX.writeFile(wb, "company_report.xlsx");
  };

  // 📄 Export as CSV
  const exportCSV = () => {
    const selected = clients.filter((c) => selectedClients.includes(String(c.id)));
    const csvData = Papa.unparse(selected);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "company_report.csv");
  };

  // 🧠 Generate Report → Switch to Preview
  const handleGenerateReport = () => {
    if (!selectedClients.length) {
      alert("Please select at least one company to generate the report.");
      return;
    }
    setActiveTab("preview");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedClients.length}>
            Preview / Export
          </TabsTrigger>
        </TabsList>

        {/* --- Generate Report --- */}
        <TabsContent value="generate" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Company List</h1>
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-1/3"
              />
            </div>

            <div className="border rounded-md h-[400px] overflow-y-auto p-3">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading companies...</div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center text-gray-500">No companies found</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox className="data-[state=checked]:bg-[#112B74] data-[state=checked]:border-[#112B74]"
                        checked={
                          filteredClients.length > 0 &&
                          filteredClients.every((c) =>
                            selectedClients.includes(String(c.id))
                          )
                        }
                        onCheckedChange={(checked) => handleBulkSelect(!!checked)}
                      />
                      <Label>Select All</Label>
                    </div>
                    {selectedClients.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClients([])}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>

                  {filteredClients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2 border-b py-1">
                      <Checkbox className="data-[state=checked]:bg-[#112B74] data-[state=checked]:border-[#112B74]"
                        checked={selectedClients.includes(String(client.id))}
                        onCheckedChange={() => toggleClient(String(client.id))}
                      />
                      <Label className="flex-1 cursor-pointer">
                        <span className="font-medium">{client.account_name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {client.website_city || "Unknown City"},{" "}
                          {client.website_state || ""}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">
                {selectedClients.length} of {filteredClients.length} selected
              </div>

              <Button
                className="bg-[#112B74] hover:bg-[#0e2360] text-white"
                disabled={!selectedClients.length}
                onClick={handleGenerateReport}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* --- Preview / Export --- */}
        <TabsContent value="preview" className="mt-4">
          <h2 className="text-lg font-semibold mb-3">Report Preview</h2>
          <div className="border rounded-md p-3 bg-gray-50">
            {clients
              .filter((c) => selectedClients.includes(String(c.id)))
              .map((client) => (
                <div key={client.id} className="border-b py-2">
                  <p className="font-medium">{client.account_name}</p>
                  <p className="text-sm text-gray-600">
                    {client.website_city}, {client.website_state} • {client.website}
                  </p>
                </div>
              ))}
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={() => setActiveTab("generate")}>
              Back
            </Button>
            <Button
              onClick={exportCSV}
              className="bg-[#112B74] hover:bg-[#0e2360] text-white"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={exportExcel}
              className="bg-[#112B74] hover:bg-[#0e2360] text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
