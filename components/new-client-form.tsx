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
  { id: "documents", title: "Documents" },
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
  /* ---------------------- DETAILS (WEBSITE/ACCOUNT) --------------------- */
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
    { label: "Website Locations (#)", name: "website_locations_num" },
    { label: "Website Year Founded", name: "website_year_founded" },
    { label: "Website Employees", name: "website_employees" },
    { label: "Website Designations", name: "website_designations" },
    { label: "Website: Could Not Access", name: "website_could_not_access" },
    { label: "Website: Notes", name: "website_notes" },
  ],

  /* ------------------------------ LINKEDIN ------------------------------ */
  linkedin: [
    { label: "Account Name", name: "account_name_2" },
    { label: "Website", name: "website_2" },
    { label: "Possible LinkedIn (#1)(Grata)", name: "possible_linkedinnum1_grata" },
    { label: "Possible LinkedIn (#2)(Zoominfo)", name: "possible_linkedinnum2_zoominfo" },
    { label: "LinkedIn (Url)", name: "linkedin_url" },
    { label: "LinkedIn: Could Not Access", name: "linkedin_could_not_access" },
  ],

  /* --------------------------------- BBB -------------------------------- */
  bbb: [
    { label: "BBB Link (Url)", name: "bbb_link_url" },
    { label: "BBB: Could Not Access", name: "bbb_could_not_access" },
  ],

  /* --------------------------- GOOGLE BUSINESS -------------------------- */
  google_business: [
    { label: "Google Business Page (Url)", name: "google_business_page_url" },
    { label: "Google Business: Could Not Access", name: "google_business_could_not_access" },
  ],

  /* -------------------------------- PPP --------------------------------- */
  ppp: [
    { label: "Account Name", name: "account_name_3" },
    { label: "Website", name: "website_3" },
    { label: "FederalPay PPP Link (Url)", name: "federalpay_ppp_link_url" },
    { label: "PPP Company Name", name: "ppp_company_name" },
    { label: "PPP Jobs Retained", name: "ppp_jobs_retained" },
    { label: "PPP Total Loan Size", name: "ppp_total_loan_size" },
    { label: "PPP Loan Size(#1)", name: "ppp_loan_sizenum1" },
    { label: "PPP Loan Payroll Amount (#1)", name: "ppp_loan_payroll_amount_num1" },
    { label: "PPP Loan Size (#2)", name: "ppp_loan_size_num2" },
    { label: "PPP Loan Payroll Amount (#2)", name: "ppp_loan_payroll_amount_num2" },
    { label: "PPP Address", name: "ppp_address" },
    { label: "PPP Street", name: "ppp_street" },
    { label: "PPP City", name: "ppp_city" },
    { label: "PPP State", name: "ppp_state" },
    { label: "PPP Zip Code", name: "ppp_zip_code" },
    { label: "PPP Country", name: "ppp_country" },
    { label: "PPP: Full Company MSA", name: "ppp_full_company_msa" },
  ],

  /* --------------------------------- SoS -------------------------------- */
  sos: [
    { label: "Secretary of State: Company Name", name: "secretary_of_state_company_name" },
    { label: "Secretary of State: Could Not Access", name: "secretary_of_state_could_not_access" },
  ],

  /* ------------------------------ SOURCE INFO --------------------------- */
  source_info: [
    { label: "Source", name: "source" },
    { label: "Location (Primary)", name: "location_primary" },
    { label: "Location (Primary) Source", name: "location_primary_source" },
    { label: "Location (#2)", name: "location_num2" },
    { label: "Location (#2) Source", name: "location_num2_source" },
    { label: "Location (#3)", name: "location_num3" },
    { label: "Location (#3) Source", name: "location_num3_source" },
    { label: "Location (#4)", name: "location_num4" },
    { label: "Location (#4) Source", name: "location_num4_source" },
  ],

  /* ------------------------------- DOCUMENTS ---------------------------- */
  documents: [], // handled separately (file inputs)
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

  const setValue = (name: string, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
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
      // Minimal required check (only what is present in lite form)
      if (!form.account_name && !form.website_company_name) {
        alert("Please provide at least Account Name or Website Company Name");
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        created_at: new Date().toISOString(),
      };

      const res = await fetch("/api/clients/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to add client");
      }

      const { client_id } = await res.json();

      // Optional doc uploads (kept generic; aligns with your upload route)
      if (client_id && documents.length) {
        for (const file of documents) {
          const fd = new FormData();
          fd.append("client_id", String(client_id));
          fd.append("documents", file);
          await fetch("/api/files/upload", { method: "POST", body: fd });
        }
      }

      // Reset and close
      setForm(initial);
      setDocuments([]);
      setOpen(false);
    } catch (err: any) {
      console.error("Create client failed:", err?.message || err);
      alert(err?.message || "Create client failed");
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
          New Client
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
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

          <label className="px-4 py-2 rounded-md text-sm font-medium cursor-pointer border">
            Upload Documents
            <input type="file" multiple onChange={onFiles} className="hidden" />
          </label>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            {TAB_ORDER.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="whitespace-nowrap">
                {t.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {TAB_ORDER.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-4">
              {t.id === "documents" ? (
                <div className="text-sm text-muted-foreground">
                  {documents.length === 0 ? (
                    <p>No documents selected.</p>
                  ) : (
                    <ul className="list-disc pl-5">
                      {documents.map((f, i) => (
                        <li key={i}>
                          {f.name} — {(f.size / 1024).toFixed(1)} KB
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FIELDS_BY_SECTION[t.id].map(({ label, name }) => {
                    const type = guessType(label, name);
                    return (
                      <div key={name} className="space-y-2">
                        <Label htmlFor={name}>{label}</Label>
                        {type === "textarea" ? (
                          <Textarea
                            id={name}
                            value={form[name] || ""}
                            onChange={(e) => setValue(name, e.target.value)}
                            className="min-h-[92px]"
                            placeholder={label}
                          />
                        ) : (
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
              )}
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
            {saving ? "Creating..." : "Create Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewClientForm;




// "use client"

// import { useState, useEffect } from "react"; 
// // import { supabase } from "@/lib/supabaseClient"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { toast } from "@/components/ui/use-toast"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Separator } from "@/components/ui/separator"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { PlusCircle } from "lucide-react"


// // added this line
// interface Service {
//   id: string;
//   service_name: string;
// }


// interface Client {
//   practice_name: "",
//     dba: "",
//     code: "",
//     client_status: "",
//     sla_number: "",
//     primary_contact_title: "",
//     primary_contact_first_name: "",
//     primary_contact_last_name: "",
//     primary_contact_email: "",
//     primary_contact_phone: "",
//     email: "",
//     admin_contact_first_name: "",
//     admin_contact_last_name: "",
//     admin_contact_phone: "",
//     admin_contact_title: "",
//     admin_contact_email: "",
//     authorized_rep_first_name: "",
//     authorized_rep_last_name: "",
//     authorized_rep_phone: "",
//     authorized_rep_title: "",
//     authorized_rep_email: "",
//     city: "",
//     state: "",
//     state_of_formation: "",
//     category_id: "",
//     street_address: "",
//     current_ehr: "",
//     type_of_entity: "",
//     owner_code: "",
//     website: "",
//     zip: "",
//     auto_pay: "",
//     debit_origination: "",
//     Other: "",
//     payment_type: "",
//     agreement_date: "",
//     commencement_date: "",
//     term: "",
//     service_name: "",
//     id: "",
//     service_id: []; // This is important
//     }

// // List of US states for the dropdown
// const US_STATES = [
//   "AL",
//   "AK",
//   "AZ",
//   "AR",
//   "CA",
//   "CO",
//   "CT",
//   "DE",
//   "FL",
//   "GA",
//   "HI",
//   "ID",
//   "IL",
//   "IN",
//   "IA",
//   "KS",
//   "KY",
//   "LA",
//   "ME",
//   "MD",
//   "MA",
//   "MI",
//   "MN",
//   "MS",
//   "MO",
//   "MT",
//   "NE",
//   "NV",
//   "NH",
//   "NJ",
//   "NM",
//   "NY",
//   "NC",
//   "ND",
//   "OH",
//   "OK",
//   "OR",
//   "PA",
//   "RI",
//   "SC",
//   "SD",
//   "TN",
//   "TX",
//   "UT",
//   "VT",
//   "VA",
//   "WA",
//   "WV",
//   "WI",
//   "WY",
// ]

// const EHR_OPTIONS = [
//   "ChiroHD",
//   "ChiroSpring",
//   "ChiroSpring 360",
//   "ChiroTouch",
//   "ChiroTouch Cloud",
//   "Genesis",
//   "Jane",
//   "Neo",
//   "Platinum",
//   "SeamLESS",
// ];

// const OTHER_EHR_OPTIONS = [
//   "Advanced MD",
//   "Autumn 8",
//   "ChiroWay",
//   "ChiroWrite",
//   "Eclipse",
//   "Next Gen",
//   "Platinum 2.0",
//   "Practice Suite",
//   "Rapid EHR",
//   "SilkOne",
//   "Vitalogics",
//   "WritePad",
//   "zHealth",
// ];


// // List of categories
// const CATEGORIES = ["Primary Care", "Specialty", "Hospital", "Other"]

// export function NewClientForm() {
//   const [open, setOpen] = useState(false)
//   //const [services, setServices] = useState<Client[]>([]);
//   const [services, setServices] = useState<Service[]>([]);
//   const [saving, setSaving] = useState(false)
//   const [formData, setFormData] = useState({
//     practice_name: "",
//     dba: "",
//     code: "",
//     client_status: "",
//     sla_number: "",
//     primary_contact_title: "",
//     primary_contact_first_name: "",
//     primary_contact_last_name: "",
//     primary_contact_email: "",
//     primary_contact_phone: "",
//     email: "",
//     admin_contact_first_name: "",
//     admin_contact_last_name: "",
//     admin_contact_phone: "",
//     admin_contact_title: "",
//     admin_contact_email: "",
//     authorized_rep_first_name: "",
//     authorized_rep_last_name: "",
//     authorized_rep_phone: "",
//     authorized_rep_credential: "",
//     authorized_rep_title: "",
//     authorized_rep_email: "",
//     city: "",
//     state: "",
//     state_of_formation: "",
//     category_id: "",
//     street_address: "",
//     current_ehr: "",
//     type_of_entity: "",
//     owner_code: "",
//     website: "",
//     zip: "",
//     auto_pay: "",
//     debit_origination: "",
//     payment_type: "",
//     Other: "",
//     agreement_date: "",
//     commencement_date: "",
//     term: "",
//     service_ids: [] as string[],
//   // Ensure services is typed as an array of strings (string[])
//   })
  
//   const handleChange = (field: string, value: any) => {
//     setFormData({
//       ...formData,
//       [field]: value,  // Directly update the field with the selected value
//     });
//   };

//   const [documents, setDocuments] = useState<File[]>([])

//   const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setDocuments(Array.from(e.target.files));
//     }
//   }

//   // useEffect(() => {
//   //   // Replace your old services fetching logic
//   //     const fetchServices = async () => {
//   //       try {
//   //         // const res = await fetch("/api/services/get");
//   //         const res = await fetch("/api/services/list");
//   //         if (!res.ok) throw new Error("Failed to fetch services");
//   //         const data = await res.json();
//   //         setServices(data);  // <<<<< ADD THIS LINE
//   //         console.log("Fetched services:", data); // <<<<< ADD THIS LINE
//   //         return data;
//   //       } catch (err) {
//   //         console.error("Error fetching services:", err);
//   //         return [];
//   //       }
//   //     };
//   //   // Fetch services and set state
//   //   fetchServices();
//   // }, []);
  
//   const handleSubmit = async () => {
//   setSaving(true);

//   const requiredFields = [
//     "practice_name",
//     "primary_contact_first_name",
//     "primary_contact_last_name",
//     "primary_contact_email",
//     "primary_contact_phone",
//   ];

//   const missing = requiredFields.filter(
//     (field) => !(formData as Record<string, any>)[field]
//   );

//   if (missing.length > 0) {
//     alert(`Please fill in the required fields: ${missing.join(", ")}`);
//     setSaving(false);
//     return;
//   }

//   try {
//     const payload = {
//       ...formData,
//       zip: formData.zip !== "" ? Number(formData.zip) : null,
//       category_id: formData.category_id !== "" ? Number(formData.category_id) : null,
//       created_at: new Date().toISOString(),
//     };

//     // ✅ NEW: Send everything in a single API call
//     const res = await fetch("/api/clients/add", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       throw new Error("Failed to add client");
//     }

//     const result = await res.json();
//     const clientId = result.client_id;

//     if (!clientId) {
//       throw new Error("Client ID not returned from API");
//     }

//     // 🔔 Log notification
//     await fetch("/api/notifications/add", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         message: `New client added: ${formData.practice_name}`,
//         type: "client",
//         created_at: new Date().toISOString(),
//       }),
//     });

//     // 🕘 Log history
//     await fetch("/api/history/add", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         action: "add",
//         entity: "client",
//         description: `Client ${formData.practice_name} added.`,
//         timestamp: new Date().toISOString(),
//       }),
//     });

//     // 📄 Handle file uploads (compatible with Azure Blob and existing FileUploadDialog)
// if (documents.length > 0) {
//   for (const file of documents) {
//     const formData = new FormData();
//     formData.append("documents", file); // must match 'documents' key in upload.ts
//     formData.append("client_id", clientId); // must match 'client_id' key in upload.ts

//     const uploadRes = await fetch("/api/files/upload", {
//       method: "POST",
//       body: formData,
//     });

//     if (!uploadRes.ok) {
//       const errMsg = await uploadRes.text();
//       console.error("File upload failed:", errMsg);
//     }
//   }
// }

//     // ✅ Reset state
//     setOpen(false);
//     setFormData({
//       practice_name: "",
//       dba: "",
//       code: "",
//       client_status: "",
//       sla_number: "",
//       primary_contact_title: "",
//       primary_contact_first_name: "",
//       primary_contact_last_name: "",
//       primary_contact_email: "",
//       primary_contact_phone: "",
//       email: "",
//       admin_contact_first_name: "",
//       admin_contact_last_name: "",
//       admin_contact_phone: "",
//       admin_contact_title: "",
//       admin_contact_email: "",
//       authorized_rep_first_name: "",
//       authorized_rep_last_name: "",
//       authorized_rep_phone: "",
//       authorized_rep_credential: "",
//       authorized_rep_title: "",
//       authorized_rep_email: "",
//       city: "",
//       state: "",
//       state_of_formation: "",
//       category_id: "",
//       street_address: "",
//       current_ehr: "",
//       type_of_entity: "",
//       owner_code: "",
//       website: "",
//       zip: "",
//       auto_pay: "",
//       debit_origination: "",
//       payment_type: "",
//       Other: "",
//       agreement_date: "",
//       commencement_date: "",
//       term: "",
//       service_ids: [],
//     });
//     setDocuments([]);

//   } catch (err) {
//     console.error("Unexpected error while adding client:", err);
//   } finally {
//     setSaving(false);
//   }
// };

  
    
//   // Download CSV template with headers only
// const downloadTemplate = () => {
//   const headers = Object.keys(formData).join(",");
//   const csvContent = `${headers}\n`; // Just headers
//   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.setAttribute("download", "new_client_template.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

// // Upload CSV and auto-populate form
// const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = (event) => {
//     const csv = event.target?.result as string;
//     const [headerLine, valueLine] = csv.split("\n");
//     const headers = headerLine.split(",").map(h => h.trim());
//     const values = valueLine.split(",").map(v => v.trim());

//     const parsed: any = {};
//     headers.forEach((key, i) => {
//       if (key === "service_ids") {
//         parsed[key] = values[i]?.split(";").map((id) => id.trim());
//       } else if (key === "agreement_date" || key === "commencement_date") {
//         const date = new Date(values[i]);
//         if (!isNaN(date.getTime())) {
//           parsed[key] = date.toISOString().split("T")[0]; // format: yyyy-mm-dd
//         } else {
//           parsed[key] = "";
//         }
//       } else {
//         parsed[key] = values[i];
//       }
//     });

//     setFormData((prev) => ({
//       ...prev,
//       ...parsed,
//     }));
//   };
//   reader.readAsText(file);
// };



//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button>
//           <PlusCircle className="mr-2 h-4 w-4" />
//           New Client
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Add New Client</DialogTitle>
//           <DialogDescription>Enter the client details below to create a new client record.</DialogDescription>
//         </DialogHeader>
//         <div className="flex justify-end gap-4 pb-2">
//   <Button
//     onClick={downloadTemplate}
//     className="bg-[#8bc53d] hover:bg-[#79b231] text-white font-semibold shadow-md"
//   >
//     Download Client Form Template
//   </Button>

//   <label className="cursor-pointer bg-[#8bc53d] hover:bg-[#79b231] text-white font-semibold shadow-md px-4 py-2 rounded text-sm flex items-center justify-center">
//     Upload Client Form
//     <Input
//       type="file"
//       accept=".csv"
//       onChange={handleUploadCSV}
//       className="hidden"
//     />
//   </label>
// </div>



//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
//           {/* Basic Information */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-medium">Corporate Information</h3>

//             <div className="space-y-2">
//               <Label htmlFor="practice_name">Practice Name *</Label>
//               <Input
//                 id="practice_name"
//                 value={formData.practice_name}
//                 onChange={(e) => handleChange("practice_name", e.target.value)}
//                 required
//               />
//             </div>
//              <div className="space-y-2">
//               <Label htmlFor="dba">DBA</Label>
//               <Input
//                 id="dba"
//                 value={formData.dba}
//                 onChange={(e) => handleChange("dba", e.target.value)}
//                 required
//               />
//             </div>
//              <div className="space-y-2">
//               <Label htmlFor="owner_code">Category</Label>
//               <Select
//                 value={formData.owner_code}
//                 onValueChange={(value) => handleChange("owner_code", value)}
//               >
//                 <SelectTrigger id="owner_code">
//                   <SelectValue placeholder="Select owner category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="M">M — Multi-location & Single-owner</SelectItem>
//                   <SelectItem value="F">F — Multi-location (franchise incl.) & Multi-owners</SelectItem>
//                   <SelectItem value="S">S — Single-location & Individual-owner</SelectItem>
//                   <SelectItem value="C">C — Corporate & EHR/EMR/SaaS Client</SelectItem>
//                   <SelectItem value="X">X — Unique-case & Other-category</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//                 <Label htmlFor="state">State *</Label>
//                 <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
//                     <SelectTrigger id="state">
//                       <SelectValue placeholder="Select state" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {US_STATES.map((state) => (
//                         <SelectItem key={state} value={state}>
//                           {state}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//               </div>
//               <div className="space-y-2">
//               <Label htmlFor="type_of_entity">Type of Entity</Label>
//               <Select
//                 value={formData.type_of_entity}
//                 onValueChange={(value) => handleChange("type_of_entity", value)}
//               >
//                 <SelectTrigger id="type_of_entity">
//                   <SelectValue placeholder="Select type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="C-Corp">C-Corp</SelectItem>
//                   <SelectItem value="S-Corp">S-Corp</SelectItem>
//                   <SelectItem value="LLC">LLC</SelectItem>
//                   <SelectItem value="PLLC">PLLC</SelectItem>
//                   <SelectItem value="PA">PA</SelectItem>
//                   <SelectItem value="PC">PC</SelectItem>
//                   <SelectItem value="Other (Specify)">Other (Specify)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             {/* <div className="space-y-2">
//               <Label htmlFor="current_ehr">EHR</Label>
//               <Select
//                 value={formData.current_ehr ?? ""}
//                 onValueChange={(value) => handleChange("current_ehr", value)}
//               >
//                 <SelectTrigger id="current_ehr">
//                   <SelectValue placeholder="Select EHR" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {EHR_OPTIONS.map((ehr) => (
//                     <SelectItem key={ehr} value={ehr}>
//                       {ehr}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div> */}
//               <div className="space-y-2">
//                 <Label htmlFor="state_of_formation">State of Formation *</Label>
//                 <Select value={formData.state_of_formation} onValueChange={(value) => handleChange("state_of_formation", value)}>
//                 <SelectTrigger id="state_of_formation">
//                   <SelectValue placeholder="Select state of formation" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {US_STATES.map((state) => (
//                     <SelectItem key={state} value={state}>
//                       {state}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               </div>

//               <div className="space-y-2">
//               <Label htmlFor="auto_pay">Auto Pay</Label>
//               <Select value={formData.auto_pay} onValueChange={(value) => handleChange("auto_pay", value)}>
//                 <SelectTrigger id="auto_pay">
//                   <SelectValue placeholder="Select" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="yes">Yes</SelectItem>
//                   <SelectItem value="no">No</SelectItem>
//                   <SelectItem value="na">N/A</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="payment_type">Type</Label>
//               <Select value={formData.payment_type} onValueChange={(value) => handleChange("payment_type", value)}>
//                 <SelectTrigger id="payment_type">
//                   <SelectValue placeholder="Select Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="credit_card">Credit Card</SelectItem>
//                   <SelectItem value="ach">ACH</SelectItem>
//                   <SelectItem value="check">Check</SelectItem>
//                   <SelectItem value="na">N/A</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <Label htmlFor="debit_origination">Debit Origination</Label>
//             <Select
//               value={formData.debit_origination}
//               onValueChange={(value) => handleChange("debit_origination", value)}
//             >
//               <SelectTrigger id="debit_origination">
//                 <SelectValue placeholder="Select" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="yes">Yes</SelectItem>
//                 <SelectItem value="no">No</SelectItem>
//                 <SelectItem value="na">N/A</SelectItem>
//               </SelectContent>
//             </Select>

//             <div className="space-y-2">
//               <Label htmlFor="street">Location</Label>
//               <Input id="street" value={formData.street_address} onChange={(e) => handleChange("street_address", e.target.value)} />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="city">City</Label>
//                 <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
//               </div>
//               </div>

//                <div className="space-y-2">
//               <Label htmlFor="zip">Zip Code</Label>
//               <Input id="zip" value={formData.zip} onChange={(e) => handleChange("zip", e.target.value)} />
//             </div>

//              <div className="space-y-2">
//               <Label htmlFor="website">URL</Label>
//               <Input id="website" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="Other">Other</Label>
//               <Input
//                 id="Other"
//                 value={formData.Other}
//                 onChange={(e) => handleChange("Other", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-1 gap-4">
//               <h3 className="text-lg font-medium">Contact Details</h3>
            
//             <div className="space-y-2">
//               <Label htmlFor="primary_contact_first_name">Primary (Contact Signer) First Name *</Label>
//               <Input
//                 id="primary_contact_first_name"
//                 value={formData.primary_contact_first_name}
//                 onChange={(e) => handleChange("primary_contact_first_name", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="primary_contact_last_name">Primary (Contact Signer) Last Name *</Label>
//               <Input
//                 id="primary_contact_last_name"
//                 value={formData.primary_contact_last_name}
//                 onChange={(e) => handleChange("primary_contact_last_name", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="primary_contact_title">Primary (Contact Signer) Title *</Label>
//               <Input
//                 id="primary_contact_title"
//                 value={formData.primary_contact_title}
//                 onChange={(e) => handleChange("primary_contact_title", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="primary_contact_email">Primary (Contact Signer) Email *</Label>
//               <Input
//                 id="primary_contact_email"
//                 value={formData.primary_contact_email}
//                 onChange={(e) => handleChange("primary_contact_email", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="primary_contact_phone">Primary (Contact Signer) Phone *</Label>
//               <Input
//                 id="primary_contact_phone"
//                 value={formData.primary_contact_phone}
//                 onChange={(e) => handleChange("primary_contact_phone", e.target.value)}
//                 required
//               />
//             </div>
//             <Separator />
//             <div className="space-y-2">
//               <Label htmlFor="admin_contact_first_name">Admin Contact First Name *</Label>
//               <Input
//                 id="admin_contact_first_name"
//                 value={formData.admin_contact_first_name}
//                 onChange={(e) => handleChange("admin_contact_first_name", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="admin_contact_last_name">Admin Contact Last Name *</Label>
//               <Input
//                 id="admin_contact_last_name"
//                 value={formData.admin_contact_last_name}
//                 onChange={(e) => handleChange("admin_contact_last_name", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="admin_contact_title">Admin Contact Title *</Label>
//               <Input
//                 id="admin_contact_title"
//                 value={formData.admin_contact_title}
//                 onChange={(e) => handleChange("admin_contact_title", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="admin_contact_email">Admin Contact Email *</Label>
//               <Input
//                 id="admin_contact_email"
//                 value={formData.admin_contact_email}
//                 onChange={(e) => handleChange("admin_contact_email", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="admin_contact_phone">Admin Contact Phone *</Label>
//               <Input
//                 id="admin_contact_phone"
//                 value={formData.admin_contact_phone}
//                 onChange={(e) => handleChange("admin_contact_phone", e.target.value)}
//                 required
//               />
//             </div>
//             <Separator />
//             <div className="flex items-center space-x-2">
//   <input
//     type="checkbox"
//     id="same-as-primary"
//     onChange={(e) => {
//       if (e.target.checked) {
//         setFormData((prev) => ({
//           ...prev,
//           authorized_rep_first_name: prev.primary_contact_first_name,
//           authorized_rep_last_name: prev.primary_contact_last_name,
//           authorized_rep_email: prev.primary_contact_email,
//           authorized_rep_phone: prev.primary_contact_phone,
//           authorized_rep_credential: prev.primary_contact_title,
//         }))
//       }
//     }}
//   />
//   <label htmlFor="same-as-primary" className="text-sm font-medium">Same as Primary Contact</label>
// </div>

//             <div className="space-y-2">
//               <Label htmlFor="authorized_rep_first_name">Other First Name *</Label>
//               <Input
//                 id="authorized_rep_first_name"
//                 value={formData.authorized_rep_first_name}
//                 onChange={(e) => handleChange("authorized_rep_first_name", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="authorized_rep_last_name">Other Last Name *</Label>
//               <Input
//                 id="authorized_rep_last_name"
//                 value={formData.authorized_rep_last_name}
//                 onChange={(e) => handleChange("authorized_rep_last_name", e.target.value)}
//                 required
//               />
//             </div>

//             {/* <div className="space-y-2">
//               <Label htmlFor="authorized_rep_credential">Other Credential *</Label>
//               <Input
//                 id="authorized_rep_credential"
//                 value={formData.authorized_rep_credential}
//                 onChange={(e) => handleChange("authorized_rep_credential", e.target.value)}
//                 required
//               />
//             </div> */}

//             <div className="space-y-2">
//               <Label htmlFor="authorized_rep_title">Other Title *</Label>
//               <Input
//                 id="authorized_rep_title"
//                 value={formData.authorized_rep_title}
//                 onChange={(e) => handleChange("authorized_rep_title", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="authorized_rep_email">Other Email *</Label>
//               <Input
//                 id="authorized_rep_email"
//                 value={formData.authorized_rep_email}
//                 onChange={(e) => handleChange("authorized_rep_email", e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="authorized_rep_phone">Other Phone *</Label>
//               <Input
//                 id="authorized_rep_phone"
//                 value={formData.authorized_rep_phone}
//                 onChange={(e) => handleChange("authorized_rep_phone", e.target.value)}
//                 required
//               />
//             </div>

//             {/* <div className="space-y-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => handleChange("email", e.target.value)}
//                 required
//               />
//             </div> */}
//             </div>

//             {/* <div className="space-y-2">
//               <Label htmlFor="dba">DBA</Label>
//               <Input
//                 id="dba"
//                 value={formData.dba}
//                 onChange={(e) => handleChange("dba", e.target.value)}
//                 required
//               />
//             </div> */}

//             {/* <div className="space-y-2">
//   <Label htmlFor="category_id">Category</Label>
//   <Select
//     value={formData.category_id}
//     onValueChange={(value) => handleChange("category_id", value)}
//   >
//     <SelectTrigger id="category_id">
//       <SelectValue placeholder="Select category" />
//     </SelectTrigger>
//     <SelectContent>
//       <SelectItem value="1">INDEPENDENT PRACTICES: Direct House</SelectItem>
//       <SelectItem value="2">INDEPENDENT PRACTICES: Channel Partner</SelectItem>
//       <SelectItem value="3">CORPORATE PRACTICES: House Account</SelectItem>
//       <SelectItem value="4">CORPORATE ADVISORY</SelectItem>
//     </SelectContent>
//   </Select>
// </div> */}
        

//             <Separator />

//             {/* <div className="space-y-2">
//               <Label htmlFor="street">Street Address</Label>
//               <Input id="street" value={formData.street_address} onChange={(e) => handleChange("street_address", e.target.value)} />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="city">City</Label>
//                 <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
//               </div>
//               </div> */}

//               <div className="grid grid-cols-2 gap-4">
//               {/* <div className="space-y-2">
//                 <Label htmlFor="current_ehr">Current EHR</Label>
//                 <Input id="current_ehr" value={formData.current_ehr} onChange={(e) => handleChange("current_ehr", e.target.value)} />
//               </div> */}

//               {/* <div className="space-y-2">
//                 <Label htmlFor="state">State *</Label>
//                 <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
//                     <SelectTrigger id="state">
//                       <SelectValue placeholder="Select state" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {US_STATES.map((state) => (
//                         <SelectItem key={state} value={state}>
//                           {state}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//               </div> */}
//             </div>

//             {/* <div className="space-y-2">
//                 <Label htmlFor="state_of_formation">State of Formation *</Label>
//                 <Select value={formData.state_of_formation} onValueChange={(value) => handleChange("state_of_formation", value)}>
//                 <SelectTrigger id="state_of_formation">
//                   <SelectValue placeholder="Select state of formation" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {US_STATES.map((state) => (
//                     <SelectItem key={state} value={state}>
//                       {state}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               </div> */}
//               {/* <div className="space-y-2">
//               <Label htmlFor="zip">Zip Code</Label>
//               <Input id="zip" value={formData.zip} onChange={(e) => handleChange("zip", e.target.value)} />
//             </div> */}
//             <div className="space-y-2">
//                 <Label htmlFor="agreement_date">Agreement Date</Label>
//                 <Input
//                   id="agreement_date"
//                   type="date"
//                   value={formData.agreement_date}
//                   onChange={(e) => handleChange("agreement_date", e.target.value)}
//                 />
//             </div>
//             <div className="space-y-2">
//                 <Label htmlFor="commencement_date">Commencement Date</Label>
//                 <Input
//                   id="commencement_date"
//                   type="date"
//                   value={formData.commencement_date}
//                   onChange={(e) => handleChange("commencement_date", e.target.value)}
//                 />
//             </div>
//             <div className="space-y-2">
//   <Label htmlFor="term">Term</Label>
//   <Select value={formData.term} onValueChange={(value) => handleChange("term", value)}>
//     <SelectTrigger id="term">
//       <SelectValue placeholder="Select term" />
//     </SelectTrigger>
//     <SelectContent>
//       <SelectItem value="6 Month">6 Month</SelectItem>
//       <SelectItem value="1 Year">1 Year</SelectItem>
//       <SelectItem value="2 Years">2 Years</SelectItem>
//       <SelectItem value="3 Years">3 Years</SelectItem>
//       <SelectItem value="4 Years">4 Years</SelectItem>
//       <SelectItem value="5 Years">5 Years</SelectItem>
//     </SelectContent>
//   </Select>
// </div>

//             <div className="space-y-2">
//   <Label htmlFor="services">Services</Label>
//   <div className="border rounded-md p-2">
//     {services.map((service) => (
//       <div key={service.id} className="flex items-center space-x-2">
//         <input
//           type="checkbox"
//           id={`service-${service.id}`}
//           value={service.id}
//           checked={formData.service_ids.includes(service.id)}
//           onChange={(e) => {
//             const newIds = e.target.checked
//               ? [...formData.service_ids, service.id]
//               : formData.service_ids.filter((id) => id !== service.id);
//             handleChange("service_ids", newIds);
//           }}
//         />
//         <label htmlFor={`service-${service.id}`}>{service.service_name}</label>
//       </div>
//     ))}
//   </div>
// </div>
// <div className="space-y-2">
//               <Label htmlFor="code">Code</Label>
//               <Input id="code" value={formData.code} onChange={(e) => handleChange("code", e.target.value)} />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="client_status">Status</Label>
//               <Select value={formData.client_status} onValueChange={(value) => handleChange("client_status", value)}>
//                 <SelectTrigger id="client_status">
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//                         {/* <div className="space-y-2">
//               <Label htmlFor="auto_pay">Auto Pay</Label>
//               <Select value={formData.auto_pay} onValueChange={(value) => handleChange("auto_pay", value)}>
//                 <SelectTrigger id="auto_pay">
//                   <SelectValue placeholder="Select" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="yes">Yes</SelectItem>
//                   <SelectItem value="no">No</SelectItem>
//                   <SelectItem value="na">N/A</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="payment_type">Type</Label>
//               <Select value={formData.payment_type} onValueChange={(value) => handleChange("payment_type", value)}>
//                 <SelectTrigger id="payment_type">
//                   <SelectValue placeholder="Select Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="credit_card">Credit Card</SelectItem>
//                   <SelectItem value="ach">ACH</SelectItem>
//                   <SelectItem value="check">Check</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="debit_origination">Debit Origination</Label>
//               <Select value={formData.debit_origination} onValueChange={(value) => handleChange("debit_origination", value)}>
//                 <SelectTrigger id="debit_origination">
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="active">Yes</SelectItem>
//                   <SelectItem value="inactive">No</SelectItem>
//                   <SelectItem value="inactive">N/A</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div> */}

//             {/* <div className="space-y-2">
//               <Label htmlFor="sla_number">SLA Number</Label>
//               <Input id="sla_number" value={formData.sla_number} onChange={(e) => handleChange("sla_number", e.target.value)} />
//             </div> */}

//             {/* <div className="space-y-2">
//               <Label htmlFor="type_of_entity">Type of Entity</Label>
//               <Select
//                 value={formData.type_of_entity}
//                 onValueChange={(value) => handleChange("type_of_entity", value)}
//               >
//                 <SelectTrigger id="type_of_entity">
//                   <SelectValue placeholder="Select type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="C-Corp">C-Corp</SelectItem>
//                   <SelectItem value="S-Corp">S-Corp</SelectItem>
//                   <SelectItem value="LLC">LLC</SelectItem>
//                   <SelectItem value="PLLC">PLLC</SelectItem>
//                   <SelectItem value="PA">PA</SelectItem>
//                   <SelectItem value="PC">PC</SelectItem>
//                   <SelectItem value="Other (Specify)">Other (Specify)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div> */}
//             {/* <div className="space-y-2">
//               <Label htmlFor="owner_code">Owner Code</Label>
//               <Select
//                 value={formData.owner_code}
//                 onValueChange={(value) => handleChange("owner_code", value)}
//               >
//                 <SelectTrigger id="owner_code">
//                   <SelectValue placeholder="Select owner code" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="M">M — Multi-location & Single-owner</SelectItem>
//                   <SelectItem value="F">F — Multi-location (franchise incl.) & Multi-owners</SelectItem>
//                   <SelectItem value="S">S — Single-location & Individual-owner</SelectItem>
//                   <SelectItem value="C">C — Corporate & EHR/EMR/SaaS Client</SelectItem>
//                   <SelectItem value="X">X — Unique-case & Other-category</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div> */}


//             {/* <div className="space-y-2">
//               <Label htmlFor="website">Website</Label>
//               <Input id="website" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
//             </div> */}

//             <div className="space-y-2">
//               <Label>Upload Documents</Label>
//               <Input type="file" multiple onChange={handleDocumentUpload} />
//             </div>
//             </div>

            
            
//           </div>

//             <Separator />

//         <DialogFooter>
//           <Button variant="outline" onClick={() => setOpen(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} disabled={saving}>
//             {saving ? "Creating..." : "Create Client"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
