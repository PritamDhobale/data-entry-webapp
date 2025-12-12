import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const pageSize = 1000;
    let from = 0;
    let allData: any[] = [];

    while (true) {
      const { data, error } = await supabase
        .from("company_data")
        .select("*")
        .order("id", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Error fetching company data:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      if (!data || data.length === 0) break;

      allData.push(...data);
      from += pageSize;
    }

    return new Response(JSON.stringify({ clients: allData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error occurred" }), {
      status: 500,
    });
  }
}


// import { supabase } from "@/lib/supabase";

// export async function GET() {
//   const { data, error } = await supabase
//     .from("company_data")
//     .select("*")
//     .order("id", { ascending: false });

//   if (error) {
//     console.error("Error fetching company data:", error);
//     return new Response(JSON.stringify({ error: error.message }), { status: 500 });
//   }

//   // ✅ Return the proper structure expected by frontend
//   return new Response(JSON.stringify({ clients: data }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }
