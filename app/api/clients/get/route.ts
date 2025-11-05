import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("company_data")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching company data:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // ✅ Return the proper structure expected by frontend
  return new Response(JSON.stringify({ clients: data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
