"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { Notifications } from "@/components/notifications"
import { useRole } from "@/context/role-context";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, logout } = useAuth()
  const role = useRole();
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formattedTime = currentTime.toLocaleTimeString()
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 h-20 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        <p className="font-medium">{formattedDate}</p>
        <p>{formattedTime}</p>
      </div>

      <div className="flex items-center space-x-4">
        <Notifications />

        {/* ✅ Role indicator */}
        <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-md border border-gray-300 shadow-sm">
          Role: <span className="font-semibold">{role}</span>
        </div>
      </div>
    </header>
  )
}
