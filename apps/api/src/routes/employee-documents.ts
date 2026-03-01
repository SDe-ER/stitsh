import { Router, type Request } from 'express'
import { prisma } from '@/lib/prisma.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { buildAbsoluteUrl } from '@/utils/url.js'

const router = Router()

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents')

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
      cb(null, UPLOAD_DIR)
    } catch (error) {
      cb(error as Error, UPLOAD_DIR)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `doc-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Only image, PDF, and document files are allowed'))
  }
})

// Support multiple files upload
const uploadMultiple = upload.array('files', 10) // Max 10 files

const resolveDocumentFileUrl = (
  req: Request,
  fileUrl?: string | null,
  fileName?: string | null
): string | null => {
  const relativeUrl = fileUrl || (fileName ? `/uploads/documents/${fileName}` : null)
  return buildAbsoluteUrl(req, relativeUrl)
}

// ============================================================================
// GET /api/employees/:id/documents - Fetch all documents for an employee
// ============================================================================

router.get('/:employeeId/documents', async (req, res) => {
  try {
    const { employeeId } = req.params

    const documents = await prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate status based on expiry date
    const documentsWithStatus = documents.map(doc => {
      let status: 'VALID' | 'EXPIRING' | 'EXPIRED' = 'VALID'

      if (doc.expiryDate) {
        const today = new Date()
        const expiry = new Date(doc.expiryDate)
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry < 0) {
          status = 'EXPIRED'
        } else if (daysUntilExpiry <= 30) {
          status = 'EXPIRING'
        }
      }

      const absoluteFileUrl = resolveDocumentFileUrl(req, doc.fileUrl, doc.fileName) || doc.fileUrl

      return {
        ...doc,
        status,
        fileUrl: absoluteFileUrl
      }
    })

    res.json(documentsWithStatus)
  } catch (error) {
    console.error('Error fetching employee documents:', error)
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

// ============================================================================
// POST /api/employees/:id/documents - Upload a new document
// ============================================================================

router.post('/:employeeId/documents', upload.single('file'), async (req, res) => {
  try {
    const { employeeId } = req.params
    const { type, expiryDate, notes } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!type) {
      return res.status(400).json({ error: 'Document type is required' })
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      // Clean up uploaded file
      await fs.unlink(file.path).catch(() => {})
      return res.status(404).json({ error: 'Employee not found' })
    }

    // Calculate status based on expiry date
    let status: 'VALID' | 'EXPIRING' | 'EXPIRED' = 'VALID'
    if (expiryDate) {
      const today = new Date()
      const expiry = new Date(expiryDate)
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) {
        status = 'EXPIRED'
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING'
      }
    }

    // Create document record
    const document = await prisma.employeeDocument.create({
      data: {
        employeeId,
        type: type.toUpperCase(),
        fileUrl: `/uploads/documents/${file.filename}`,
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        status,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes
      }
    })

    const absoluteFileUrl = resolveDocumentFileUrl(req, document.fileUrl, document.fileName) || document.fileUrl

    res.status(201).json({
      ...document,
      fileUrl: absoluteFileUrl
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    // Clean up uploaded file if error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {})
    }
    res.status(500).json({ error: 'Failed to upload document' })
  }
})

// ============================================================================
// POST /api/employees/:id/documents/batch - Upload multiple documents
// ============================================================================

router.post('/:employeeId/documents/batch', uploadMultiple, async (req, res) => {
  try {
    const { employeeId } = req.params
    const files = req.files as Express.Multer.File[]
    const { documents } = req.body // Array of { type, expiryDate, notes }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    if (!documents) {
      return res.status(400).json({ error: 'Documents metadata is required' })
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      // Clean up uploaded files
      for (const file of files) {
        await fs.unlink(file.path).catch(() => {})
      }
      return res.status(404).json({ error: 'Employee not found' })
    }

    // Parse documents metadata
    let documentsMeta: any[] = []
    try {
      documentsMeta = JSON.parse(documents)
    } catch {
      documentsMeta = []
    }

    // Create document records for each file
    const createdDocuments = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const meta = documentsMeta[i] || {}

      // Calculate status based on expiry date
      let status: 'VALID' | 'EXPIRING' | 'EXPIRED' = 'VALID'
      if (meta.expiryDate) {
        const today = new Date()
        const expiry = new Date(meta.expiryDate)
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry < 0) {
          status = 'EXPIRED'
        } else if (daysUntilExpiry <= 30) {
          status = 'EXPIRING'
        }
      }

      const document = await prisma.employeeDocument.create({
        data: {
          employeeId,
          type: (meta.type || 'OTHER').toUpperCase(),
          fileUrl: `/uploads/documents/${file.filename}`,
          fileName: file.filename,
          fileSize: file.size,
          mimeType: file.mimetype,
          status,
          expiryDate: meta.expiryDate ? new Date(meta.expiryDate) : null,
          notes: meta.notes
        }
      })

      const absoluteFileUrl = resolveDocumentFileUrl(req, document.fileUrl, document.fileName) || document.fileUrl
      createdDocuments.push({
        ...document,
        fileUrl: absoluteFileUrl
      })
    }

    res.status(201).json({
      message: 'Documents uploaded successfully',
      data: createdDocuments
    })
  } catch (error) {
    console.error('Error uploading documents:', error)
    // Clean up uploaded files if error
    if (req.files) {
      const files = req.files as Express.Multer.File[]
      for (const file of files) {
        await fs.unlink(file.path).catch(() => {})
      }
    }
    res.status(500).json({ error: 'Failed to upload documents' })
  }
})

// ==========================================================================
// GET /api/employees/:id/documents/:docId/file - Serve document file
// ==========================================================================

router.get('/:employeeId/documents/:docId/file', async (req, res) => {
  try {
    const { employeeId, docId } = req.params

    const document = await prisma.employeeDocument.findFirst({
      where: {
        id: docId,
        employeeId,
      },
    })

    if (!document) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'المستند غير موجود',
        field: 'docId',
      })
    }

    const fileName = document.fileName || path.basename(document.fileUrl)
    if (!fileName) {
      return res.status(404).json({
        error: 'FILE_NOT_FOUND',
        message: 'ملف المستند غير موجود',
        field: 'file',
      })
    }

    const filePath = path.join(UPLOAD_DIR, fileName)
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({
        error: 'FILE_NOT_FOUND',
        message: 'ملف المستند غير موجود',
        field: 'file',
      })
    }

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)

    return res.sendFile(filePath)
  } catch (error) {
    console.error('Error serving document file:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'تعذر تحميل ملف المستند',
      field: 'file',
    })
  }
})

// ============================================================================
// DELETE /api/employees/:id/documents/:docId - Delete a document
// ============================================================================

router.delete('/:employeeId/documents/:docId', async (req, res) => {
  try {
    const { employeeId, docId } = req.params

    const document = await prisma.employeeDocument.findFirst({
      where: {
        id: docId,
        employeeId
      }
    })

    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'uploads', 'documents', document.fileName || '')
    await fs.unlink(filePath).catch(() => {})

    // Delete database record
    await prisma.employeeDocument.delete({
      where: { id: docId }
    })

    res.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ error: 'Failed to delete document' })
  }
})

// ============================================================================
// PUT /api/employees/:id/documents/:docId - Update document (expiry/notes)
// ============================================================================

router.put('/:employeeId/documents/:docId', async (req, res) => {
  try {
    const { employeeId, docId } = req.params
    const { expiryDate, notes } = req.body

    // Verify document belongs to employee
    const existing = await prisma.employeeDocument.findFirst({
      where: {
        id: docId,
        employeeId
      }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // Recalculate status if expiry date changed
    let status = existing.status
    if (expiryDate && expiryDate !== existing.expiryDate?.toISOString().split('T')[0]) {
      const today = new Date()
      const expiry = new Date(expiryDate)
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) {
        status = 'EXPIRED'
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING'
      } else {
        status = 'VALID'
      }
    }

    const document = await prisma.employeeDocument.update({
      where: { id: docId },
      data: {
        ...(expiryDate !== undefined && { expiryDate: new Date(expiryDate) }),
        ...(notes !== undefined && { notes }),
        status
      }
    })

    const absoluteFileUrl = resolveDocumentFileUrl(req, document.fileUrl, document.fileName) || document.fileUrl

    res.json({
      ...document,
      fileUrl: absoluteFileUrl,
    })
  } catch (error) {
    console.error('Error updating document:', error)
    res.status(500).json({ error: 'Failed to update document' })
  }
})

export { router as employeeDocumentsRouter }
