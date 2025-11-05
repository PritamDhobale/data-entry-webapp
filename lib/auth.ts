// import { SignJWT, jwtVerify } from "jose"
// import { cookies } from "next/headers"
// import type { NextRequest } from "next/server"
// import type { User, JWTPayload } from "@/types/auth"

// // In a real app, this would be an environment variable
// const JWT_SECRET = new TextEncoder().encode("your-secret-key-change-this-in-production")
// const TOKEN_NAME = "sage-healthy-auth-token"

// // Mock user database - in a real app, this would be a database query
// const USERS = [
//   {
//     id: "1",
//     username: "admin",
//     password: "admin123", // In a real app, this would be hashed
//     name: "Admin User",
//     role: "admin",
//     email: "admin@sagehealthy.com",
//   },
//   {
//     id: "2",
//     username: "user",
//     password: "user123", // In a real app, this would be hashed
//     name: "Regular User",
//     role: "user",
//     email: "user@sagehealthy.com",
//   },
// ]

// export async function login(username: string, password: string): Promise<User | null> {
//   // In a real app, you would query your database and check hashed passwords
//   const user = USERS.find((u) => u.username === username && u.password === password)

//   if (!user) {
//     return null
//   }

//   // Create a JWT token
//   const token = await createToken({
//     sub: user.id,
//     username: user.username,
//     name: user.name,
//     role: user.role,
//     email: user.email,
//   })

//   // Set the token as an HTTP-only cookie
//   const cookieStore = cookies()
//   cookieStore.set(TOKEN_NAME, token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 60 * 60 * 24 * 7, // 1 week
//     path: "/",
//     sameSite: "strict",
//   })

//   // Return the user without the password
//   const { password: _, ...userWithoutPassword } = user
//   return userWithoutPassword as User
// }

// export async function logout() {
//   const cookieStore = cookies()
//   cookieStore.delete(TOKEN_NAME)
// }

// export async function getSession(): Promise<User | null> {
//   const cookieStore = cookies()
//   const token = cookieStore.get(TOKEN_NAME)?.value

//   if (!token) {
//     return null
//   }

//   try {
//     const verified = await verifyToken(token)
//     return {
//       id: verified.sub,
//       username: verified.username,
//       name: verified.name,
//       role: verified.role as "admin" | "user",
//       email: verified.email,
//     }
//   } catch (error) {
//     return null
//   }
// }

// async function createToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
//   const iat = Math.floor(Date.now() / 1000)
//   const exp = iat + 60 * 60 * 24 * 7 // 1 week

//   return new SignJWT({ ...payload, iat, exp }).setProtectedHeader({ alg: "HS256" }).sign(JWT_SECRET)
// }

// async function verifyToken(token: string): Promise<JWTPayload> {
//   const { payload } = await jwtVerify(token, JWT_SECRET)
//   return payload as JWTPayload
// }

// // Middleware helper to protect routes
// export function isAuthenticated(request: NextRequest) {
//   const token = request.cookies.get(TOKEN_NAME)?.value

//   if (!token) {
//     return false
//   }

//   // In a middleware, we can't use async verification
//   // This is a simplified check - in production, you'd want to verify the token properly
//   try {
//     // Just check if the token exists and hasn't expired
//     // The full verification happens in getSession()
//     const payload = JSON.parse(atob(token.split(".")[1]))
//     const expiry = payload.exp * 1000 // convert to milliseconds
//     return Date.now() < expiry
//   } catch (error) {
//     return false
//   }
// }
