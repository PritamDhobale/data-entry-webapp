"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

/** ---------------- ZIP Lookup + MSA Helpers ---------------- */
const ZIP_CACHE: Record<string, { city: string; state: string; msa?: string }> = {};

/** Fetches city & state from Zippopotam (no API key needed) */
async function fetchZipInfo(zip: string) {
  if (ZIP_CACHE[zip]) return ZIP_CACHE[zip];

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    const city = place?.["place name"] || "";
    const state = place?.["state"] || "";
    ZIP_CACHE[zip] = { city, state };
    return ZIP_CACHE[zip];
  } catch (err) {
    console.error("ZIP lookup failed:", err);
    return null;
  }
}

/** Fetches MSA info from your Supabase zip_lookup table (via /api/msa route) */
async function fetchMsa(zip: string): Promise<string> {
  if (ZIP_CACHE[zip]?.msa) return ZIP_CACHE[zip].msa!;

  try {
    const res = await fetch(`/api/msa?zip=${zip}`); // ✅ new Supabase API
    if (!res.ok) {
      console.error("MSA lookup failed: bad response", res.status);
      return "";
    }

    const data = await res.json();
    const msa = data.msa || "";
    ZIP_CACHE[zip] = { ...(ZIP_CACHE[zip] || {}), msa };
    return msa;
  } catch (err) {
    console.error("MSA lookup failed:", err);
    return "";
  }
}

/* ------------------------------ BRAND ---------------------------------- */
const BRAND = {
  primary: "#112B74",
  primaryHover: "#0e2360",
};

/* -------------------------- FIELD DEFINITIONS --------------------------- */
/** Helper to convert a label to a DB-safe key. Mirrors your table columns. */
const toKey = (label: string) =>
  label
    .replace(/#/g, "num")
    .replace(/[^\w]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();

/** Section list in the order you wanted on the tab bar */
const TAB_ORDER = [
  { id: "details", title: "Details (Account Info)" },
  { id: "linkedin", title: "LinkedIn" },
  { id: "bbb", title: "BBB" },
  { id: "google_business", title: "Google Business" },
  { id: "ppp", title: "PPP" },
  { id: "sos", title: "SoS" },
  { id: "source_info", title: "Source Info" },
  // { id: "documents", title: "Documents" },
  { id: "metadata", title: "Metadata" },
] as const;

/**
 * Full schema built from the 161-field sheet you shared (kept 1:1).
 * label = human label from your sheet, name = normalized DB column key.
 * If you need to rename a DB column, change only "name".
 */
const FIELDS_BY_SECTION: Record<
  (typeof TAB_ORDER)[number]["id"],
  { label: string; name: string }[]
> = {
    /* ---------------------- DETAILS (WEBSITE / ACCOUNT) ---------------------- */
  details: [
    { label: "Account Name", name: "account_name" },
    { label: "Website", name: "website" },
    { label: "Website Company Name", name: "website_company_name" },
    { label: "Website Company Name Abbreviated", name: "website_company_name_abbreviated" },
    { label: "Website Address", name: "website_address" },
    { label: "Website Street", name: "website_street" },
    { label: "Website City", name: "website_city" },
    { label: "Website State", name: "website_state" },
    { label: "Website Zip Code", name: "website_zip_code" },
    { label: "Website Country", name: "website_country" },
    { label: "Website: Full Company MSA", name: "website_full_company_msa" },
    { label: "Website: Company MSA", name: "website_company_msa" },
    { label: "Website: Region", name: "website_region" },
    { label: "Website Office Phone", name: "website_office_phone" },
    { label: "Website Contacts", name: "website_contacts" },
    { label: "Website Locations", name: "website_locations" },
    { label: "Website Year Founded", name: "website_year_founded" },
    { label: "Website Employees", name: "website_employees" },
    { label: "Website Designations", name: "website_designations" },
    { label: "Website: Could Not Access", name: "website_could_not_access" },
  ],

  /* ------------------------------ LINKEDIN ------------------------------ */
    /* ------------------------------ LINKEDIN ------------------------------ */
  linkedin: [
    { label: "Website Notes", name: "website_notes" },
    { label: "LinkedIn Possible #1", name: "linkedin_possible_1" },
    { label: "LinkedIn Possible #2", name: "linkedin_possible_2" },
    { label: "LinkedIn URL", name: "linkedin_url" },
    { label: "LinkedIn Company Name", name: "linkedin_company_name" },
    { label: "LinkedIn Overview", name: "linkedin_overview" },
    { label: "LinkedIn Followers", name: "linkedin_followers" },
    { label: "LinkedIn Phone", name: "linkedin_phone" },
    { label: "LinkedIn Industry", name: "linkedin_industry" },
    { label: "LinkedIn Employee Estimate", name: "linkedin_employee_estimate" },
    { label: "LinkedIn Members", name: "linkedin_members" },
    { label: "LinkedIn Headquarters", name: "linkedin_headquarters" },
    { label: "LinkedIn Founded Year", name: "linkedin_founded_year" },
    { label: "LinkedIn Specialties", name: "linkedin_specialties" },
    { label: "LinkedIn Contacts", name: "linkedin_contacts" },
    { label: "LinkedIn Locations", name: "linkedin_locations" },
    { label: "LinkedIn Primary Location", name: "linkedin_primary_location" },
    { label: "LinkedIn Street", name: "linkedin_street" },
    { label: "LinkedIn City", name: "linkedin_city" },
    { label: "LinkedIn State", name: "linkedin_state" },
    { label: "LinkedIn Zip Code", name: "linkedin_zip_code" },
    { label: "LinkedIn Country", name: "linkedin_country" },
    { label: "LinkedIn Full Company MSA", name: "linkedin_full_company_msa" },
    { label: "LinkedIn Company MSA", name: "linkedin_company_msa" },
    { label: "LinkedIn Region", name: "linkedin_region" },
    { label: "LinkedIn Notes", name: "linkedin_notes" },
    { label: "LinkedIn Unclaimed Page", name: "linkedin_unclaimed_page" },
    { label: "LinkedIn Could Not Access", name: "linkedin_could_not_access" },
  ],

  /* --------------------------------- BBB -------------------------------- */
  bbb: [
    { label: "BBB Link (Url)", name: "bbb_link_url" },
    { label: "BBB Company Name", name: "bbb_company_name" },
    { label: "BBB Business Started", name: "bbb_business_started" },
    { label: "BBB Type of Entity", name: "bbb_type_of_entity" },
    { label: "BBB Alternate Names", name: "bbb_alternate_names" },
    { label: "BBB Address", name: "bbb_address" },
    { label: "BBB Street", name: "bbb_street" },
    { label: "BBB City", name: "bbb_city" },
    { label: "BBB State", name: "bbb_state" },
    { label: "BBB Zip Code", name: "bbb_zip_code" },
    { label: "BBB Country", name: "bbb_country" },
    { label: "BBB: Full Company MSA", name: "bbb_full_company_msa" },
    { label: "BBB: Company MSA", name: "bbb_company_msa" },
    { label: "BBB: Region", name: "bbb_region" },
    { label: "BBB Customer Contacts", name: "bbb_customer_contacts" },
    { label: "BBB: Notes", name: "bbb_notes" },
    { label: "BBB Accredited", name: "bbb_accredited" },
    { label: "BBB: Could Not Access", name: "bbb_could_not_access" },
  ],

  /* --------------------------- GOOGLE BUSINESS -------------------------- */
  google_business: [
    { label: "Google Business Page (Url)", name: "google_business_page_url" },
    { label: "Google Company Name", name: "google_company_name" },
    { label: "Google Reviews", name: "google_reviews" },
    { label: "Google Rating", name: "google_rating" },
    { label: "Google Address", name: "google_address" },
    { label: "Google Business Street", name: "google_business_street" },
    { label: "Google Business City", name: "google_business_city" },
    { label: "Google Business State", name: "google_business_state" },
    { label: "Google Business Zip Code", name: "google_business_zip_code" },
    { label: "Google Business Country", name: "google_business_country" },
    { label: "Google Business: Full Company MSA", name: "google_business_full_company_msa" },
    { label: "Google Business: Company MSA", name: "google_business_company_msa" },
    { label: "Google Business: Region", name: "google_business_region" },
    { label: "Google Phone", name: "google_phone" },
    { label: "Google Business: Notes", name: "google_business_notes" },
    { label: "Google Business: Could Not Access", name: "google_could_not_access" },
  ],

  /* -------------------------------- PPP --------------------------------- */
  ppp: [
    { label: "FederalPay PPP Link (Url)", name: "federalpay_ppp_url" },
    { label: "PPP Company Name", name: "ppp_company_name" },
    { label: "PPP Jobs Retained", name: "ppp_jobs_retained" },
    { label: "PPP Total Loan Size", name: "ppp_total_loan_size" },
    { label: "PPP Loan Size (#1)", name: "ppp_loan_size_1" },
    { label: "PPP Loan Payroll Amount (#1)", name: "ppp_loan_payroll_amount_1" },
    { label: "PPP Loan Size (#2)", name: "ppp_loan_size_2" },
    { label: "PPP Loan Payroll Amount (#2)", name: "ppp_loan_payroll_amount_2" },
    { label: "PPP Address", name: "ppp_address" },
    { label: "PPP Street", name: "ppp_street" },
    { label: "PPP City", name: "ppp_city" },
    { label: "PPP State", name: "ppp_state" },
    { label: "PPP Zip Code", name: "ppp_zip_code" },
    { label: "PPP Country", name: "ppp_country" },
    { label: "PPP: Full Company MSA", name: "ppp_full_company_msa" },
    { label: "PPP Company MSA", name: "ppp_company_msa" },
    { label: "PPP Region", name: "ppp_region" },
    { label: "PPP Business Demographics", name: "ppp_business_demographics" },
    { label: "PPP NAICS Code", name: "ppp_naics_code" },
    { label: "PPP Business Owner Demographics", name: "ppp_business_owner_demographics" },
    { label: "PPP Notes", name: "ppp_notes" },
    { label: "PPP Could Not Access", name: "ppp_could_not_access" },
  ],

  /* --------------------------------- SoS -------------------------------- */
  sos: [
    { label: "SoS Company Name", name: "sos_company_name" },
    { label: "SoS Fictitious Names", name: "sos_fictitious_names" },
    { label: "SoS Filing Type", name: "sos_filing_type" },
    { label: "SoS Agent Address", name: "sos_agent_address" },
    { label: "SoS Agent Street", name: "sos_agent_street" },
    { label: "SoS Agent City", name: "sos_agent_city" },
    { label: "SoS Agent State", name: "sos_agent_state" },
    { label: "SoS Agent Zip Code", name: "sos_agent_zip_code" },
    { label: "SoS Agent Country", name: "sos_agent_country" },
    { label: "SoS Agent: Full Company MSA", name: "sos_agent_full_company_msa" },
    { label: "SoS Agent: Company MSA", name: "sos_agent_company_msa" },
    { label: "SoS Agent: Region", name: "sos_agent_region" },
    { label: "SoS Principal Address", name: "sos_principal_address" },
    { label: "SoS Principal Street", name: "sos_principal_street" },
    { label: "SoS Principal City", name: "sos_principal_city" },
    { label: "SoS Principal State", name: "sos_principal_state" },
    { label: "SoS Principal Zip Code", name: "sos_principal_zip_code" },
    { label: "SoS Principal Country", name: "sos_principal_country" },
    { label: "SoS Principal: Full Company MSA", name: "sos_principal_full_company_msa" },
    { label: "SoS Principal: Company MSA", name: "sos_principal_company_msa" },
    { label: "SoS Principal: Region", name: "sos_principal_region" },
    { label: "SoS Registered Agent", name: "sos_registered_agent" },
    { label: "SoS Officers", name: "sos_officers" },
    { label: "SoS Year Founded", name: "sos_year_founded" },
    { label: "SoS: Notes", name: "sos_notes" },
    { label: "Secretary of State: Could Not Access", name: "sos_could_not_access" },
  ],

  /* ------------------------------ SOURCE INFO --------------------------- */
  source_info: [
    // { label: "Source", name: "source" },
    { label: "Location (Primary)", name: "location_primary" },
    { label: "Location (Primary) Source", name: "source_primary" },
    { label: "Location (#2)", name: "location_secondary" },
    { label: "Location (#2) Source", name: "source_secondary" },
    { label: "Location (#3)", name: "location_tertiary" },
    { label: "Location (#3) Source", name: "source_tertiary" },
    { label: "Location (#4)", name: "location_fourth" },
    { label: "Location (#4) Source", name: "source_fourth" },
  ],

  /* ------------------------------ METADATA ------------------------------ */
  metadata: [
    { label: "Created At", name: "created_at" },
    // { label: "Modified At", name: "modified_at" },
    // { label: "Data Source", name: "data_source" },
    // { label: "Record Owner", name: "record_owner" },
    // { label: "Import Batch", name: "import_batch" },
    // { label: "Upload Timestamp", name: "upload_timestamp" },
    // { label: "General Notes", name: "general_notes" },
  ],

  /* ------------------------------- DOCUMENTS ---------------------------- */
  // documents: [], // handled separately (file inputs)
};

/** Build a label->key dictionary for CSV upload convenience */
const LABEL_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.values(FIELDS_BY_SECTION)
    .flat()
    .map(({ label, name }) => [label, name])
);

/** Create the full list of DB keys so we initialize state consistently */
const ALL_KEYS: string[] = Object.values(FIELDS_BY_SECTION)
  .flat()
  .map((f) => f.name);

/* ------------------------------- HELPERS -------------------------------- */
/** Best-effort input type inference based on the label/name */
function guessType(label: string, name: string): "text" | "email" | "url" | "number" | "textarea" {
  const l = `${label} ${name}`.toLowerCase();
  if (l.includes("email")) return "email";
  if (l.includes("url") || l.includes("http") || l.includes("link")) return "url";
  if (
    l.includes("zip") ||
    l.includes("num") ||
    l.includes("jobs retained") ||
    l.includes("year founded") ||
    l.includes("employees") ||
    l.includes("loan size") ||
    l.includes("payroll")
  ) {
    return "number";
  }
  if (l.includes("notes")) return "textarea";
  return "text";
}

/** Normalize raw CSV header to one of our keys (supports label OR key) */
function normalizeHeader(h: string): string {
  const trimmed = (h || "").trim();
  if (!trimmed) return "";
  const keyLike = toKey(trimmed);
  // direct matches to an existing db key
  if (ALL_KEYS.includes(trimmed)) return trimmed;
  if (ALL_KEYS.includes(keyLike)) return keyLike;
  // label -> key mapping
  if (LABEL_TO_KEY[trimmed]) return LABEL_TO_KEY[trimmed];
  return keyLike; // fallback (keeps data, even if unexpected)
}

/* --------------------------------- UI ----------------------------------- */
type FormDataState = Record<string, string>;

export function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TAB_ORDER)[number]["id"]>("details");
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  const initial: FormDataState = useMemo(
    () =>
      Object.fromEntries(
        ALL_KEYS.map((k) => [k, ""])
      ) as FormDataState,
    []
  );
  const [form, setForm] = useState<FormDataState>(initial);

  const setValue = async (name: string, value: string) => {
  setForm((p) => ({ ...p, [name]: value }));

  // --- ZIP Code Auto-Fill Logic ---
  if (name.endsWith("zip_code") && value.length === 5 && /^[0-9]{5}$/.test(value)) {
    const zipInfo = await fetchZipInfo(value);
    const msa = await fetchMsa(value);

    if (zipInfo) {
  if (name.includes("website")) {
    setForm((p) => ({
      ...p,
      website_city: zipInfo.city,
      website_state: zipInfo.state,
      website_full_company_msa: msa,
      website_company_msa: msa,
    }));
  } else if (name.includes("linkedin")) {
    setForm((p) => ({
      ...p,
      linkedin_city: zipInfo.city,
      linkedin_state: zipInfo.state,
      linkedin_full_company_msa: msa,
      linkedin_company_msa: msa,
    }));
  } else if (name.includes("ppp")) {
    setForm((p) => ({
      ...p,
      ppp_city: zipInfo.city,
      ppp_state: zipInfo.state,
      ppp_full_company_msa: msa,
      ppp_company_msa: msa,
    }));
  } else if (name.includes("sos") || name.includes("principal")) {
    // ✅ New: handles SoS Principal fields
    setForm((p) => ({
      ...p,
      sos_principal_city: zipInfo.city,
      sos_principal_state: zipInfo.state,
      sos_principal_full_company_msa: msa,
      sos_principal_company_msa: msa,
    }));
  }
}

  }
};


  const downloadTemplate = () => {
    const csv = ALL_KEYS.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "client_template.csv";
    a.click();
  };

  const onUploadCSV: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || "";
      const [headerLine = "", valueLine = ""] = text.split(/\r?\n/);
      if (!headerLine || !valueLine) return;
      const headers = headerLine.split(",").map((h) => h.trim());
      const values = valueLine.split(","); // allow commas—basic handling
      const next: FormDataState = { ...form };
      headers.forEach((h, i) => {
        const key = normalizeHeader(h);
        if (!key) return;
        next[key] = (values[i] ?? "").trim();
      });
      setForm(next);
    };
    reader.readAsText(file);
  };

  const onFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files?.length) return;
    setDocuments(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // ✅ Basic validation
      if (!form.account_name && !form.website_company_name) {
        alert("Please provide at least Account Name or Website Contact Name");
        setSaving(false);
        return;
      }

      // ✅ Define boolean columns exactly as in Supabase schema
      const booleanFields = [
        "website_could_not_access",
        "linkedin_could_not_access",
        "bbb_could_not_access",
        "google_could_not_access",
        "ppp_could_not_access",
        "sos_could_not_access",
      ];

      // ✅ Normalize data before sending to API
      const normalizedPayload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
          const trimmed = typeof value === "string" ? value.trim() : value;

          // Handle booleans
          if (booleanFields.includes(key)) {
            if (trimmed === "true" || trimmed === "1" || trimmed.toLowerCase() === "yes") return [key, true];
            if (trimmed === "false" || trimmed === "0" || trimmed.toLowerCase() === "no") return [key, false];
            return [key, null];
          }

          // Handle numbers (loan sizes, employees, etc.)
          if (
            key.endsWith("_num") ||
            key.includes("loan") ||
            key.includes("employees") ||
            key.includes("year_founded") ||
            key.includes("zip_code") ||
            key.includes("jobs_retained")
          ) {
            const num = parseFloat(trimmed);
            return [key, isNaN(num) ? null : num];
          }

          // Default string → null if empty
          return [key, trimmed === "" ? null : trimmed];
        })
      );

      // ✅ Add created timestamp
      const payload = {
        ...normalizedPayload,
        created_at: new Date().toISOString(),
      };

      // ✅ API request
      const res = await fetch("/api/clients/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to add company");
      }

      const { client_id } = await res.json();

      // ✅ Optional document uploads
      if (client_id && documents.length) {
        for (const file of documents) {
          const fd = new FormData();
          fd.append("client_id", String(client_id));
          fd.append("documents", file);
          await fetch("/api/files/upload", { method: "POST", body: fd });
        }
      }

      // ✅ Reset form + close modal
      setForm(initial);
      setDocuments([]);
      setOpen(false);
    } catch (err: any) {
      console.error("Create company failed:", err?.message || err);
      alert(err?.message || "Create company failed");
    } finally {
      setSaving(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-white"
          style={{ backgroundColor: BRAND.primary }}
          onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primaryHover))}
          onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primary))}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Company
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl h-[85vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Fill in the fields below. You can also download a CSV template or upload one to auto-fill.
          </DialogDescription>
        </DialogHeader>

        {/* Actions row */}
        <div className="flex flex-wrap gap-3 justify-end pb-2">
          <Button
            onClick={downloadTemplate}
            className="text-white"
            style={{ backgroundColor: BRAND.primary }}
            onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primaryHover))}
            onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primary))}
          >
            Download CSV Template
          </Button>

          <label
            className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer text-white"
            style={{ backgroundColor: BRAND.primary }}
            onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primaryHover))}
            onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primary))}
          >
            Upload CSV
            <input type="file" accept=".csv" onChange={onUploadCSV} className="hidden" />
          </label>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="mt-4 flex-1 overflow-y-auto"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            {TAB_ORDER.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="whitespace-nowrap">
                {t.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {TAB_ORDER.filter((t) => String(t.id) !== "documents").map((t) => (
  <TabsContent key={t.id} value={t.id as string} className="mt-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {FIELDS_BY_SECTION[t.id as keyof typeof FIELDS_BY_SECTION].map(({ label, name }) => {
        const type = guessType(label, name);

        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>

            {/* ✅ 1. Handle "Could Not Access" fields as True/False picklists */}
            {name.includes("could_not_access") ? (
              <select
                id={name}
                value={form[name] || "false"}
                onChange={(e) => setValue(name, e.target.value)}
                className="border rounded-md p-2 w-full"
              >
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            ) : 
            /* ✅ 2. Handle textarea fields normally */ 
            type === "textarea" ? (
              <Textarea
                id={name}
                value={form[name] || ""}
                onChange={(e) => setValue(name, e.target.value)}
                className="min-h-[92px]"
                placeholder={label}
              />
            ) : 
            /* ✅ 3. Add a clickable Website link (still editable) */ 
            name === "website" ? (
              <div>
                <Input
                  id={name}
                  type="text"
                  value={form[name] || ""}
                  onChange={(e) => setValue(name, e.target.value)}
                  placeholder={label}
                />
                {form[name] && (
                  <a
                    href={form[name].startsWith("http") ? form[name] : `https://${form[name]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ) : (
              /* ✅ 4. All other fields default */
              <Input
                id={name}
                type={type === "number" ? "text" : type}
                inputMode={type === "number" ? "numeric" : undefined}
                value={form[name] || ""}
                onChange={(e) => setValue(name, e.target.value)}
                placeholder={label}
              />
            )}
          </div>
        );
      })}
    </div>
  </TabsContent>
))}


        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="text-white"
            style={{ backgroundColor: BRAND.primary }}
            onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primaryHover))}
            onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = BRAND.primary))}
          >
            {saving ? "Creating..." : "Create Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewClientForm;
