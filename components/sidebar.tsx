"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/clients", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <>
      {/* 📱 Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 bottom-4 right-4 bg-[#112B74] text-white p-3 rounded-full shadow-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🧭 Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-[#E6EBF7] w-44 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "fixed inset-y-0 left-0 z-40" : "hidden md:flex"
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-[#E6EBF7]">
          <div className="flex items-center justify-center">
            <Image
              src="/images/diff.png"
              alt="AccountHub Logo"
              width={119}
              height={50}
              className="object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 pb-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-[#4B5563] hover:bg-[#E6EBF7] hover:text-[#112B74] rounded-md mx-2 transition-colors",
                    pathname === item.href &&
                      "bg-[#E6EBF7] text-[#112B74] font-semibold border-l-4 border-[#112B74]"
                  )}
                >
                  <item.icon className="h-5 w-5 min-w-[20px] shrink-0 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#E6EBF7]">
          <button
            onClick={handleLogout}
            className="flex items-center text-[#4B5563] hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}



// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   LayoutDashboard,
//   Users,
//   FileText,
//   Settings,
//   BarChart3,
//   LogOut,
//   Menu,
//   X,
// } from "lucide-react";
// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import { supabase } from "@/lib/supabase";

// const navItems = [
//   { name: "Dashboard", href: "/", icon: LayoutDashboard },
//   { name: "Clients", href: "/clients", icon: Users },
//   // { name: "Agreements", href: "/agreements", icon: FileText },
//   // { name: "Services", href: "/services", icon: Settings },
//   { name: "Reports", href: "/reports", icon: BarChart3 },
// ];

// export default function Sidebar() {
//   const pathname = usePathname() ?? "";
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);

//   // ✅ Supabase logout
//   const handleLogout = async () => {
//     try {
//       await supabase.auth.signOut();
//       router.push("/login");
//     } catch (error) {
//       console.error("Logout failed:", error);
//       alert("Failed to logout. Please try again.");
//     }
//   };

//   return (
//     <>
//       {/* 📱 Mobile Menu Toggle */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="fixed z-50 bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg md:hidden"
//       >
//         {isOpen ? <X size={24} /> : <Menu size={24} />}
//       </button>

//       {/* 🧭 Sidebar */}
//       <aside
//         className={cn(
//           "bg-white border-r border-gray-200 w-40 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out",
//           isOpen ? "fixed inset-y-0 left-0 z-40" : "hidden md:flex"
//         )}
//       >
//         {/* Logo Section */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-center">
//             <Image
//               src="/images/accounthub.png"
//               alt="AccountHub Logo"
//               width={160}
//               height={80}
//               className="object-contain"
//             />
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 pt-4 pb-4">
//           <ul className="space-y-1">
//             {navItems.map((item) => (
//               <li key={item.name}>
//                 <Link
//                   href={item.href}
//                   className={cn(
//                     "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md mx-2 transition-colors",
//                     pathname === item.href &&
//                       "bg-primary/10 text-primary font-medium"
//                   )}
//                 >
//                   <item.icon className="h-5 w-5 min-w-[20px] shrink-0 mr-3" />
//                   {item.name}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* Logout */}
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="flex items-center text-gray-700 hover:text-red-600 w-full transition-colors"
//           >
//             <LogOut className="h-5 w-5 mr-3" />
//             Logout
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }
