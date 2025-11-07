import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing ID" },
        { status: 400 }
      );
    }

    // ✅ Delete client record from company_data table
    const { error } = await supabase
      .from("company_data")
      .delete()
      .eq("id", Number(id));

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: "Client deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error deleting client:", err.message || err);
    return NextResponse.json(
      { success: false, error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
