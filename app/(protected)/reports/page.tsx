"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsGenerator } from "@/components/reports-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ReportsPage() {
  useAuthGuard(); // ✅ now works correctly because component is client-side

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Tabs defaultValue="client">
        <TabsList>
          <TabsTrigger value="client">Company Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="mt-4">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle>Company Reports</CardTitle>
              <CardDescription>
                Generate and download company lists directly from company data. Search, select, and export results in CSV or Excel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
