"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown } from "lucide-react";

// ✅ Safe text helpers
const sanitizeValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "" || value === "N/A")
    return "-";
  return String(value);
};

const formatPrimaryContact = (
  name?: string,
  phone?: string,
  email?: string
): string => {
  const parts = [];
  if (name) parts.push(name);
  if (phone) parts.push(phone);
  if (email) parts.push(email);
  return parts.length ? parts.join(" | ") : "-";
};

// ✅ Fetch recent companies from API
const fetchRecentCompanies = async () => {
  try {
    const res = await fetch("/api/dashboard/recent-companies");
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data?.companies || [];
  } catch (err) {
    console.error("Error fetching recent companies:", err);
    return [];
  }
};

export function DashboardRecentCompanies() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load data
  useEffect(() => {
    const load = async () => {
      const data = await fetchRecentCompanies();
      setCompanies(data);
    };
    load();
  }, []);

  // Search filter
  const filteredCompanies = companies.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      sanitizeValue(c.account_name).toLowerCase().includes(s) ||
      sanitizeValue(c.website_city).toLowerCase().includes(s) ||
      sanitizeValue(c.website_state).toLowerCase().includes(s) ||
      sanitizeValue(c.website).toLowerCase().includes(s)
    );
  });

  const handleRowClick = (id: string) => {
    router.push(`/companies/${id}`);
  };

  const handleViewAll = () => {
    router.push("/companies");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search companies..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          onClick={handleViewAll}
          className="bg-[#112B74] hover:bg-[#0E2463] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm transition-all duration-200 flex items-center"
        >
          View All
          <ChevronDown className="ml-2 h-4 w-4 text-[#E9A41A]" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Founded</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  No recent companies found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow
                  key={company.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    const selection = window.getSelection();
                    if (!selection || selection.toString().length === 0)
                      handleRowClick(company.id);
                  }}
                >
                  <TableCell className="font-medium">
                    {sanitizeValue(company.id)}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-800">
                    {sanitizeValue(company.account_name)}
                  </TableCell>
                  <TableCell className="text-blue-600 underline truncate max-w-[200px]">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sanitizeValue(company.website)}
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {`${sanitizeValue(company.website_city)}, ${sanitizeValue(
                      company.website_state
                    )}`}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {sanitizeValue(company.website_year_founded || "-")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        company.status?.toLowerCase() === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {sanitizeValue(company.status || "Active")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
