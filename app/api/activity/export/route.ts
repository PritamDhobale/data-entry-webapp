// app/api/activity/export/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const usersParam = searchParams.get("users");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!usersParam || !start || !end) {
      return NextResponse.json(
        { success: false, error: "users, start, end are required" },
        { status: 400 }
      );
    }

    const userIds = usersParam.split(",");

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // -------------------------------
    // Fetch users
    // -------------------------------
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userMap: Record<string, string> = {};
    authUsers?.users?.forEach((u: any) => {
      userMap[u.id] = u.email;
    });

    // -------------------------------
    // Fetch company data
    // -------------------------------
    const { data: companies, error } = await supabase
      .from("company_data")
      .select("account_name, created_at, created_by")
      .in("created_by", userIds)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    // -------------------------------
    // Workbook
    // -------------------------------
    const workbook = new ExcelJS.Workbook();

    /* =====================================================
       SHEET 1 — RAW RECORDS
    ===================================================== */
    const rawSheet = workbook.addWorksheet("Raw Records");

    rawSheet.columns = [
      { header: "User Email", key: "user", width: 30 },
      { header: "Company Name", key: "company", width: 30 },
      { header: "Created At", key: "createdAt", width: 25 },
      { header: "Date", key: "date", width: 15 },
    ];

    companies.forEach((c: any) => {
      rawSheet.addRow({
        user: userMap[c.created_by] || "Unknown",
        company: c.account_name,
        createdAt: new Date(c.created_at).toLocaleString(),
        date: c.created_at.split("T")[0],
      });
    });

    rawSheet.getRow(1).font = { bold: true };

    /* =====================================================
       SHEET 2 — DAILY COUNTS SUMMARY
    ===================================================== */
    const summarySheet = workbook.addWorksheet("Daily Counts");

    // Build date → user → count map
    const dateUserCount: Record<string, Record<string, number>> = {};
    const userEmails = Array.from(
      new Set(userIds.map((id) => userMap[id]).filter(Boolean))
    );

    companies.forEach((c: any) => {
      const date = c.created_at.split("T")[0];
      const email = userMap[c.created_by];

      if (!email) return;

      if (!dateUserCount[date]) {
        dateUserCount[date] = {};
      }

      dateUserCount[date][email] =
        (dateUserCount[date][email] || 0) + 1;
    });

    // Columns
    summarySheet.columns = [
      { header: "Date", key: "date", width: 15 },
      ...userEmails.map((email) => ({
        header: email,
        key: email,
        width: 20,
      })),
      { header: "Total", key: "total", width: 12 },
    ];

    // Rows
    Object.entries(dateUserCount).forEach(([date, counts]) => {
      let total = 0;
      const row: any = { date };

      userEmails.forEach((email) => {
        const val = counts[email] || 0;
        row[email] = val;
        total += val;
      });

      row.total = total;
      summarySheet.addRow(row);
    });

    summarySheet.getRow(1).font = { bold: true };

    // -------------------------------
    // Return Excel
    // -------------------------------
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="activity_${start}_to_${end}.xlsx"`,
      },
    });
  } catch (err: any) {
    console.error("❌ Activity Export API error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
