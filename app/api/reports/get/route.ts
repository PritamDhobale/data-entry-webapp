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
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    // ✅ Return consistent structure
    return NextResponse.json({ clients: data });
  } catch (err: any) {
    console.error("❌ Error fetching company data:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
