import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js'
import { AppError, UnauthorizedError, ConflictError, NotFoundError } from '../middleware/errorHandler.js'

// ============================================================================
// USER INTERFACE
// ============================================================================
export interface User {
  id: string
  email: string
  name: string
  nameAr?: string
  phone?: string
  role: string
  passwordHash: string
  isActive: boolean
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  nameAr?: string
  phone?: string
  role?: string
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  token: string
}

// ============================================================================
// MOCK DATABASE (Replace with Prisma in production)
// ============================================================================
let users: User[] = [
  {
    id: '1',
    email: 'admin@heavyops.sa',
    name: 'Admin User',
    nameAr: 'مدير النظام',
    phone: '+966501234567',
    role: 'ADMIN',
    passwordHash: '$2a$10$rKvZgxQYtbQv8KVFXH3QSOsW5ZQqF8qvXQXqF8qvXQXqF8qvXQXq', // password: admin123
    isActive: true,
    avatar: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

let sessions: Array<{ token: string; userId: string; expiresAt: Date }> = []

// ============================================================================
// AUTH SERVICE
// ============================================================================
export class AuthService {
  // ============================================================================
  // REGISTER NEW USER
  // ============================================================================
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = users.find((u) => u.email === data.email)
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      email: data.email,
      name: data.name,
      nameAr: data.nameAr,
      phone: data.phone,
      role: data.role || 'VIEWER',
      passwordHash,
      isActive: true,
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    users.push(newUser)

    // Generate token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as any,
    })

    // Create session
    sessions.push({
      token,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = newUser

    return {
      user: userWithoutPassword,
      token,
    }
  }

  // ============================================================================
  // LOGIN USER
  // ============================================================================
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user by email
    const user = users.find((u) => u.email === credentials.email)
    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled')
    }

    // Verify password
    const isPasswordValid = await comparePassword(credentials.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    })

    // Create session
    sessions.push({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    // Update last login
    user.updatedAt = new Date()

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  }

  // ============================================================================
  // VERIFY TOKEN
  // ============================================================================
  async verifyToken(token: string): Promise<Omit<User, 'passwordHash'> | null> {
    // Find session
    const session = sessions.find((s) => s.token === token)
    if (!session || session.expiresAt < new Date()) {
      return null
    }

    // Find user
    const user = users.find((u) => u.id === session.userId)
    if (!user || !user.isActive) {
      return null
    }

    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // ============================================================================
  // LOGOUT USER
  // ============================================================================
  async logout(token: string): Promise<void> {
    sessions = sessions.filter((s) => s.token !== token)
  }

  // ============================================================================
  // LOGOUT FROM ALL DEVICES
  // ============================================================================
  async logoutAll(userId: string): Promise<void> {
    sessions = sessions.filter((s) => s.userId !== userId)
  }

  // ============================================================================
  // CHANGE PASSWORD
  // ============================================================================
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = users.find((u) => u.id === userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    // Hash new password
    user.passwordHash = await hashPassword(newPassword)
    user.updatedAt = new Date()

    // Logout from all devices
    await this.logoutAll(userId)
  }

  // ============================================================================
  // GET USER BY ID
  // ============================================================================
  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = users.find((u) => u.id === userId)
    if (!user) {
      return null
    }

    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // ============================================================================
  // GET ALL USERS
  // ============================================================================
  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    return users.map(({ passwordHash, ...user }) => user)
  }

  // ============================================================================
  // UPDATE USER
  // ============================================================================
  async updateUser(
    userId: string,
    data: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>
  ): Promise<Omit<User, 'passwordHash'>> {
    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new NotFoundError('User not found')
    }

    users[userIndex] = {
      ...users[userIndex],
      ...data,
      updatedAt: new Date(),
    }

    const { passwordHash, ...userWithoutPassword } = users[userIndex]
    return userWithoutPassword
  }

  // ============================================================================
  // DELETE USER
  // ============================================================================
  async deleteUser(userId: string): Promise<void> {
    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      throw new NotFoundError('User not found')
    }

    users.splice(userIndex, 1)
    await this.logoutAll(userId)
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // ============================================================================
  // CLEANUP EXPIRED SESSIONS
  // ============================================================================
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date()
    sessions = sessions.filter((s) => s.expiresAt > now)
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const authService = new AuthService()
