import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 1️⃣ Get total companies
    const { count: totalCompanies, error: totalErr } = await supabase
      .from("company_data")
      .select("id", { count: "exact", head: true });
    if (totalErr) throw totalErr;

    // 2️⃣ Fetch relevant fields for derived metrics
    const { data: rows, error: fetchErr } = await supabase
      .from("company_data")
      .select("google_rating, bbb_accredited, linkedin_employee_estimate, linkedin_industry");
    if (fetchErr) throw fetchErr;

    // Defensive handling if no rows
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: true,
        totalCompanies: 0,
        averageGoogleRating: 0,
        totalBBBAccredited: 0,
        averageEmployeeEstimate: 0,
        distinctIndustries: 0
      });
    }

    // 3️⃣ Derived metrics
    const validRatings = rows
      .map(r => parseFloat(r.google_rating))
      .filter(n => !isNaN(n));
    const averageGoogleRating =
      validRatings.length > 0
        ? parseFloat((validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(2))
        : 0;

    const totalBBBAccredited =
      rows.filter(r => String(r.bbb_accredited).toLowerCase() === "true").length;

    const validEmployees = rows
      .map(r => {
        if (!r.linkedin_employee_estimate) return null;
        const num = String(r.linkedin_employee_estimate)
          .replace(/[^\d\-–]/g, "")
          .split(/[-–]/)
          .map(v => parseInt(v.trim(), 10));
        if (num.length === 2 && num.every(n => !isNaN(n))) {
          return (num[0] + num[1]) / 2;
        } else if (!isNaN(num[0])) {
          return num[0];
        }
        return null;
      })
      .filter((n): n is number => n !== null);

    const averageEmployeeEstimate =
      validEmployees.length > 0
        ? Math.round(validEmployees.reduce((a, b) => a + b, 0) / validEmployees.length)
        : 0;

    const distinctIndustries = new Set(
      rows
        .map(r => (r.linkedin_industry || "").trim().toLowerCase())
        .filter(v => v.length > 0)
    ).size;

    // ✅ Return clean summary
    return NextResponse.json(
      {
        success: true,
        totalCompanies: totalCompanies ?? 0,
        avgGoogleRating: averageGoogleRating,       // ⬅ changed
        bbbAccredited: totalBBBAccredited,          // ⬅ renamed
        avgEmployees: averageEmployeeEstimate,      // ⬅ changed
        totalIndustries: distinctIndustries,        // ⬅ changed
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("❌ Dashboard summary error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unexpected error occurred while loading dashboard summary."
      },
      { status: 500 }
    );
  }
}
