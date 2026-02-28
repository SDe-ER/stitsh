import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/lib/prisma.js'
import { hashPassword, verifyPassword, generateToken, generateSessionId } from '@/lib/auth.js'
import { loginSchema, registerSchema, changePasswordSchema } from '@/validators/auth.validator.js'
import { authMiddleware } from '@/middleware/auth.js'

export const authRouter = Router()

// POST /api/auth/login - User login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        passwordHash: true,
        isActive: true,
        avatar: true,
        phone: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          status: 401,
        },
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: {
          message: 'Account is disabled',
          status: 403,
        },
      })
    }

    // Verify password
    // Development mode: bypass bcrypt for admin user with common test passwords
    let isValidPassword = false
    if (user.email === 'admin@heavyops.sa' && process.env.NODE_ENV !== 'production') {
      const validTestPasswords = ['admin123', 'Admin123!', 'password']
      if (validTestPasswords.includes(body.password)) {
        isValidPassword = true
      }
    }

    // If not bypassed, use bcrypt verification
    if (!isValidPassword) {
      isValidPassword = await verifyPassword(body.password, user.passwordHash)
    }

    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          status: 401,
        },
      })
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          details: error.errors,
          status: 400,
        },
      })
    }

    console.error('Login error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// POST /api/auth/register - Register new user
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return res.status(409).json({
        error: {
          message: 'Email already registered',
          status: 409,
        },
      })
    }

    // Hash password
    const passwordHash = await hashPassword(body.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        nameAr: body.nameAr,
        phone: body.phone,
        role: body.role || 'VIEWER',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        isActive: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    res.status(201).json({
      message: 'Registration successful',
      data: {
        token,
        user,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          details: error.errors,
          status: 400,
        },
      })
    }

    console.error('Register error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// POST /api/auth/logout - User logout
authRouter.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.substring(7)

    if (token) {
      // Delete session
      await prisma.session.deleteMany({
        where: { token },
      })
    }

    res.json({
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// GET /api/auth/me - Get current user
authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        nameAr: true,
        role: true,
        isActive: true,
        avatar: true,
        phone: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404,
        },
      })
    }

    res.json({
      data: user,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// PUT /api/auth/change-password - Change password
authRouter.put('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = changePasswordSchema.parse(req.body)

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        passwordHash: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404,
        },
      })
    }

    // Verify current password
    const isValidPassword = await verifyPassword(body.currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Current password is incorrect',
          status: 401,
        },
      })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(body.newPassword)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    // Delete all sessions (force re-login on all devices)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    res.json({
      message: 'Password changed successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          details: error.errors,
          status: 400,
        },
      })
    }

    console.error('Change password error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// POST /api/auth/refresh - Refresh token
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: {
          message: 'Token is required',
          status: 400,
        },
      })
    }

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired token',
          status: 401,
        },
      })
    }

    if (!session.user.isActive) {
      return res.status(403).json({
        error: {
          message: 'Account is disabled',
          status: 403,
        },
      })
    }

    // Generate new token
    const newToken = generateToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    })

    // Update session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.session.update({
      where: { token },
      data: {
        token: newToken,
        expiresAt,
      },
    })

    res.json({
      message: 'Token refreshed successfully',
      data: { token: newToken },
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// GET /api/auth/sessions - Get user sessions
authRouter.get('/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: req.user!.userId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    res.json({
      data: sessions,
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// DELETE /api/auth/sessions/:id - Revoke session
authRouter.delete('/sessions/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if session belongs to user
    const session = await prisma.session.findUnique({
      where: { id },
    })

    if (!session) {
      return res.status(404).json({
        error: {
          message: 'Session not found',
          status: 404,
        },
      })
    }

    if (session.userId !== req.user!.userId) {
      return res.status(403).json({
        error: {
          message: 'Forbidden',
          status: 403,
        },
      })
    }

    await prisma.session.delete({
      where: { id },
    })

    res.json({
      message: 'Session revoked successfully',
    })
  } catch (error) {
    console.error('Revoke session error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})
