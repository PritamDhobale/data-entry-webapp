"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, X } from "lucide-react";

// ---------- TYPES ----------
type CompanyData = Record<string, any>;

// ---------- FIELD CONFIGURATION ----------
type FieldDef = { key: string; label: string; type?: "input" | "textarea" };

const GROUPS: Record<
  "details" | "linkedin" | "bbb" | "google" | "ppp" | "sos" | "source",
  FieldDef[]
> = {
  details: [
    { key: "Account Name", label: "Account Name" },
    { key: "Website", label: "Website" },
    { key: "Annual Revenue", label: "Annual Revenue" },
    { key: "Email", label: "Email" },
    // { key: "Contact on Website", label: "Contact on Website" },
    { key: "Title", label: "Title" },
    { key: "Website Company Name", label: "Website Company Name" },
    { key: "Website Company Name Abbreviated", label: "Website Company Name Abbreviated" },
    { key: "Website Address", label: "Website Address" },
    { key: "Website Street", label: "Website Street" },
    { key: "Website City", label: "Website City" },
    { key: "Website State", label: "Website State" },
    { key: "Website Zip Code", label: "Website Zip Code" },
    { key: "Website Country", label: "Website Country" },
    { key: "Website Full Company MSA", label: "Website: Full Company MSA" },
    { key: "Website Company MSA", label: "Website: Company MSA" },
    { key: "Website Region", label: "Website: Region" },
    { key: "Website Office Phone", label: "Website Office Phone" },
    { key: "Website Contacts", label: "Website Contacts" },
    { key: "Website Locations", label: "Website Locations (#)" },
    { key: "Website Year Founded", label: "Website Year Founded" },
    { key: "Website Employees", label: "Website Employees" },
    { key: "Website Designations", label: "Website Designations" },
    { key: "Website Could Not Access", label: "Website: Could Not Access" },
    { key: "Website Notes", label: "Website: Notes" },
  ],
  linkedin: [
    { key: "LinkedIn Possible 1", label: "Possible LinkedIn (#1)(Grata)" },
    { key: "LinkedIn Possible 2", label: "Possible LinkedIn (#2)(Zoominfo)" },
    { key: "LinkedIn Url", label: "LinkedIn (Url)" },
    { key: "LinkedIn Could Not Access", label: "LinkedIn: Could Not Access" },
    { key: "LinkedIn Company Name", label: "LinkedIn Company Name" },
    { key: "LinkedIn Overview", label: "LinkedIn Overview" },
    { key: "Linkedin Followers", label: "Linkedin Followers" },
    { key: "LinkedIn Phone", label: "LinkedIn Phone" },
    { key: "LinkedIn Industry", label: "LinkedIn Industry" },
    { key: "LinkedIn Employee Estimate", label: "LinkedIn Employee Estimate" },
    { key: "LinkedIn Members", label: "LinkedIn Members" },
    { key: "LinkedIn Headquarters", label: "LinkedIn Headquarters" },
    { key: "LinkedIn Founded Year", label: "LinkedIn Founded Year" },
    { key: "LinkedIn Specialties", label: "LinkedIn Specialties" },
    { key: "LinkedIn Contacts", label: "LinkedIn Contacts" },
    { key: "LinkedIn Locations", label: "LinkedIn Locations" },
    { key: "LinkedIn Primary Location", label: "LinkedIn Primary Location" },
    { key: "LinkedIn Street", label: "LinkedIn Street" },
    { key: "LinkedIn City", label: "LinkedIn City" },
    { key: "LinkedIn State", label: "LinkedIn State" },
    { key: "LinkedIn Zip Code", label: "LinkedIn Zip Code" },
    { key: "LinkedIn Country", label: "LinkedIn Country" },
    { key: "LinkedIn Full Company MSA", label: "LinkedIn: Full Company MSA" },
    { key: "LinkedIn Company MSA", label: "LinkedIn: Company MSA" },
    { key: "LinkedIn Region", label: "LinkedIn: Region" },
    { key: "LinkedIn Notes", label: "LinkedIn: Notes" },
    { key: "Linkedin Unclaimed Page", label: "Linkedin: Unclaimed Page" },
  ],
  bbb: [
    { key: "BBB Link", label: "BBB Link (Url)" },
    { key: "BBB Company Name", label: "BBB Company Name" },
    { key: "BBB Business Started", label: "BBB Business Started" },
    { key: "BBB Type of Entity", label: "BBB Type of Entity" },
    { key: "BBB Alternate Names", label: "BBB Alternate Names" },
    { key: "BBB Address", label: "BBB Address" },
    { key: "BBB Street", label: "BBB Street" },
    { key: "BBB City", label: "BBB City" },
    { key: "BBB State", label: "BBB State" },
    { key: "BBB Zip Code", label: "BBB Zip Code" },
    { key: "BBB Country", label: "BBB Country" },
    { key: "BBB Full Company MSA", label: "BBB: Full Company MSA" },
    { key: "BBB Company MSA", label: "BBB: Company MSA" },
    { key: "BBB Region", label: "BBB: Region" },
    { key: "BBB Customer Contacts", label: "BBB Customer Contacts" },
    { key: "BBB Notes", label: "BBB: Notes" },
    { key: "BBB Accredited", label: "BBB Accredited" },
  ],
  google: [
    { key: "Google Business Page Url", label: "Google Business Page (Url)" },
    { key: "Google Company Name", label: "Google Company Name" },
    { key: "Google Reviews", label: "Google Reviews" },
    { key: "Google Rating", label: "Google Rating" },
    { key: "Google Address", label: "Google Address" },
    { key: "Google Business Street", label: "Google Business Street" },
    { key: "Google Business City", label: "Google Business City" },
    { key: "Google Business State", label: "Google Business State" },
    { key: "Google Business Zip Code", label: "Google Business Zip Code" },
    { key: "Google Business Country", label: "Google Business Country" },
    { key: "Google Business Full Company MSA", label: "Google Business: Full Company MSA" },
    { key: "Google Business Company MSA", label: "Google Business: Company MSA" },
    { key: "Google Business Region", label: "Google Business: Region" },
    { key: "Google Phone", label: "Google Phone" },
    { key: "Google Business Notes", label: "Google Business: Notes" },
  ],
  ppp: [
    { key: "FederalPay PPP Url", label: "FederalPay PPP Link (Url)" },
    { key: "PPP Company Name", label: "PPP Company Name" },
    { key: "PPP Jobs Retained", label: "PPP Jobs Retained" },
    { key: "PPP Total Loan Size", label: "PPP Total Loan Size" },
    { key: "PPP Loan Size 1", label: "PPP Loan Size (#1)" },
    { key: "PPP Loan Payroll Amount 1", label: "PPP Loan Payroll Amount (#1)" },
    { key: "PPP Loan Size 2", label: "PPP Loan Size (#2)" },
    { key: "PPP Loan Payroll Amount 2", label: "PPP Loan Payroll Amount (#2)" },
    { key: "PPP Address", label: "PPP Address" },
    { key: "PPP Street", label: "PPP Street" },
    { key: "PPP City", label: "PPP City" },
    { key: "PPP State", label: "PPP State" },
    { key: "PPP Zip Code", label: "PPP Zip Code" },
    { key: "PPP Country", label: "PPP Country" },
    { key: "PPP Full Company MSA", label: "PPP Full Company MSA" },
    { key: "PPP Company MSA", label: "PPP Company MSA" },
    { key: "PPP Region", label: "PPP Region" },
    { key: "PPP Business Demographics", label: "PPP Business Demographics" },
    { key: "PPP NAICS Code", label: "PPP NAICS Code" },
    { key: "PPP Business Owner Demographics", label: "PPP Business Owner Demographics" },
    { key: "PPP Notes", label: "PPP Notes" },
    { key: "PPP Could Not Access", label: "PPP: Could Not Access" },
  ],
  sos: [
    { key: "SoS Company Name", label: "SoS Company Name" },
    { key: "SoS Fictitious Names", label: "SoS Fictitious Names" },
    { key: "SoS Filing Type", label: "SoS Filing Type" },
    { key: "SoS Agent Address", label: "SoS Agent Address" },
    { key: "SoS Agent Street", label: "SoS Agent Street" },
    { key: "SoS Agent City", label: "SoS Agent City" },
    { key: "SoS Agent State", label: "SoS Agent State" },
    { key: "SoS Agent Zip Code", label: "SoS Agent Zip Code" },
    { key: "SoS Agent Country", label: "SoS Agent Country" },
    { key: "SoS Agent Full Company MSA", label: "SoS Agent: Full Company MSA" },
    { key: "SoS Agent Company MSA", label: "SoS Agent: Company MSA" },
    { key: "SoS Agent Region", label: "SoS Agent: Region" },
    { key: "SoS Principal Address", label: "SoS Principal Address" },
    { key: "SoS Principal Street", label: "SoS Principal Street" },
    { key: "SoS Principal City", label: "SoS Principal City" },
    { key: "SoS Principal State", label: "SoS Principal State" },
    { key: "SoS Principal Zip Code", label: "SoS Principal Zip Code" },
    { key: "SoS Principal Country", label: "SoS Principal Country" },
    { key: "SoS Principal Full Company MSA", label: "SoS Principal: Full Company MSA" },
    { key: "SoS Principal Company MSA", label: "SoS Principal: Company MSA" },
    { key: "SoS Principal Region", label: "SoS Principal: Region" },
    { key: "SoS Registered Agent", label: "SoS Registered Agent" },
    { key: "SoS Officers", label: "SoS Officers" },
    { key: "SoS Year Founded", label: "SoS Year Founded" },
    { key: "SoS Notes", label: "SoS: Notes" },
    { key: "Secretary of State Could Not Access", label: "Secretary of State: Could Not Access" },
  ],
  source: [
    { key: "Location Primary", label: "Location Primary" },
    { key: "Source Primary", label: "Source Primary" },
    { key: "Location Secondary", label: "Location Secondary" },
    { key: "Source Secondary", label: "Source Secondary" },
    { key: "Location Tertiary", label: "Location Tertiary" },
    { key: "Source Tertiary", label: "Source Tertiary" },
    { key: "Location Fourth", label: "Location Fourth" },
    { key: "Source Fourth", label: "Source Fourth" },
  ],
};

// ---------- HELPERS ----------
const nullIfEmpty = (v: unknown) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
};

// Case-insensitive getter (same logic as Company Details Page)
const getValue = (data: any, key: string) => {
  if (!data) return "";

  // If exact key exists, return it
  if (data[key] !== undefined && data[key] !== null) return data[key];

  // Try case-insensitive lookup
  const found = Object.keys(data).find(
    (k) => k.toLowerCase() === key.toLowerCase()
  );

  return found ? data[found] : "";
};


// ---------- COMPONENT ----------
export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const rowId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof GROUPS>("details");

  // --- Fetch record ---
  useEffect(() => {
    (async () => {
      try {
        if (!rowId) return;
        const res = await fetch(`/api/companies/${rowId}`);
        const result = await res.json();

        if (!result.success || !result.company) {
          throw new Error(result.error || "Failed to fetch company");
        }

        setData({ id: rowId, ...result.company });
      } catch (e) {
        console.error(e);
        alert("Failed to load Company.");
        router.push("/clients");
      } finally {
        setLoading(false);
      }
    })();
  }, [rowId, router]);

  const title = useMemo(() => {
    return data?.["Account Name"] ? `Edit: ${data["Account Name"]}` : "Edit Company";
  }, [data?.["Account Name"]]);

  const onChangeField = (key: string, value: string) => {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
  };

  const onSave = async () => {
    if (!data?.ID && !data?.id) {
      alert("Missing record ID.");
      return;
    }

    const recordId = data?.ID || data?.id;

    setSaving(true);
    try {
      // Clean empty fields
      const payload: Record<string, any> = {};
      Object.keys(data).forEach((key) => {
        if (key === "ID" || key === "id") return;
        payload[key] = nullIfEmpty(data[key]);
      });

      const res = await fetch("/api/companies/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId, ...payload }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      setDirty(false);
      alert("✅ Saved successfully.");
      router.push(`/clients/${encodeURIComponent(recordId)}`);
    } catch (e) {
      console.error(e);
      alert("❌ Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    if (data?.id) router.push(`/clients/${encodeURIComponent(data.id)}`);
    else router.push("/clients");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );

  if (!data)
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Company not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/clients")}>Go to Companies</Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !dirty}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : dirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as keyof typeof GROUPS)}
            className="w-full"
          >
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="details">Details (Account Info)</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="bbb">BBB</TabsTrigger>
              <TabsTrigger value="google">Google Business</TabsTrigger>
              <TabsTrigger value="ppp">PPP</TabsTrigger>
              <TabsTrigger value="sos">SoS</TabsTrigger>
              <TabsTrigger value="source">Source Info</TabsTrigger>
            </TabsList>

            {Object.entries(GROUPS).map(([key, fields]) => (
              <TabsContent key={key} value={key}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {fields.map((f) => {
                    const val = getValue(data, f.key) as string;
                    return (
                      <div key={String(f.key)} className="space-y-2">
                        <Label htmlFor={String(f.key)}>{f.label}</Label>
                        {f.type === "textarea" ? (
                          <Textarea
                            id={String(f.key)}
                            value={val ?? ""}
                            rows={4}
                            onChange={(e) => onChangeField(f.key, e.target.value)}
                          />
                        ) : (
                          <Input
                            id={String(f.key)}
                            value={val ?? ""}
                            onChange={(e) => onChangeField(f.key, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Footer Save */}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={onSave} disabled={saving || !dirty}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving…" : dirty ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
