"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Clock, FileText, User, Calendar, DollarSign, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()

//   useEffect(() => {
//   const fetchNotifications = async () => {
//     const res = await fetch("/api/notifications/get");
//     if (res.ok) {
//       const data = await res.json();
//       const now = Date.now();
//       const fresh: any[] = [];
//       const expired: any[] = [];

//       for (const n of data) {
//         const created = new Date(n.created_at).getTime();
//         const diff = (now - created) / (1000 * 60 * 60); // in hours
//         if (diff > 24) {
//           expired.push(n);
//         } else {
//           fresh.push(n);
//         }
//       }

//       // ✅ Archive expired notifications
//       if (expired.length > 0) {
//         await fetch("/api/notifications/archive", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ expired }),
//         });
//       }

//       setNotifications(fresh);
//     }
//   };

//   fetchNotifications();
//   const interval = setInterval(fetchNotifications, 60 * 1000);
//   return () => clearInterval(interval);
// }, []);


  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     const { data, error } = await supabase
  //       .from("notifications")
  //       .select("*")
  //       .order("created_at", { ascending: false })
  
  //     if (!error && data) {
  //       const now = Date.now()
  //       const fresh: any[] = []
  //       const expired: any[] = []
  
  //       for (const n of data) {
  //         const created = new Date(n.created_at).getTime()
  //         const diff = (now - created) / (1000 * 60 * 60) // hours
  //         if (diff > 24) {
  //           expired.push({
  //             id: n.id,
  //             action_type: "notification",
  //             description: n.message,
  //             title: n.title,
  //             type: n.type,
  //             client_id: n.client_id,
  //             created_at: n.created_at,
  //           })            
  //         } else {
  //           fresh.push(n)
  //         }
  //       }
  
  //       // if (expired.length) {
  //       //   const inserts = expired.map(({ id, ...rest }) => rest)
  //       //   const idsToDelete = expired.map((n) => n.id)
  //       //   await supabase.from("history_logs").insert(inserts)
  //       //   await supabase.from("notifications").delete().in("id", idsToDelete)
  //       // }
  //       if (expired.length) {
  //         for (const { id, ...rest } of expired) {
  //           // Check if this already exists in history_logs
  //           const { data: existing, error: fetchError } = await supabase
  //             .from("history_logs")
  //             .select("id")
  //             .eq("description", rest.description)
  //             .eq("created_at", rest.created_at)
  //             .maybeSingle()
        
  //           if (!existing) {
  //             await supabase.from("history_logs").insert([rest])
  //           }
        
  //           await supabase.from("notifications").delete().eq("id", id)
  //         }
  //       }
        
  
  //       setNotifications(fresh)
  //     }
  //   }
  
  //   fetchNotifications()
  //   const interval = setInterval(fetchNotifications, 60 * 1000)
  //   return () => clearInterval(interval)
  // }, [])  
  

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = async () => {
  if (notifications.length === 0) return;

  const res = await fetch("/api/notifications/mark-all-as-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notifications }),
  });

  if (res.ok) {
    setNotifications([]);
  } else {
    console.error("Failed to archive notifications");
  }
};

  // const markAllAsRead = async () => {
  //   const now = new Date().toISOString()
  
  //   const inserts = notifications.map((n) => ({
  //     action_type: "notification",
  //     description: n.message,
  //     created_at: now,
  //   }))    
  
  //   await supabase.from("history_logs").insert(inserts)
  
  //   const idsToDelete = notifications.map((n) => n.id)
  //   await supabase.from("notifications").delete().in("id", idsToDelete)
  
  //   setNotifications([])
  // } 
  

  const clearNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
  
    // await supabase.from("notifications").delete().eq("id", id)
  
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }
  

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "agreement":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "client":
        return <User className="h-4 w-4 text-green-500" />
      case "service":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "financial":
        return <DollarSign className="h-4 w-4 text-amber-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">No notifications</div>
        ) : (
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn("flex flex-col items-start p-3 cursor-pointer", !notification.read && "bg-primary/5")}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full justify-between">
                  <div className="flex items-center">
                    {getNotificationIcon(notification.type)}
                    <span className={cn("ml-2 font-medium", !notification.read && "text-primary")}>
                    {notification.title || "New Notification"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={(e) => clearNotification(notification.id, e)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                <div className="flex items-center text-xs text-gray-400 mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(notification.created_at).toLocaleString()}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
  className="justify-center text-sm text-primary cursor-pointer"
  onClick={() => {
    setOpen(false); // Close the dropdown
    router.push("/history");
  }}
>
  View all notifications
</DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
