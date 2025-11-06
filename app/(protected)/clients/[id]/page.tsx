"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

// ── If you already have a Supabase client helper, replace the next import with:
// import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// ---------- Types (subset; unknown fields are handled generically) ----------
type CompanyData = {
  id: string | number;

  // Common account fields (keep names exactly as in DB, case-insensitive access is handled)
  "Account Name"?: string;
  Website?: string;
  "Website Company Name"?: string;
  "Website Company Name Abbreviated"?: string;
  "Website Address"?: string;
  "Website Street"?: string;
  "Website City"?: string;
  "Website State"?: string;
  "Website Zip Code"?: string;
  "Website Country"?: string;
  "Website: Full Company MSA"?: string;
  "Website: Company MSA"?: string;
  "Website: Region"?: string;
  "Website Office Phone"?: string;
  "Website Contacts"?: string;
  "Website Locations (#)"?: string | number;
  "Website Year Founded"?: string | number;
  "Website Employees"?: string | number;
  "Website Designations"?: string;
  "Website: Could Not Access"?: string;
  "Website: Notes"?: string;

  // LinkedIn
  "Possible LinkedIn (#1)(Grata)"?: string;
  "Possible LinkedIn (#2)(Zoominfo)"?: string;
  "LinkedIn (Url)"?: string;
  "LinkedIn: Could Not Access"?: string;
  "LinkedIn Company Name"?: string;
  "LinkedIn Overview"?: string;
  "Linkedin Followers"?: string | number;
  "LinkedIn Phone"?: string;
  "LinkedIn Industry"?: string;
  "LinkedIn Employee Estimate"?: string | number;
  "LinkedIn Members"?: string | number;
  "LinkedIn Headquarters"?: string;
  "LinkedIn Founded Year"?: string | number;
  "LinkedIn Specialties"?: string;
  "LinkedIn Contacts"?: string;
  "LinkedIn Locations"?: string;
  "LinkedIn Primary Location"?: string;
  "LinkedIn Street"?: string;
  "LinkedIn City"?: string;
  "LinkedIn State"?: string;
  "LinkedIn Zip Code"?: string;
  "LinkedIn Country"?: string;
  "LinkedIn: Full Company MSA"?: string;
  "LinkedIn: Company MSA"?: string;
  "LinkedIn: Region"?: string;
  "LinkedIn: Notes"?: string;
  "Linkedin: Unclaimed Page"?: string;

  // Google Business
  "Google Business Page (Url)"?: string;
  "Google Company Name"?: string;
  "Google Reviews"?: string | number;
  "Google Rating"?: string | number;
  "Google Address"?: string;
  "Google Business Street"?: string;
  "Google Business City"?: string;
  "Google Business State"?: string;
  "Google Business Zip Code"?: string;
  "Google Business Country"?: string;
  "Google Business: Full Company MSA"?: string;
  "Google Business: Company MSA"?: string;
  "Google Business: Region"?: string;
  "Google Phone"?: string;
  "Google Business: Notes"?: string;

  // BBB
  "BBB Link (Url)"?: string;
  "BBB Company Name"?: string;
  "BBB Business Started"?: string;
  "BBB Type of Entity"?: string;
  "BBB Alternate Names"?: string;
  "BBB Address"?: string;
  "BBB Street"?: string;
  "BBB City"?: string;
  "BBB State"?: string;
  "BBB Zip Code"?: string;
  "BBB Country"?: string;
  "BBB: Full Company MSA"?: string;
  "BBB: Company MSA"?: string;
  "BBB: Region"?: string;
  "BBB Customer Contacts"?: string;
  "BBB: Notes"?: string;
  "BBB Accredited"?: string;

  // PPP (FederalPay)
  "FederalPay PPP Link (Url)"?: string;
  "PPP Company Name"?: string;
  "PPP Jobs Retained"?: string | number;
  "PPP Total Loan Size"?: string | number;
  "PPP Loan Size(#1)"?: string | number;
  "PPP Loan Payroll Amount (#1)"?: string | number;
  "PPP Loan Size (#2)"?: string | number;
  "PPP Loan Payroll Amount (#2)"?: string | number;
  "PPP Address"?: string;
  "PPP Street"?: string;
  "PPP City"?: string;
  "PPP State"?: string;
  "PPP Zip Code"?: string;
  "PPP Country"?: string;
  "PPP: Full Company MSA"?: string;
  "PPP: Company MSA"?: string;
  "PPP: Region"?: string;
  "PPP Business Demographics"?: string;
  "PPP NAICS Code"?: string;
  "PPP Business Owner Demographics"?: string;
  "PPP: Notes"?: string;

  // SoS
  "SoS Company Name"?: string;
  "SoS Fictitious Names"?: string;
  "SoS Filing Type"?: string;
  "SoS Agent Address"?: string;
  "SoS Agent Street"?: string;
  "SoS Agent City"?: string;
  "SoS Agent State"?: string;
  "SoS Agent Zip Code"?: string;
  "SoS Agent Country"?: string;
  "SoS Agent: Full Company MSA"?: string;
  "SoS Agent: Company MSA"?: string;
  "SoS Agent: Region"?: string;
  "SoS Principal Address"?: string;
  "SoS Principal Street"?: string;
  "SoS Principal City"?: string;
  "SoS Principal State"?: string;
  "SoS Principal Zip Code"?: string;
  "SoS Principal Country"?: string;
  "SoS Principal: Full Company MSA"?: string;
  "SoS Principal: Company MSA"?: string;
  "SoS Principal: Region"?: string;
  "SoS Registered Agent"?: string;
  "SoS Officers"?: string;
  "SoS Year Founded"?: string | number;
  "SoS: Notes"?: string;
  "Secretary of State: Could Not Access"?: string;

  /// Source / Location metadata (aligned with Supabase columns)
  "Location Primary"?: string;
  "Source Primary"?: string;
  "Location Secondary"?: string;
  "Source Secondary"?: string;
  "Location Tertiary"?: string;
  "Source Tertiary"?: string;
  "Location Fourth"?: string;
  "Source Fourth"?: string;
  // + their matching "Source" rows (we’ll show all keys)
  [k: string]: any;
};

// ---------- Docs list (re-using your API routes) ----------
function InlineDocumentList({ recordId }: { recordId: string | number }) {
  const [documents, setDocuments] = useState<{ file_name: string; created_at: string }[]>([]);
  const [agreements, setAgreements] = useState<{ file_name: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/files/get?clientId=${recordId}`);
      const data = await res.json();
      setDocuments(data.documents || []);
      setAgreements(data.agreements || []);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  const handleDownload = async (blobPath: string) => {
    try {
      const res = await fetch(`/api/files/download-url?blobPath=${encodeURIComponent(blobPath)}`);
      const { url } = await res.json();
      if (url) window.open(url, "_blank");
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDelete = async (blobPath: string, section: "documents" | "agreements", fileName: string) => {
    try {
      if (section === "documents") {
        setDocuments((prev) => prev.filter((d) => d.file_name !== fileName));
      } else {
        setAgreements((prev) => prev.filter((d) => d.file_name !== fileName));
      }
      const res = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blobPath }),
      });
      if (!res.ok) {
        await fetchFiles();
        const { error } = await res.json();
        throw new Error(error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Please try again.");
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading files...</p>;
  if (documents.length === 0 && agreements.length === 0) {
    return <p className="text-sm text-gray-500">No files uploaded yet.</p>;
  }

  return (
    <div className="space-y-6">
      {documents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Documents</h3>
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.file_name} className="flex justify-between items-center text-sm border rounded px-3 py-2 bg-white shadow-sm">
                <div>
                  <p className="font-medium">{doc.file_name}</p>
                  <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(`${recordId}/documents/${doc.file_name}`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) {
                        handleDelete(`${recordId}/documents/${doc.file_name}`, "documents", doc.file_name);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {agreements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Agreements</h3>
          <ul className="space-y-2">
            {agreements.map((doc) => (
              <li key={doc.file_name} className="flex justify-between items-center text-sm border rounded px-3 py-2 bg-white shadow-sm">
                <div>
                  <p className="font-medium">{doc.file_name}</p>
                  <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(`${recordId}/agreements/${doc.file_name}`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) {
                        handleDelete(`${recordId}/agreements/${doc.file_name}`, "agreements", doc.file_name);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------- Field grouping & renderer ----------
type FieldDef = { key: string; label: string };

// You gave long lists; we map them 1:1 so labels match exactly what you see in sheets.
const GROUPS: Record<
  "details" | "linkedin" | "bbb" | "google" | "ppp" | "sos" | "source",
  FieldDef[]
> = {
  details: [
    { key: "Account Name", label: "Account Name" },
    { key: "Website", label: "Website" },
    { key: "Website Company Name", label: "Website Company Name" },
    { key: "Website Company Name Abbreviated", label: "Website Company Name Abbreviated" },
    { key: "Website Address", label: "Website Address" },
    { key: "Website Street", label: "Website Street" },
    { key: "Website City", label: "Website City" },
    { key: "Website State", label: "Website State" },
    { key: "Website Zip Code", label: "Website Zip Code" },
    { key: "Website Country", label: "Website Country" },
    { key: "Website: Full Company MSA", label: "Website: Full Company MSA" },
    { key: "Website: Company MSA", label: "Website: Company MSA" },
    { key: "Website: Region", label: "Website: Region" },
    { key: "Website Office Phone", label: "Website Office Phone" },
    { key: "Website Contacts", label: "Website Contacts" },
    { key: "Website Locations (#)", label: "Website Locations (#)" },
    { key: "Website Year Founded", label: "Website Year Founded" },
    { key: "Website Employees", label: "Website Employees" },
    { key: "Website Designations", label: "Website Designations" },
    { key: "Website: Could Not Access", label: "Website: Could Not Access" },
    { key: "Website: Notes", label: "Website: Notes" },
  ],
  linkedin: [
    { key: "Possible LinkedIn (#1)(Grata)", label: "Possible LinkedIn (#1)(Grata)" },
    { key: "Possible LinkedIn (#2)(Zoominfo)", label: "Possible LinkedIn (#2)(Zoominfo)" },
    { key: "LinkedIn (Url)", label: "LinkedIn (Url)" },
    { key: "LinkedIn: Could Not Access", label: "LinkedIn: Could Not Access" },
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
    { key: "LinkedIn: Full Company MSA", label: "LinkedIn: Full Company MSA" },
    { key: "LinkedIn: Company MSA", label: "LinkedIn: Company MSA" },
    { key: "LinkedIn: Region", label: "LinkedIn: Region" },
    { key: "LinkedIn: Notes", label: "LinkedIn: Notes" },
    { key: "Linkedin: Unclaimed Page", label: "Linkedin: Unclaimed Page" },
  ],
  bbb: [
    { key: "BBB Link (Url)", label: "BBB Link (Url)" },
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
    { key: "BBB: Full Company MSA", label: "BBB: Full Company MSA" },
    { key: "BBB: Company MSA", label: "BBB: Company MSA" },
    { key: "BBB: Region", label: "BBB: Region" },
    { key: "BBB Customer Contacts", label: "BBB Customer Contacts" },
    { key: "BBB: Notes", label: "BBB: Notes" },
    { key: "BBB Accredited", label: "BBB Accredited" },
  ],
  google: [
    { key: "Google Business Page (Url)", label: "Google Business Page (Url)" },
    { key: "Google Company Name", label: "Google Company Name" },
    { key: "Google Reviews", label: "Google Reviews" },
    { key: "Google Rating", label: "Google Rating" },
    { key: "Google Address", label: "Google Address" },
    { key: "Google Business Street", label: "Google Business Street" },
    { key: "Google Business City", label: "Google Business City" },
    { key: "Google Business State", label: "Google Business State" },
    { key: "Google Business Zip Code", label: "Google Business Zip Code" },
    { key: "Google Business Country", label: "Google Business Country" },
    { key: "Google Business: Full Company MSA", label: "Google Business: Full Company MSA" },
    { key: "Google Business: Company MSA", label: "Google Business: Company MSA" },
    { key: "Google Business: Region", label: "Google Business: Region" },
    { key: "Google Phone", label: "Google Phone" },
    { key: "Google Business: Notes", label: "Google Business: Notes" },
  ],
  ppp: [
    { key: "FederalPay PPP Link (Url)", label: "FederalPay PPP Link (Url)" },
    { key: "PPP Company Name", label: "PPP Company Name" },
    { key: "PPP Jobs Retained", label: "PPP Jobs Retained" },
    { key: "PPP Total Loan Size", label: "PPP Total Loan Size" },
    { key: "PPP Loan Size(#1)", label: "PPP Loan Size(#1)" },
    { key: "PPP Loan Payroll Amount (#1)", label: "PPP Loan Payroll Amount (#1)" },
    { key: "PPP Loan Size (#2)", label: "PPP Loan Size (#2)" },
    { key: "PPP Loan Payroll Amount (#2)", label: "PPP Loan Payroll Amount (#2)" },
    { key: "PPP Address", label: "PPP Address" },
    { key: "PPP Street", label: "PPP Street" },
    { key: "PPP City", label: "PPP City" },
    { key: "PPP State", label: "PPP State" },
    { key: "PPP Zip Code", label: "PPP Zip Code" },
    { key: "PPP Country", label: "PPP Country" },
    { key: "PPP: Full Company MSA", label: "PPP: Full Company MSA" },
    { key: "PPP: Company MSA", label: "PPP: Company MSA" },
    { key: "PPP: Region", label: "PPP: Region" },
    { key: "PPP Business Demographics", label: "PPP Business Demographics" },
    { key: "PPP NAICS Code", label: "PPP NAICS Code" },
    { key: "PPP Business Owner Demographics", label: "PPP Business Owner Demographics" },
    { key: "PPP: Notes", label: "PPP: Notes" },
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
    { key: "SoS Agent: Full Company MSA", label: "SoS Agent: Full Company MSA" },
    { key: "SoS Agent: Company MSA", label: "SoS Agent: Company MSA" },
    { key: "SoS Agent: Region", label: "SoS Agent: Region" },
    { key: "SoS Principal Address", label: "SoS Principal Address" },
    { key: "SoS Principal Street", label: "SoS Principal Street" },
    { key: "SoS Principal City", label: "SoS Principal City" },
    { key: "SoS Principal State", label: "SoS Principal State" },
    { key: "SoS Principal Zip Code", label: "SoS Principal Zip Code" },
    { key: "SoS Principal Country", label: "SoS Principal Country" },
    { key: "SoS Principal: Full Company MSA", label: "SoS Principal: Full Company MSA" },
    { key: "SoS Principal: Company MSA", label: "SoS Principal: Company MSA" },
    { key: "SoS Principal: Region", label: "SoS Principal: Region" },
    { key: "SoS Registered Agent", label: "SoS Registered Agent" },
    { key: "SoS Officers", label: "SoS Officers" },
    { key: "SoS Year Founded", label: "SoS Year Founded" },
    { key: "SoS: Notes", label: "SoS: Notes" },
    { key: "Secretary of State: Could Not Access", label: "Secretary of State: Could Not Access" },
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

function FieldGrid({
  data,
  fields,
}: {
  data: CompanyData;
  fields: FieldDef[];
}) {
  // Case-insensitive safe getter (your sheet headings can vary)
  const get = (k: string) => {
    if (k in data) return data[k];
    // try case-insensitive
    const hit = Object.keys(data).find((kk) => kk.toLowerCase() === k.toLowerCase());
    return hit ? data[hit] : undefined;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map(({ key, label }) => {
        const val = get(key);
        const display =
          val === null || val === undefined || String(val).trim() === "" ? "—" : String(val);
        const isUrl = typeof val === "string" && /^https?:\/\//i.test(val);

        return (
          <div key={key}>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            {isUrl ? (
              <a
                href={val as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {val as string}
              </a>
            ) : (
              <p className="break-words">{display}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =================== PAGE ===================
export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams() as { id?: string[] | string };
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [record, setRecord] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("details");

  // Build supabase client (v2) — safe for anon read
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
  }, []);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/clients/${id}/get`);
          if (!res.ok) throw new Error(`Failed to fetch details (status ${res.status})`);
          const json = await res.json();
          if (!json.success) throw new Error(json.error || "API returned error");

          // ✅ FIX: flatten "client" data so FieldGrid can read directly
          const flatData = json.client || json;

          // Optional: Debug log (you can remove it after testing)
          console.log("Loaded record data:", flatData);

          setRecord(flatData as CompanyData);
      } catch (e) {
        console.error("Error loading company details:", e);
        setRecord(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading Company details…</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Company Not Found</h1>
        </div>
        <p>The record you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push("/clients")}>Return to Companies</Button>
      </div>
    );
  }

  const title = record["Account Name"] || record["Website Company Name"] || `Company #${record.id}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                ID: {String(record.id || record.Id || "—")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details (Account Info)</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="bbb">BBB</TabsTrigger>
          <TabsTrigger value="google">Google Business</TabsTrigger>
          <TabsTrigger value="ppp">PPP</TabsTrigger>
          <TabsTrigger value="sos">SoS</TabsTrigger>
          <TabsTrigger value="source">Source Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Details */}
        <TabsContent value="details" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">
            Account / Website Details
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Website / General Company Info</CardTitle>
              <CardDescription>Primary information captured from the website and public sources.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGrid data={record} fields={GROUPS.details} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* LinkedIn */}
        <TabsContent value="linkedin" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">LinkedIn</h2>
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Data</CardTitle>
              <CardDescription>Company profile and signals from LinkedIn.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGrid data={record} fields={GROUPS.linkedin} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* BBB */}
        <TabsContent value="bbb" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">BBB</h2>
          <Card>
            <CardHeader>
              <CardTitle>BBB Data</CardTitle>
              <CardDescription>Better Business Bureau profile and attributes.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGrid data={record} fields={GROUPS.bbb} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Business */}
        <TabsContent value="google" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">Google Business</h2>
          <Card>
            <CardHeader>
              <CardTitle>Google Business Profile</CardTitle>
              <CardDescription>Review metrics, address and phone from GBP.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGrid data={record} fields={GROUPS.google} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PPP */}
        <TabsContent value="ppp" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">PPP (FederalPay)</h2>
          <Card>
            <CardHeader>
              <CardTitle>Paycheck Protection Program</CardTitle>
              <CardDescription>Loan and demographics data from FederalPay.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGrid data={record} fields={GROUPS.ppp} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SoS */}
        <TabsContent value="sos" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">Secretary of State</h2>
          <Card>
            <CardHeader>
              <CardTitle>SoS Filings</CardTitle>
              <CardDescription>Registered agent, officers, and filing details.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGrid data={record} fields={GROUPS.sos} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Source Info */}
        <TabsContent value="source" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">Source / Location Metadata</h2>
          <Card>
            <CardHeader>
              <CardTitle>Source & Locations</CardTitle>
              <CardDescription>Primary and additional locations with their sources.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGrid data={record} fields={GROUPS.source} />
              <Separator className="my-6" />
              {/* Auto-list any extra "Source" keys you might have (Source for #2/#3/#4/etc.) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(record)
                  .filter(
                    (k) =>
                      /^source$/i.test(k) ||
                      (/^source\b/i.test(k) && !GROUPS.source.find((f) => f.key.toLowerCase() === k.toLowerCase()))
                  )
                  .map((k) => (
                    <div key={k}>
                      <p className="text-sm font-medium text-gray-500">{k}</p>
                      <p className="break-words">{String(record[k] ?? "—")}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-4 pt-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-4 mt-0">Documents</h2>
          <Card>
            <CardHeader>
              <CardTitle>Company Files</CardTitle>
              <CardDescription>Uploaded documents and agreements for this record.</CardDescription>
            </CardHeader>
            <CardContent>
              <InlineDocumentList recordId={record.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
