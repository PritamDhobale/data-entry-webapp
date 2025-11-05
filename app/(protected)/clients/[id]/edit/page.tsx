"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, X } from "lucide-react";

// ---------- Types ----------
type CompanyData = {
  id: string;                // primary key in company_data
  practice_name?: string | null;
  dba?: string | null;
  code?: string | null;
  owner_code?: string | null;
  website?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  email?: string | null;
  phone?: string | null;

  // LinkedIn
  linkedin_url?: string | null;
  linkedin_followers?: string | null;
  linkedin_about?: string | null;
  linkedin_notes?: string | null;

  // BBB
  bbb_url?: string | null;
  bbb_rating?: string | null;
  bbb_complaints?: string | null;
  bbb_notes?: string | null;

  // Google Business
  gmb_url?: string | null;
  gmb_rating?: string | null;
  gmb_reviews_count?: string | null;
  gmb_owner?: string | null;
  gmb_notes?: string | null;

  // PPP (Payment/Portal/Profile)
  ppp_url?: string | null;
  ppp_username?: string | null;
  ppp_notes?: string | null;

  // SoS (Secretary of State)
  sos_state?: string | null;
  sos_entity_id?: string | null;
  sos_status?: string | null;
  sos_url?: string | null;
  sos_notes?: string | null;

  // Source Info
  source?: string | null;
  source_type?: string | null;
  source_owner?: string | null;
  source_notes?: string | null;

  // free text
  notes?: string | null;
};

// ---------- Field Config (tab -> fields) ----------
type FieldDef = { key: keyof CompanyData; label: string; type?: "input" | "textarea" };

const GROUPS: Record<
  string,
  { title: string; fields: FieldDef[] }
> = {
  details: {
    title: "Details (Account Info)",
    fields: [
      { key: "practice_name", label: "Practice Name" },
      { key: "dba", label: "DBA" },
      { key: "code", label: "Code" },
      { key: "owner_code", label: "Owner Category (M/F/S/C/X)" },
      { key: "website", label: "Website URL" },
      { key: "street_address", label: "Street Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "zip", label: "Zip" },
      { key: "email", label: "Primary Email" },
      { key: "phone", label: "Primary Phone" },
      { key: "notes", label: "General Notes", type: "textarea" },
    ],
  },
  linkedin: {
    title: "LinkedIn",
    fields: [
      { key: "linkedin_url", label: "LinkedIn URL" },
      { key: "linkedin_followers", label: "Followers" },
      { key: "linkedin_about", label: "About (short)", type: "textarea" },
      { key: "linkedin_notes", label: "LinkedIn Notes", type: "textarea" },
    ],
  },
  bbb: {
    title: "BBB",
    fields: [
      { key: "bbb_url", label: "BBB URL" },
      { key: "bbb_rating", label: "BBB Rating" },
      { key: "bbb_complaints", label: "Complaints (count/summary)" },
      { key: "bbb_notes", label: "BBB Notes", type: "textarea" },
    ],
  },
  gmb: {
    title: "Google Business",
    fields: [
      { key: "gmb_url", label: "Google Business URL" },
      { key: "gmb_rating", label: "Rating" },
      { key: "gmb_reviews_count", label: "Reviews Count" },
      { key: "gmb_owner", label: "Profile Owner/Manager" },
      { key: "gmb_notes", label: "GMB Notes", type: "textarea" },
    ],
  },
  ppp: {
    title: "PPP",
    fields: [
      { key: "ppp_url", label: "Portal/Profile URL" },
      { key: "ppp_username", label: "Username/Handle" },
      { key: "ppp_notes", label: "PPP Notes", type: "textarea" },
    ],
  },
  sos: {
    title: "SoS",
    fields: [
      { key: "sos_state", label: "State" },
      { key: "sos_entity_id", label: "Entity ID" },
      { key: "sos_status", label: "Status" },
      { key: "sos_url", label: "SoS URL" },
      { key: "sos_notes", label: "SoS Notes", type: "textarea" },
    ],
  },
  source: {
    title: "Source Info",
    fields: [
      { key: "source", label: "Source" },
      { key: "source_type", label: "Source Type" },
      { key: "source_owner", label: "Source Owner" },
      { key: "source_notes", label: "Source Notes", type: "textarea" },
    ],
  },
};

// ---------- Helpers ----------
const nullIfEmpty = (v: unknown) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
};

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const rowId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof GROUPS>("details");

  // Fetch record
  useEffect(() => {
    (async () => {
      try {
        if (!rowId) return;
        const { data, error } = await supabase
          .from("company_data")
          .select("*")
          .eq("id", rowId)
          .single();
        if (error) throw error;
        setData(data);
      } catch (e) {
        console.error(e);
        alert("Failed to load client.");
        router.push("/clients");
      } finally {
        setLoading(false);
      }
    })();
  }, [rowId, router]);

  const title = useMemo(() => {
    return data?.practice_name ? `Edit: ${data.practice_name}` : "Edit Client";
  }, [data?.practice_name]);

  const onChangeField = (key: keyof CompanyData, value: string) => {
    setData((prev) =>
      prev ? { ...prev, [key]: value } as CompanyData : prev
    );
    setDirty(true);
  };

  const onSave = async () => {
    if (!data?.id) {
      alert("Missing record ID.");
      return;
    }
    setSaving(true);
    try {
      // prepare payload with nulls for blank strings
      const payload: Partial<CompanyData> = {};
      Object.keys(data).forEach((k) => {
        const key = k as keyof CompanyData;
        if (key === "id") return;
        payload[key] = nullIfEmpty(data[key]);
      });

      const { error } = await supabase
        .from("company_data")
        .update(payload)
        .eq("id", data.id);

      if (error) throw error;
      setDirty(false);
      alert("Saved successfully.");
      router.push(`/clients/${encodeURIComponent(data.id)}`);
    } catch (e) {
      console.error(e);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    if (data?.id) {
      router.push(`/clients/${encodeURIComponent(data.id)}`);
    } else {
      router.push("/clients");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Client not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/clients")}>Go to Clients</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <X className="mr-2 h-4 w-4" />
            Cancel
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
              <TabsTrigger value="gmb">Google Business</TabsTrigger>
              <TabsTrigger value="ppp">PPP</TabsTrigger>
              <TabsTrigger value="sos">SoS</TabsTrigger>
              <TabsTrigger value="source">Source Info</TabsTrigger>
            </TabsList>

            {Object.entries(GROUPS).map(([key, group]) => (
              <TabsContent key={key} value={key}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {group.fields.map((f) => {
                    const val = (data?.[f.key] ?? "") as string;
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

          {/* Footer Save (for long forms) */}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
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
