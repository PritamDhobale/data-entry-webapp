"use server"

import { login as loginUser, logout as logoutUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  try {
    const user = await loginUser(username, password)

    if (!user) {
      return {
        error: "Invalid username or password",
        success: false,
      }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    return {
      error: "An error occurred during login",
      success: false,
    }
  }
}

export async function logout() {
  await logoutUser()
  redirect("/login")
}
