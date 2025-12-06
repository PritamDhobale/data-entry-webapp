"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/context/role-context";
import { permissions } from "@/context/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityPage() {
  const role = useRole();

  if (!permissions[role].canViewUserActivity) {
    return (
      <div className="p-6 text-red-500">
        You do not have permission to view this page.
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/activity/get");
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        setStats(json.stats);
      } catch (err: any) {
        setError(err.message || "Failed to load activity data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reviewer Activity</h1>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Today</th>
                <th className="p-2 border">This Week</th>
                <th className="p-2 border">This Month</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(stats).map((user: any, idx: number) => (
                <tr key={idx}>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border text-center">{user.today}</td>
                  <td className="p-2 border text-center">{user.week}</td>
                  <td className="p-2 border text-center">{user.month}</td>
                  <td className="p-2 border text-center">{user.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Detailed Breakdown per User */}
      {Object.values(stats).map((user: any, idx: number) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {user.entries.map((entry: any) => (
                  <tr key={entry.id}>
                    <td className="p-2 border">{entry.account_name}</td>
                    <td className="p-2 border">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
