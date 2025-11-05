import { useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/router"

export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login") // Redirect to login if not authenticated
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return null // Loading state, can show a spinner or loading page
  }

  return null
}
