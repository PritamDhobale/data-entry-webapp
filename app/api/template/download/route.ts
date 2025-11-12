import { NextResponse } from "next/server";

/**
 * API endpoint to generate downloadable CSV template
 * containing all valid company fields (excludes deprecated ones),
 * and a second row with data type hints for user guidance.
 */
export async function GET() {
  try {
    const headers = [
      // ---------------- DETAILS ----------------
      "account_name",
      "website",
      "annual_revenue",
      "email",
      "contact_on_website",
      "title",
      "website_company_name",
      "website_company_name_abbreviated",
      "website_company_abbreviated",
      "website_address",
      "website_street",
      "website_city",
      "website_state",
      "website_zip_code",
      "website_country",
      "website_full_company_msa",
      "website_company_msa",
      "website_region",
      "website_office_phone",
      "website_contacts",
      "website_locations",
      "website_year_founded",
      "website_employees",
      "website_designations",
      "website_could_not_access",
      "website_notes",

      // ---------------- LINKEDIN ----------------
      "linkedin_possible_1",
      "linkedin_possible_2",
      "linkedin_url",
      "linkedin_company_name",
      "linkedin_overview",
      "linkedin_followers",
      "linkedin_phone",
      "linkedin_industry",
      "linkedin_employee_estimate",
      "linkedin_members",
      "linkedin_headquarters",
      "linkedin_founded_year",
      "linkedin_specialties",
      "linkedin_contacts",
      "linkedin_locations",
      "linkedin_primary_location",
      "linkedin_street",
      "linkedin_city",
      "linkedin_state",
      "linkedin_zip_code",
      "linkedin_country",
      "linkedin_full_company_msa",
      "linkedin_company_msa",
      "linkedin_region",
      "linkedin_notes",
      "linkedin_unclaimed_page",
      "linkedin_could_not_access",

      // ---------------- BBB ----------------
      "bbb_link_url",
      "bbb_url",
      "bbb_company_name",
      "bbb_business_started",
      "bbb_type_of_entity",
      "bbb_alternate_names",
      "bbb_address",
      "bbb_street",
      "bbb_city",
      "bbb_state",
      "bbb_zip_code",
      "bbb_country",
      "bbb_full_company_msa",
      "bbb_company_msa",
      "bbb_region",
      "bbb_customer_contacts",
      "bbb_notes",
      "bbb_accredited",
      "bbb_could_not_access",

      // ---------------- GOOGLE BUSINESS ----------------
      "google_business_page_url",
      "google_company_name",
      "google_reviews",
      "google_rating",
      "google_address",
      "google_business_street",
      "google_business_city",
      "google_business_state",
      "google_business_zip_code",
      "google_business_country",
      "google_business_full_company_msa",
      "google_business_company_msa",
      "google_business_region",
      "google_phone",
      "google_business_notes",
      "google_could_not_access",

      // ---------------- PPP ----------------
      "federalpay_ppp_link",
      "federalpay_ppp_url",
      "ppp_company_name",
      "ppp_jobs_retained",
      "ppp_total_loan_size",
      "ppp_loan_size_1",
      "ppp_loan_payroll_amount_1",
      "ppp_loan_size_2",
      "ppp_loan_payroll_amount_2",
      "ppp_address",
      "ppp_street",
      "ppp_city",
      "ppp_state",
      "ppp_zip_code",
      "ppp_country",
      "ppp_full_company_msa",
      "ppp_company_msa",
      "ppp_region",
      "ppp_business_demographics",
      "ppp_naics_code",
      "ppp_business_owner_demographics",
      "ppp_notes",
      "ppp_could_not_access",

      // ---------------- SOS ----------------
      "sos_company_name",
      "sos_fictitious_names",
      "sos_filing_type",
      "sos_agent_address",
      "sos_agent_street",
      "sos_agent_city",
      "sos_agent_state",
      "sos_agent_zip_code",
      "sos_agent_country",
      "sos_agent_full_company_msa",
      "sos_agent_company_msa",
      "sos_agent_region",
      "sos_principal_address",
      "sos_principal_street",
      "sos_principal_city",
      "sos_principal_state",
      "sos_principal_zip_code",
      "sos_principal_country",
      "sos_principal_full_company_msa",
      "sos_principal_company_msa",
      "sos_principal_region",
      "sos_registered_agent",
      "sos_officers",
      "sos_year_founded",
      "sos_notes",
      "sos_could_not_access",

      // ---------------- SOURCE INFO ----------------
      "location_primary",
      "source_primary",
      "location_secondary",
      "source_secondary",
      "location_tertiary",
      "source_tertiary",
      "location_fourth",
      "source_fourth",

      // ---------------- METADATA ----------------
      "created_at",
    ];

    // 🧩 Type-hint row aligned with DB data types
    const typeHints = headers.map((h) => {
      // --- Boolean ---
      if (h.match(/could_not_access|accredited|unclaimed_page/i))
        return "Boolean (TRUE/FALSE)";

      // --- Numeric / Integer ---
      if (
        h.match(
          /(_size|_amount|_loan|_retained|_employees|_members|_followers|_reviews|_rating|_locations|_year_founded|_zip_code|_phone)$/i
        )
      )
        return "Number (e.g. 50000)";

      // --- Date fields ---
      if (h.match(/_started$/i))
        return "Date (YYYY-MM-DD)";

      // --- URL / Link ---
      if (h.match(/url|link$/i))
        return "URL (https://example.com)";

      // --- Year only fields ---
      if (h.match(/_year$/i))
        return "Year (YYYY)";

      // --- Default ---
      return "Text (enter value)";
    });

    const csvContent = [headers.join(","), typeHints.join(",")].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="bulk_company_template.csv"',
      },
    });
  } catch (error) {
    console.error("Template download failed:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
