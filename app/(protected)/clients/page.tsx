"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsTable } from "@/components/clients-table";
import { NewClientForm } from "@/components/new-client-form";

const VALID_TABS = ["all", "active", "archived", "pending"] as const;
type TabKey = typeof VALID_TABS[number];

export default function ClientsPage() {
  const [tab, setTab] = useState<TabKey>("all");

  // ✅ Initialize tab from hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (VALID_TABS.includes(hash as TabKey)) setTab(hash as TabKey);
  }, []);

  // ✅ Keep hash in sync with selected tab
  const handleTabChange = (value: string) => {
    const valid = VALID_TABS.includes(value as TabKey) ? (value as TabKey) : "all";
    setTab(valid);
    window.history.replaceState(null, "", `#${valid}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <NewClientForm />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        {/* <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList> */}

        {/* Tab Content */}
        <TabsContent value="all" className="mt-4">
          <ClientsTable />
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <ClientsTable />
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <ClientsTable />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <ClientsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
