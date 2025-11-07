// app/api/msa/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zip = searchParams.get("zip");

    if (!zip) {
      return NextResponse.json(
        { success: false, error: "Missing ZIP code" },
        { status: 400 }
      );
    }

    // ✅ Query the zip_lookup table in Supabase
    const { data, error } = await supabase
      .from("zip_lookup")
      .select("msa")
      .eq("zip_code", zip)
      .maybeSingle();

    if (error) throw error;

    if (!data || !data.msa) {
      return NextResponse.json(
        { success: false, msa: "" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, msa: data.msa },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ MSA lookup failed:", err.message || err);
    return NextResponse.json(
      { success: false, error: "Server error fetching MSA" },
      { status: 500 }
    );
  }
}
