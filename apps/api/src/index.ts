import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.js'
import { projectsRouter } from './routes/projects.js'
import { employeesRouter } from './routes/employees.js'
import { equipmentRouter } from './routes/equipment.js'
import { financialRouter } from './routes/financial.js'
import { suppliersRouter } from './routes/suppliers.js'
import { dashboardRouter } from './routes/dashboard.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// ============================================================================
// TRUSTED PROXY (for rate limiting behind proxies)
// ============================================================================
app.set('trust proxy', 1)

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

// ============================================================================
// CORS MIDDLEWARE
// ============================================================================
app.use(cors({
  origin: [CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ============================================================================
// RATE LIMITING (100 requests per minute)
// ============================================================================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later.',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply rate limiting to all API routes
app.use('/api', limiter)

// ============================================================================
// REQUEST PARSING MIDDLEWARE
// ============================================================================
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HeavyOps ERP API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  })
})

// ============================================================================
// API ROUTES
// ============================================================================
app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/equipment', equipmentRouter)
app.use('/api/finance', financialRouter)
app.use('/api/suppliers', suppliersRouter)
app.use('/api/dashboard', dashboardRouter)

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================
app.use(notFoundHandler)

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================
app.use(errorHandler)

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                                                            ║')
  console.log(`║        🚀 HeavyOps ERP API Server                          ║`)
  console.log('║                                                            ║')
  console.log(`║        ➜  Local:   http://localhost:${PORT}                   ║`)
  console.log(`║        ➜  Health:  http://localhost:${PORT}/api/health        ║`)
  console.log('║                                                            ║')
  console.log(`║        Environment: ${process.env.NODE_ENV || 'development'}                          ║`)
  console.log('║                                                            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
})

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

export default app
