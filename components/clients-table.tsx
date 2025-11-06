"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, FileUp } from "lucide-react";

export function ClientsTable() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch directly from Supabase via API
  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients/get?ts=" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error("Error fetching clients:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    const text = (search || "").toLowerCase();
    return (
      c.account_name?.toLowerCase().includes(text) ||
      c.website_company_name?.toLowerCase().includes(text) ||
      c.website_city?.toLowerCase().includes(text) ||
      c.website_state?.toLowerCase().includes(text) ||
      c.website_country?.toLowerCase().includes(text)
    );
  });

  const exportToCSV = () => {
    if (!filtered.length) return alert("No data to export.");
    const headers = Object.keys(filtered[0]);
    const csv = [
      headers.join(","),
      ...filtered.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients_export.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search contacts..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="overflow-x-auto w-full border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Website Company Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Google Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                  {loading ? "Loading..." : "No clients found"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <TableCell>{client.account_name || "N/A"}</TableCell>
                  <TableCell>{client.website_company_name || "N/A"}</TableCell>
                  <TableCell>{client.website_city || "N/A"}</TableCell>
                  <TableCell>{client.website_state || "N/A"}</TableCell>
                  <TableCell>{client.website_country || "N/A"}</TableCell>
                  <TableCell>{client.linkedin_company_name || "N/A"}</TableCell>
                  <TableCell>{client.google_rating || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  {/* <TableCell>
                    <Badge variant={client.status === "active" ? "default" : "secondary"}>
                      {client.status || "active"}
                    </Badge>
                  </TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="outline" onClick={() => router.push(`/clients/${client.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline">
                        <FileUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filtered.length} of {clients.length} companies
      </div>
    </div>
  );
}
