import { useState, useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Eye, AlertCircle, Crop, Loader2 } from 'lucide-react'
import { Button } from './Button'
import { ImageCropModal } from './ImageCropModal'

interface FileUploadProps {
  labelAr: string
  value?: string
  onChange: (url: string) => void
  accept?: string
  fileType?: 'image' | 'document'
  maxSize?: number // in MB
  imageType?: 'photo' | 'idCard' | 'residencyCard' | 'passportCard' // for dimension validation and display
  onIdCardDataExtracted?: (data: { number?: string; expiryDate?: string }) => void
}

// Dimension specifications
const PHOTO_DIMENSIONS = {
  width: 4, // cm (width - horizontal)
  height: 6, // cm (height - vertical/portrait)
  aspectRatio: 4 / 6, // ~0.667 (portrait orientation)
  tolerance: 0.1,
  nameAr: '4×6 سم (طولي)'
}

const ID_CARD_DIMENSIONS = {
  width: 85.6, // mm (ISO/IEC 7810 ID-1 - international standard)
  height: 53.98, // mm
  aspectRatio: 53.98 / 85.6, // ~0.625
  tolerance: 0.1,
  nameAr: '85.6×53.98 مم (قياس عالمي معياري)'
}

export function FileUpload({
  labelAr,
  value,
  onChange,
  accept = 'image/*,.pdf',
  fileType = 'image',
  maxSize = 5,
  imageType,
  onIdCardDataExtracted,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragActive, setDragActive] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [dimensionWarning, setDimensionWarning] = useState<string | null>(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)

  // OCR function to extract ID card data
  const extractIdCardData = async (imageUrl: string, cardType: 'residencyCard' | 'passportCard') => {
    if (typeof window === 'undefined' || !onIdCardDataExtracted) return

    setOcrProcessing(true)
    try {
      const Tesseract = (await import('tesseract.js')).default

      const result = await Tesseract.recognize(
        imageUrl,
        'ara+eng', // Arabic and English
        {
          logger: (m: any) => console.log(m)
        }
      )

      const text = result.data.text
      console.log('OCR Result:', text)

      // Extract data based on card type
      let extractedNumber: string | undefined
      let extractedExpiry: string | undefined

      if (cardType === 'residencyCard') {
        // Saudi ID / Residency card patterns
        // ID number: 10 digits
        const idPattern = /\b[23]\d{9}\b/
        const match = text.match(idPattern)
        if (match) {
          extractedNumber = match[0]
        }

        // Expiry date: various formats (DD/MM/YYYY, DD-MM-YYYY, etc.)
        const datePatterns = [
          /\b(\d{2})[\/\-](\d{2})[\/\-](2\d{3})\b/, // DD/MM/YYYY or DD-MM-YYYY
          /\b(\d{2})\.(\d{2})\.(2\d{3})\b/, // DD.MM.YYYY
        ]

        for (const pattern of datePatterns) {
          const dateMatch = text.match(pattern)
          if (dateMatch) {
            // Format as YYYY-MM-DD for input
            extractedExpiry = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
            break
          }
        }
      } else if (cardType === 'passportCard') {
        // Passport number pattern (varies by country)
        // Saudi passport: usually starts with letter or has specific format
        const passportPattern = /\b[A-Za-z]\d{6,8}\b|\b\d{8,10}\b/
        const match = text.match(passportPattern)
        if (match) {
          extractedNumber = match[0]
        }

        // Expiry date
        const datePatterns = [
          /\b(\d{2})[\/\-](\d{2})[\/\-](2\d{3})\b/,
          /\b(\d{2})\.(\d{2})\.(2\d{3})\b/,
        ]

        for (const pattern of datePatterns) {
          const dateMatch = text.match(pattern)
          if (dateMatch) {
            extractedExpiry = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
            break
          }
        }
      }

      if (extractedNumber || extractedExpiry) {
        onIdCardDataExtracted({
          number: extractedNumber,
          expiryDate: extractedExpiry
        })
      }
    } catch (error) {
      console.error('OCR Error:', error)
    } finally {
      setOcrProcessing(false)
    }
  }

  const checkImageDimensions = (img: HTMLImageElement): boolean => {
    if (!imageType) return true

    // Map residencyCard and passportCard to idCard dimensions
    const isIdCardType = imageType === 'residencyCard' || imageType === 'passportCard'
    const specs = imageType === 'photo' ? PHOTO_DIMENSIONS : ID_CARD_DIMENSIONS
    const aspectRatio = img.width / img.height
    const expectedRatio = specs.aspectRatio

    // Check if aspect ratio is within tolerance
    const ratioDiff = Math.abs(aspectRatio - expectedRatio)
    const isValid = ratioDiff <= specs.tolerance

    setDimensions({ width: img.width, height: img.height })

    if (!isValid) {
      const expectedWidth = isIdCardType ? 8.56 : (imageType === 'photo' ? 6 : 4)
      const expectedHeight = isIdCardType ? 5.398 : (imageType === 'photo' ? 4 : 6)
      const unit = 'سم'
      setDimensionWarning(
        `أبعاد الصورة الحالية (${img.width}×${img.height} بكسل) لا تطابق المقاس المطلوب (${specs.nameAr}). يمكنك قص الصورة لتناسب المقاس.`
      )
      return false
    }

    setDimensionWarning(null)
    return true
  }

  const handleFileSelect = async (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`حجم الملف كبير جداً. الحد الأقصى هو ${maxSize} ميجابايت`)
      return
    }

    setIsUploading(true)
    setDimensionWarning(null)
    setDimensions(null)

    try {
      // Create a local preview URL for immediate display
      const localUrl = URL.createObjectURL(file)

      // Check image dimensions if it's an image type with dimension requirements
      if (imageType && file.type.startsWith('image/')) {
        const img = new Image()
        img.onload = () => {
          const isCorrectRatio = checkImageDimensions(img)

          if (isCorrectRatio) {
            // Image has correct dimensions, use it directly
            setPreview(localUrl)
            onChange(localUrl)
            setIsUploading(false)

            // Run OCR for ID cards
            if (imageType === 'residencyCard' || imageType === 'passportCard') {
              extractIdCardData(localUrl, imageType)
            }
          } else {
            // Image has wrong dimensions, offer to crop
            setPendingImage(localUrl)
            setIsUploading(false)
            setCropModalOpen(true)
          }
        }
        img.onerror = () => {
          alert('فشل في قراءة الصورة')
          URL.revokeObjectURL(localUrl)
          setIsUploading(false)
        }
        img.src = localUrl
      } else {
        setPreview(localUrl)
        onChange(localUrl)
        setIsUploading(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('فشل رفع الملف')
      setIsUploading(false)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedUrl = URL.createObjectURL(croppedBlob)
    setPreview(croppedUrl)
    onChange(croppedUrl)
    setPendingImage(null)
    setDimensionWarning(null)

    // Run OCR for ID cards after cropping
    if (imageType === 'residencyCard' || imageType === 'passportCard') {
      extractIdCardData(croppedUrl, imageType)
    }
  }

  const handleCropModalClose = () => {
    setCropModalOpen(false)
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage)
      setPendingImage(null)
    }
    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setDimensions(null)
    setDimensionWarning(null)
    setPendingImage(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReopenCrop = () => {
    if (preview) {
      setPendingImage(preview)
      setCropModalOpen(true)
    }
  }

  const getFileIcon = () => {
    if (fileType === 'image') return <ImageIcon className="w-6 h-6 text-gray-400" />
    return <FileText className="w-6 h-6 text-gray-400" />
  }

  const getPreviewStyle = () => {
    if (!imageType || !dimensions) return {}

    const isIdCardType = imageType === 'residencyCard' || imageType === 'passportCard'

    // Display at reasonable screen size while maintaining aspect ratio
    if (imageType === 'photo') {
      // 4x6 cm photo (portrait) - display at ~240px width, 360px height
      const displayWidth = 240
      const displayHeight = 360
      return { width: `${displayWidth}px`, height: `${displayHeight}px` }
    } else {
      // ID card (85.6x53.98 mm) - display at actual screen proportional size (international standard)
      const displayWidth = 322
      const displayHeight = 204
      return { width: `${displayWidth}px`, height: `${displayHeight}px` }
    }
  }

  const getDimensionLabel = () => {
    if (!imageType) return null
    if (imageType === 'photo') return '4×6 سم'
    return '85.6×53.98 مم'
  }

  const getCropAspectRatio = () => {
    if (!imageType) return undefined
    if (imageType === 'photo') return 4 / 6 // ~0.667 (portrait)
    return 85.6 / 53.98 // ~1.585
  }

  const getCropLabel = () => {
    if (!imageType) return ''
    if (imageType === 'photo') return '4×6 سم'
    return '85.6×53.98 مم (قياس عالمي معياري)'
  }

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 font-cairo">
          {labelAr}
          {imageType && (
            <span className="text-xs text-gray-500 mr-2">
              ({getDimensionLabel()})
            </span>
          )}
        </label>

        {ocrProcessing && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-800 font-cairo">جاري استخراج البيانات من الصورة...</p>
          </div>
        )}

        {dimensionWarning && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-cairo flex-1">{dimensionWarning}</p>
            {pendingImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCropModalOpen(true)}
                className="font-cairo flex items-center gap-1"
              >
                <Crop className="w-3 h-3" />
                قص الصورة
              </Button>
            )}
          </div>
        )}

        {preview ? (
          <div className="relative border border-gray-300 rounded-lg p-3 bg-gray-50">
            {fileType === 'image' && preview && (preview.endsWith('.jpg') || preview.endsWith('.jpeg') || preview.endsWith('.png') || preview.startsWith('blob:')) ? (
              <div className="flex justify-center bg-white rounded-lg p-2">
                <img
                  src={preview}
                  alt={labelAr}
                  className="rounded-lg shadow-sm object-contain"
                  style={getPreviewStyle()}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                {getFileIcon()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 font-sans truncate">
                    {labelAr}
                  </p>
                  <p className="text-xs text-gray-500 font-sans truncate">
                    {preview.split('/').pop()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (preview.startsWith('blob:')) {
                    window.open(preview, '_blank')
                  }
                }}
                className="font-cairo"
              >
                <Eye className="w-3 h-3 ml-1" />
                معاينة
              </Button>
              {imageType && preview && (preview.endsWith('.jpg') || preview.endsWith('.jpeg') || preview.endsWith('.png') || preview.startsWith('blob:')) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReopenCrop}
                  className="font-cairo"
                >
                  <Crop className="w-3 h-3 ml-1" />
                  إعادة القص
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="font-cairo text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="w-3 h-3 ml-1" />
                إزالة
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-[#2563eb] bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragActive(false)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm text-gray-600 font-cairo">جاري الرفع...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 font-cairo">
                  {labelAr}
                </p>
                <p className="text-xs text-gray-500 font-cairo mt-1">
                  اسحب الملف هنا أو انقر للاختيار
                </p>
                <p className="text-xs text-gray-400 font-cairo mt-1">
                  الحد الأقصى: {maxSize} ميجابايت
                </p>
                {imageType && (
                  <p className="text-xs text-blue-600 font-cairo mt-1">
                    المقاس المطلوب: {getDimensionLabel()}
                  </p>
                )}
                {(imageType === 'residencyCard' || imageType === 'passportCard') && (
                  <p className="text-xs text-green-600 font-cairo mt-1">
                    سيتم استخراج البيانات تلقائياً
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {pendingImage && imageType && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={handleCropModalClose}
          imageSrc={pendingImage}
          onCropComplete={handleCropComplete}
          imageType={imageType === 'photo' ? 'photo' : 'idCard'}
        />
      )}
    </>
  )
}
