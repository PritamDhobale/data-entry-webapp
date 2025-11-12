import { Role } from "./role-context";

type PermissionMap = {
  [key in Role]: {
    canViewDashboard: boolean;
    canViewCompanies: boolean;
    canViewReports: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAdd: boolean;
    hiddenFields: string[]; // 🆕 Add this
  };
};

export const permissions: PermissionMap = {
  Admin: {
    canViewDashboard: true,
    canViewCompanies: true,
    canViewReports: true,
    canEdit: true,
    canDelete: true,
    canAdd: true,
    hiddenFields: [
      "Website Designations",
      "PPP Business Demographics",
      "PPP NAICS Code",
      "PPP Business Owner Demographics",
      "LinkedIn Overview",
      "LinkedIn Followers",
      "BBB Type of Entity",
      "SoS Filing Type",
    ],
  },
  Reviewer: {
    canViewDashboard: true,
    canViewCompanies: true,
    canViewReports: true,
    canEdit: true,
    canDelete: false,
    canAdd: true,
    hiddenFields: [
      "Website Designations",
      "PPP Business Demographics",
      "PPP NAICS Code",
      "PPP Business Owner Demographics",
      "LinkedIn Overview",
      "LinkedIn Followers",
      "BBB Type of Entity",
      "SoS Filing Type",
    ],
  },
  DataEntry: {
    canViewDashboard: true,
    canViewCompanies: true,
    canViewReports: false,
    canEdit: true,
    canDelete: false,
    canAdd: true,
    hiddenFields: [
      // PPP restricted
      "FederalPay PPP Link (Url)",
      "PPP Company Name",
      "PPP Jobs Retained",
      "PPP Total Loan Size",
      "PPP Loan Size(#1)",
      "PPP Loan Payroll Amount (#1)",
      "PPP Loan Size (#2)",
      "PPP Loan Payroll Amount (#2)",
      "PPP Address",
      "PPP: Full Company MSA",
      "PPP: Region",
      "PPP Business Demographics",
      "PPP NAICS Code",
      "PPP Business Owner Demographics",
      "PPP: Notes",
      // SoS restricted
      "SoS Company Name",
      "SoS Fictitious Names",
      "SoS Filing Type",
      "SoS Agent Address",
      "SoS Agent Street",
      "SoS Agent City",
      "SoS Agent State",
      "SoS Agent Zip Code",
      "SoS Agent Country",
      "SoS Agent: Full Company MSA",
      "SoS Principal Address",
      "SoS Principal Street",
      "SoS Principal City",
      "SoS Principal State",
      "SoS Principal Zip Code",
      "SoS Principal Country",
      "SoS Principal: Full Company MSA",
      "SoS Principal: Company MSA",
      "SoS Principal: Region",
      "SoS Registered Agent",
      "SoS Officers",
      "SoS Year Founded",
      "SoS: Notes",
    ],
  },
};
