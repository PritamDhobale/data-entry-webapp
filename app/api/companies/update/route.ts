import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...payload } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing ID" },
        { status: 400 }
      );
    }

    // ✅ Convert frontend labels (like "Account Name") → DB-safe column names (account_name)
    const toDbKey = (key: string) =>
      key
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_") // replace spaces/symbols with underscores
        .replace(/^_|_$/g, ""); // trim underscores

    // ✅ Sanitize & map keys
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload)
        // ✅ Exclude the id column entirely from update
        .filter(([key]) => key.toLowerCase() !== "id")
        .map(([key, value]) => [
          toDbKey(key),
          value === "" ? null : value,
        ])
    );

    // ✅ Update record in Supabase
    const { error } = await supabase
      .from("company_data")
      .update(sanitizedPayload)
      .eq("id", Number(id));

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: "Company updated successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error updating company:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
