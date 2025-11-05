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

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, logout } = useAuth()
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
        <Button
  onClick={() => router.push("/history")}
  className="text-sm bg-[#112B74] hover:bg-[#0E2463] text-white px-4 py-2 rounded-md shadow-sm transition-colors"
>
  <Clock className="h-4 w-4 mr-1 text-[#E9A41A]" />
  History
</Button>


        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-primary">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-2 relative overflow-hidden">
                <Image
                  src="/images/sage_healthy_rcm_logo.png"
                  alt="Sage Healthy Logo"
                  fill
                  style={{ objectFit: "contain", padding: "1px" }}
                />
              </div>
              <span>{user?.name || "Admin"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigateTo("/profile")} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateTo("/settings")} className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </header>
  )
}
