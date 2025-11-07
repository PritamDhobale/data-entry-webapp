// app/api/zipcode/route.ts
import { NextResponse } from "next/server";

/**
 * Fetch ZIP info + MSA from ZipcodeAPI (proxy route to avoid CORS)
 * Example usage: GET /api/zipcode?zip=10001
 */
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

    const apiKey = process.env.NEXT_PUBLIC_ZIPCODE_API_KEY;
    const response = await fetch(
      `https://www.zipcodeapi.com/rest/${apiKey}/info.json/${zip}/degrees`
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch ZIP info" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error: any) {
    console.error("❌ ZIP Proxy Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: "Server error fetching ZIP info" },
      { status: 500 }
    );
  }
}
