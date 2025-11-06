import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = { ...body };

    const { data, error } = await supabase
      .from("company_data")
      .insert([payload])
      .select("id");

    if (error) throw error;

    return NextResponse.json({ success: true, client_id: data?.[0]?.id || null });
  } catch (error: any) {
    console.error("❌ Add client error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
