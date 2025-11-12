import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CsvRecord = Record<string, string | number | boolean | null>;

/**
 * Bulk upload multiple company_data rows from CSV
 * Includes strong type inference, validation, and conversion
 * for text, boolean, numeric, and date fields.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No CSV file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();

    // ✅ Parse CSV safely
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CsvRecord[];

    if (!records?.length) {
      return NextResponse.json(
        { success: false, error: "Empty CSV or no data found" },
        { status: 400 }
      );
    }

    let insertedCount = 0;
    const failedRows: { row: number; error: string }[] = [];

    // 🎯 Known field patterns (based on Supabase schema)
    const booleanFields = [
      "website_could_not_access",
      "linkedin_unclaimed_page",
      "linkedin_could_not_access",
      "bbb_accredited",
      "bbb_could_not_access",
      "google_could_not_access",
      "ppp_could_not_access",
      "sos_could_not_access",
    ];

    const numericFields = [
      "website_locations",
      "website_year_founded",
      "website_employees",
      "linkedin_followers",
      "linkedin_members",
      "ppp_jobs_retained",
      "ppp_total_loan_size",
      "ppp_loan_size_1",
      "ppp_loan_payroll_amount_1",
      "ppp_loan_size_2",
      "ppp_loan_payroll_amount_2",
      "google_reviews",
      "google_rating",
      "sos_year_founded",
    ];

    const dateFields = ["bbb_business_started", "created_at"];

    // ✅ Loop through all records
    for (let i = 0; i < records.length; i++) {
      const record = records[i] || {};

      const payload: CsvRecord = {
        ...(record as Record<string, string>),
        created_at: new Date().toISOString(),
      };

      Object.keys(payload).forEach((key) => {
        let value = payload[key];

        if (typeof value === "string") {
          const trimmed = value.trim();

          // 🟤 Convert placeholders → null
          if (
            trimmed === "" ||
            trimmed.toLowerCase() === "n/a" ||
            trimmed.toLowerCase() === "na" ||
            trimmed === "-"
          ) {
            payload[key] = null;
            return;
          }

          // 🟢 Convert booleans
          if (booleanFields.includes(key)) {
            const boolVal = trimmed.toLowerCase();
            payload[key] = ["true", "yes", "1"].includes(boolVal)
              ? true
              : ["false", "no", "0"].includes(boolVal)
              ? false
              : null;
            return;
          }

          // 🔵 Convert numbers
          if (numericFields.includes(key)) {
            const num = parseFloat(trimmed.replace(/,/g, ""));
            payload[key] = isNaN(num) ? null : num;
            return;
          }

          // 🟣 Convert dates
          if (dateFields.includes(key)) {
            const dateVal = new Date(trimmed);
            payload[key] = !isNaN(dateVal.getTime())
              ? dateVal.toISOString()
              : null;
            return;
          }

          // ⚪ Default: text value
          payload[key] = trimmed;
        }
      });

      // ✅ Insert into Supabase
      const { error } = await supabase.from("company_data").insert(payload);

      if (error) {
        console.error(`❌ Row ${i + 1} failed:`, error.message);
        failedRows.push({ row: i + 1, error: error.message });
      } else {
        insertedCount++;
      }
    }

    // 🧾 Optional: generate CSV for failed rows
    let failedCsvLink = null;
    if (failedRows.length) {
      const failedCsv = [
        "Row,Error",
        ...failedRows.map((r) => `${r.row},"${r.error.replace(/"/g, "'")}"`),
      ].join("\n");

      const blob = new Blob([failedCsv], { type: "text/csv" });
      failedCsvLink = URL.createObjectURL(blob);
    }

    return NextResponse.json(
      {
        success: true,
        inserted: insertedCount,
        failed: failedRows.length,
        message: `✅ Inserted ${insertedCount} companies. ❌ Failed ${failedRows.length}.`,
        failedRows,
        failedCsvLink,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Bulk upload failed:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Unexpected bulk upload error" },
      { status: 500 }
    );
  }
}
