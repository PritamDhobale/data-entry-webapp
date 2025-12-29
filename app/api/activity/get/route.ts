// app/api/activity/get/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!
);

export async function GET() {
  try {
    // -------------------------------
    // 1️⃣ Fetch all Supabase users
    // -------------------------------
    const { data: users, error: userErr } =
      await supabase.auth.admin.listUsers();
    if (userErr) throw userErr;

    // -------------------------------
    // 2️⃣ Fetch all company entries
    // -------------------------------
    const { data: companies, error: compErr } = await supabase
      .from("company_data")
      .select("id, account_name, created_at, created_by")
      .order("created_at", { ascending: false });

    if (compErr) throw compErr;

    // -------------------------------
    // 3️⃣ Prepare date boundaries
    // -------------------------------
    const now = new Date();

    // Today start
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Week start (Monday)
    const weekStart = new Date(todayStart);
    const day = weekStart.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diffToMonday);

    // Month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // -------------------------------
    // 4️⃣ Map user_id ➝ email
    // -------------------------------
    const userMap: Record<string, { email: string }> = {};
    users?.users?.forEach((u: any) => {
      userMap[u.id] = { email: u.email };
    });

    // -------------------------------
    // 5️⃣ Build activity analytics
    // -------------------------------
    const stats: Record<string, any> = {};

    companies.forEach((c: any) => {
      const uid = c.created_by;
      if (!uid) return;

      if (!stats[uid]) {
        stats[uid] = {
          email: userMap[uid]?.email || "Unknown",
          total: 0,
          today: 0,
          week: 0,
          month: 0,
          entries: [],
        };
      }

      const createdDate = new Date(c.created_at);

      stats[uid].total++;
      stats[uid].entries.push(c);

      // Today
      if (createdDate >= todayStart) {
        stats[uid].today++;
      }

      // This Week (Monday-based)
      if (createdDate >= weekStart) {
        stats[uid].week++;
      }

      // This Month
      if (createdDate >= monthStart) {
        stats[uid].month++;
      }
    });

    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    console.error("❌ Activity API error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}




// // app/api/activity/get/route.ts
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// // ✅ Use SERVICE ROLE key for admin operations (secure on server)
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!  // 🔥 FIXED HERE
// );

// export async function GET() {
//   try {
//     // -------------------------------
//     // 1️⃣ Fetch all Supabase users
//     // -------------------------------
//     const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
//     if (userErr) throw userErr;

//     // -------------------------------
//     // 2️⃣ Fetch all company entries
//     // -------------------------------
//     const { data: companies, error: compErr } = await supabase
//       .from("company_data")
//       .select("id, account_name, created_at, created_by")
//       .order("created_at", { ascending: false });

//     if (compErr) throw compErr;

//     // Map user_id ➝ email
//     const userMap: Record<string, { email: string }> = {};
//     users?.users?.forEach((u: any) => {
//       userMap[u.id] = { email: u.email };
//     });

//     // -------------------------------
//     // 3️⃣ Build activity analytics
//     // -------------------------------
//     const stats: Record<string, any> = {};

//     companies.forEach((c: any) => {
//       const uid = c.created_by;
//       if (!uid) return;

//       if (!stats[uid]) {
//         stats[uid] = {
//           email: userMap[uid]?.email || "Unknown",
//           total: 0,
//           today: 0,
//           week: 0,
//           month: 0,
//           entries: [],
//         };
//       }

//       const createdDate = new Date(c.created_at);
//       const now = new Date();

//       stats[uid].total++;
//       stats[uid].entries.push(c);

//       // Today
//       if (createdDate.toDateString() === now.toDateString()) {
//         stats[uid].today++;
//       }

//       // This week
//       const diff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
//       if (diff <= 7) stats[uid].week++;

//       // This month
//       if (
//         createdDate.getMonth() === now.getMonth() &&
//         createdDate.getFullYear() === now.getFullYear()
//       ) {
//         stats[uid].month++;
//       }
//     });

//     return NextResponse.json({ success: true, stats });
//   } catch (err: any) {
//     console.error("❌ Activity API error:", err);
//     return NextResponse.json(
//       { success: false, error: err.message },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export async function GET(req: Request) {
//   try {
//     // 1️⃣ Fetch all users
//     const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
//     if (userErr) throw userErr;

//     // 2️⃣ Fetch all company entries with created_by + created_at
//     const { data: companies, error: compErr } = await supabase
//       .from("company_data")
//       .select("id, account_name, created_at, created_by")
//       .order("created_at", { ascending: false });

//     if (compErr) throw compErr;

//     // Build map for user_id → full_name/email
//     const userMap: Record<string, { email: string }> = {};
//     users?.users?.forEach((u: any) => {
//       userMap[u.id] = { email: u.email };
//     });

//     // Build analytics
//     const stats: Record<string, any> = {};

//     companies.forEach((c: any) => {
//       const uid = c.created_by;
//       if (!uid) return;

//       if (!stats[uid]) {
//         stats[uid] = {
//           email: userMap[uid]?.email || "Unknown",
//           total: 0,
//           today: 0,
//           week: 0,
//           month: 0,
//           entries: [],
//         };
//       }

//       const createdDate = new Date(c.created_at);
//       const now = new Date();
//       stats[uid].total++;
//       stats[uid].entries.push(c);

//       // Today
//       if (
//         createdDate.toDateString() === now.toDateString()
//       ) {
//         stats[uid].today++;
//       }

//       // This week
//       const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
//       if (diffDays <= 7) stats[uid].week++;

//       // This month
//       if (
//         createdDate.getMonth() === now.getMonth() &&
//         createdDate.getFullYear() === now.getFullYear()
//       ) {
//         stats[uid].month++;
//       }
//     });

//     return NextResponse.json({ success: true, stats });
//   } catch (err: any) {
//     console.error("❌ Activity API error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }
