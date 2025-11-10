"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Star,
  Briefcase,
  Building2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardChart } from "@/components/dashboard-chart";
import { DashboardTable } from "@/components/dashboard-table";
import { useRole } from "@/context/role-context";

type DashboardSummary = {
  success: boolean;
  totalCompanies: number;
  avgGoogleRating: number;
  avgEmployees: number;
  totalIndustries: number;
  bbbAccredited: number;
  error?: string;
};

export default function Dashboard() {
  const role = useRole(); 
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 🔁 Fetch summary from API
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
      const data: DashboardSummary = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load dashboard summary.");
      }

      setSummary(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching dashboard summary:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleNavigate = (path: string) => router.push(`/${path}`);

  const handleViewAll = () => router.push("/clients");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-sm text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <p className="text-red-500 font-medium">Error: {error}</p>
        <button
          onClick={fetchSummary}
          className="text-sm text-[#112B74] hover:text-[#0E2463] underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totalCompanies = 0,
    avgGoogleRating = 0,
    avgEmployees = 0,
    totalIndustries = 0,
    bbbAccredited = 0,
  } = summary || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#000000]">Dashboard</h1>
        {/* 🟦 Branded View All Button */}
        <Button
          onClick={handleViewAll}
          className="bg-[#112B74] hover:bg-[#0E2463] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm transition-all duration-200 flex items-center"
        >
          View All
          <ChevronDown className="ml-2 h-4 w-4 text-[#E9A41A]" />
        </Button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Companies */}
        <Card
          onClick={() => handleNavigate("clients")}
          className="cursor-pointer border border-[#112B74]/30 hover:shadow-md transition"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#112B74]">
              Total Companies
            </CardTitle>
            <Users className="h-4 w-4 text-[#112B74]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {totalCompanies}
            </div>
            <p className="text-xs text-gray-500">All registered companies</p>
          </CardContent>
        </Card>

        {/* Avg Google Rating */}
        <Card className="border border-[#E9A41A]/40 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#E9A41A]">
              Avg. Google Rating
            </CardTitle>
            <Star className="h-4 w-4 text-[#E9A41A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {avgGoogleRating.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500">Across all profiles</p>
          </CardContent>
        </Card>

        {/* Avg Employees */}
        <Card className="border border-[#0E2463]/40 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#0E2463]">
              Avg. Employees
            </CardTitle>
            <Building2 className="h-4 w-4 text-[#0E2463]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {avgEmployees.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500">Based on LinkedIn data</p>
          </CardContent>
        </Card>

        {/* Total Industries */}
        <Card className="border border-gray-300 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Industries
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {totalIndustries}
            </div>
            <p className="text-xs text-gray-500">Distinct categories</p>
          </CardContent>
        </Card>

        {/* BBB Accredited */}
        <Card className="border border-green-300 hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              BBB Accredited
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {bbbAccredited}
            </div>
            <p className="text-xs text-gray-500">Verified companies</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#000000]">
              Top States by Company Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#000000]">
              Top Industries by Company Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#000000]">Recent Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardTable />
        </CardContent>
      </Card>
    </div>
  );
}