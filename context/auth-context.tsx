"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthState, User } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = (user: User) => {
    localStorage.setItem("auth_user", JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}



// "use client"

// import type React from "react"
// import { createContext, useContext, useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { supabase } from "@/lib/supabaseClient" // Import Supabase client
// import type { AuthState, User } from "@/types/auth" // Import types

// interface AuthContextType extends AuthState {
//   login: (user: User) => void
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [state, setState] = useState<AuthState>({
//     user: null,
//     isAuthenticated: false,
//     isLoading: true,
//   })

//   const router = useRouter()

//   useEffect(() => {
//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         if (session?.user) {
//           const user: User = {
//             id: session.user.id,
//             username: session.user.email || "",
//             name: session.user.user_metadata?.full_name || "Unknown",
//             role: "user",
//             email: session.user.email || "",
//           }
//           setState({
//             user,
//             isAuthenticated: true,
//             isLoading: false,
//           })
//         } else {
//           setState({
//             user: null,
//             isAuthenticated: false,
//             isLoading: false,
//           })
//         }
//       }
//     )
  
//     // Initial session fetch
//     supabase.auth.getSession().then(({ data }) => {
//       if (data?.session?.user) {
//         const user: User = {
//           id: data.session.user.id,
//           username: data.session.user.email || "",
//           name: data.session.user.user_metadata?.full_name || "Unknown",
//           role: "user",
//           email: data.session.user.email || "",
//         }
//         setState({
//           user,
//           isAuthenticated: true,
//           isLoading: false,
//         })
//       } else {
//         setState({
//           user: null,
//           isAuthenticated: false,
//           isLoading: false,
//         })
//       }
//     })
  
//     return () => {
//       authListener.subscription.unsubscribe()
//     }
//   }, [])
  

//   const login = (user: User) => {
//     setState({
//       user,
//       isAuthenticated: true,
//       isLoading: false,
//     })
//     localStorage.setItem("auth_user", JSON.stringify(user)) // Persist user in localStorage
//   }

//   const logout = async () => {
//     await supabase.auth.signOut() // Supabase logout
//     setState({
//       user: null,
//       isAuthenticated: false,
//       isLoading: false,
//     })
//     localStorage.removeItem("auth_user") // Clear localStorage
//     router.push("/login") // Redirect to login page after logging out
//   }

//   return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }
