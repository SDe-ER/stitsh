export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'employee'
  avatar?: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: 'admin' | 'manager' | 'employee'
}

export interface AuthResponse {
  user: User
  token: string
}
