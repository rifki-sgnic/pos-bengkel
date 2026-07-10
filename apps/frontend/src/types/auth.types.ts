export type Role = "OWNER" | "CASHIER"

export interface User {
  id: string
  name: string
  username: string
  email: string
  role: Role
  createdAt: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
