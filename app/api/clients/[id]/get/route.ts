import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing ID" },
        { status: 400 }
      );
    }

    // ✅ Fetch the specific client record from company_data
    const { data, error } = await supabase
      .from("company_data")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // ✅ Clean null/undefined for frontend rendering
    const toTitleCaseKey = (key: string) =>
    key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const cleanedData = Object.fromEntries(
     Object.entries(data).map(([key, value]) => [
        toTitleCaseKey(key),
        value === null || value === undefined ? "" : value,
     ])
    );

    return NextResponse.json(
      { success: true, client: cleanedData },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error fetching client by ID:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
