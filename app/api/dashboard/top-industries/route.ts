import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("company_data")
      .select("linkedin_industry")
      .not("linkedin_industry", "is", null);

    if (error) throw error;

    const industryCount: Record<string, number> = {};
    data.forEach((row) => {
      const industry = (row.linkedin_industry || "Unknown").trim();
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });

    const result = Object.entries(industryCount)
      .map(([industry, count]) => ({ name: industry, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Top industries fetch failed:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
