export interface User {
  id: string
  username: string
  name: string
  role: "admin" | "user"
  email: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface JWTPayload {
  sub: string // user id
  username: string
  name: string
  role: string
  email: string
  iat: number
  exp: number
}
