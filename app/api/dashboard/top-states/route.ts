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
      .select("website_state")
      .not("website_state", "is", null);

    if (error) throw error;

    const stateCount: Record<string, number> = {};
    data.forEach((row) => {
      const state = (row.website_state || "Unknown").trim();
      stateCount[state] = (stateCount[state] || 0) + 1;
    });

    const result = Object.entries(stateCount)
      .map(([state, count]) => ({ name: state, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Top states fetch failed:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
