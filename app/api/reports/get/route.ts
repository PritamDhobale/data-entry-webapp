import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

      if (error) throw error;

      if (!data || data.length === 0) break;

      allData.push(...data);
      from += pageSize;
    }

    return NextResponse.json({ clients: allData });
  } catch (err: any) {
    console.error("❌ Error fetching company data:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export async function GET() {
//   try {
//     const { data, error } = await supabase
//       .from("company_data")
//       .select("*")
//       .order("id", { ascending: false });

//     if (error) throw error;

//     // ✅ Return consistent structure
//     return NextResponse.json({ clients: data });
//   } catch (err: any) {
//     console.error("❌ Error fetching company data:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
