"use client";

import { useEffect, useState, useRef } from "react";
import { useRole } from "@/context/role-context";
import { permissions } from "@/context/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ActivityPage() {
  const role = useRole();

  if (!permissions[role].canViewUserActivity) {
    return (
      <div className="p-6 text-red-500">
        You do not have permission to view this page.
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Filters
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔹 Dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/activity/get");
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        setStats(json.stats);

        // Default: select all users
        const allUsers = Object.keys(json.stats);
        setSelectedUsers(allUsers);
      } catch (err: any) {
        setError(err.message || "Failed to load activity data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------------
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ---------------- DOWNLOAD ----------------
  async function handleDownload() {
    if (!startDate || !endDate) {
      alert("Please select start and end date");
      return;
    }

    if (selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    const params = new URLSearchParams({
      users: selectedUsers.join(","),
      start: startDate,
      end: endDate,
    });

    try {
      const response = await fetch(
        `/api/activity/export?${params.toString()}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_${startDate}_to_${endDate}.xlsx`;  // filename comes from API header
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download Excel file");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const userList = Object.entries(stats); // [uid, user]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reviewer Activity</h1>

      {/* ================= FILTERS ================= */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-6 pt-6">

          {/* USER DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-sm font-medium">Select Users</label>

            <button
              type="button"
              className="w-64 border rounded px-3 py-2 text-sm text-left bg-white"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              {selectedUsers.length === userList.length
                ? "All users selected"
                : `${selectedUsers.length} user(s) selected`}
            </button>

            {userDropdownOpen && (
              <div className="absolute z-20 mt-1 w-64 bg-white border rounded shadow max-h-64 overflow-y-auto">

                {/* Select All */}
                <label className="flex items-center px-3 py-2 text-sm border-b cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedUsers.length === userList.length}
                    onChange={(e) =>
                      setSelectedUsers(
                        e.target.checked
                          ? userList.map(([uid]) => uid)
                          : []
                      )
                    }
                  />
                  Select All
                </label>

                {/* Individual users */}
                {userList.map(([uid, user]: any) => (
                  <label
                    key={uid}
                    className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedUsers.includes(uid)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, uid]);
                        } else {
                          setSelectedUsers(
                            selectedUsers.filter((id) => id !== uid)
                          );
                        }
                      }}
                    />
                    {user.email}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* START DATE */}
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              className="block border rounded p-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              className="block border rounded p-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* DOWNLOAD */}
          <Button
            onClick={handleDownload}
            className="bg-[#112B74] hover:bg-[#0d225c] text-white"
          >
            Download Excel
          </Button>
        </CardContent>
      </Card>

      {/* ================= SUMMARY ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Today</th>
                <th className="p-2 border">This Week</th>
                <th className="p-2 border">This Month</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(([uid, user]: any) => (
                <tr key={uid}>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border text-center">{user.today}</td>
                  <td className="p-2 border text-center">{user.week}</td>
                  <td className="p-2 border text-center">{user.month}</td>
                  <td className="p-2 border text-center">{user.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ================= DETAILS ================= */}
      {userList.map(([uid, user]: any) => (
        <Card key={uid}>
          <CardHeader>
            <CardTitle>{user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {user.entries.map((entry: any) => (
                  <tr key={entry.id}>
                    <td className="p-2 border">{entry.account_name}</td>
                    <td className="p-2 border">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}





// "use client";

// import { useEffect, useState } from "react";
// import { useRole } from "@/context/role-context";
// import { permissions } from "@/context/permissions";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export default function ActivityPage() {
//   const role = useRole();

//   if (!permissions[role].canViewUserActivity) {
//     return (
//       <div className="p-6 text-red-500">
//         You do not have permission to view this page.
//       </div>
//     );
//   }

//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetch("/api/activity/get");
//         const json = await res.json();
//         if (!json.success) throw new Error(json.error);

//         setStats(json.stats);
//       } catch (err: any) {
//         setError(err.message || "Failed to load activity data");
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   if (loading) return <div className="p-6">Loading...</div>;
//   if (error)
//     return <div className="p-6 text-red-500">Error: {error}</div>;

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold">Reviewer Activity</h1>

//       {/* Summary Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Summary Overview</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <table className="w-full border text-sm">
//             <thead>
//               <tr className="bg-gray-100 text-left">
//                 <th className="p-2 border">User</th>
//                 <th className="p-2 border">Today</th>
//                 <th className="p-2 border">This Week</th>
//                 <th className="p-2 border">This Month</th>
//                 <th className="p-2 border">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.values(stats).map((user: any, idx: number) => (
//                 <tr key={idx}>
//                   <td className="p-2 border">{user.email}</td>
//                   <td className="p-2 border text-center">{user.today}</td>
//                   <td className="p-2 border text-center">{user.week}</td>
//                   <td className="p-2 border text-center">{user.month}</td>
//                   <td className="p-2 border text-center">{user.total}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </CardContent>
//       </Card>

//       {/* Detailed Breakdown per User */}
//       {Object.values(stats).map((user: any, idx: number) => (
//         <Card key={idx}>
//           <CardHeader>
//             <CardTitle>{user.email}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <table className="w-full border text-sm">
//               <thead>
//                 <tr className="bg-gray-100 text-left">
//                   <th className="p-2 border">Company</th>
//                   <th className="p-2 border">Created At</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {user.entries.map((entry: any) => (
//                   <tr key={entry.id}>
//                     <td className="p-2 border">{entry.account_name}</td>
//                     <td className="p-2 border">
//                       {new Date(entry.created_at).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }
