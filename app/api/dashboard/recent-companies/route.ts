import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // ✅ Fetch the 10 most recent companies (based on created_at)
    const { data, error } = await supabase
      .from("company_data")
      .select("id, account_name, website_city, website_state, linkedin_industry, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    // ✅ Normalize and clean data
    const recentCompanies = (data || []).map((row) => ({
      id: row.id,
      name: row.account_name ?? "N/A",
      city: row.website_city ?? "N/A",
      state: row.website_state ?? "N/A",
      industry: row.linkedin_industry ?? "N/A",
      lastUpdated: row.created_at ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        count: recentCompanies.length,
        companies: recentCompanies,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Recent companies API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unexpected error occurred while retrieving recent companies.",
      },
      { status: 500 }
    );
  }
}
