import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import FreeCropper from './FreeCropper'
import type { CropResult } from './FreeCropper'

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  imageType: 'photo' | 'idCard'
}

// Physical dimensions in mm
const PHYSICAL_DIMENSIONS = {
  photo: { width: 40, height: 60 }, // 4x6 cm = 40x60 mm (portrait)
  idCard: { width: 85.6, height: 53.98 }, // ISO/IEC 7810 ID-1 (standard international)
}

// Output dimensions (fixed at physical size)
const OUTPUT_DIMENSIONS = {
  photo: { width: 240, height: 360 }, // 4x6 cm at 96 DPI (portrait)
  idCard: { width: 322, height: 204 }, // 85.6x53.98 mm at 96 DPI (standard international)
}

const CROP_AREA_LABELS: Record<typeof imageType, string> = {
  photo: '4×6 سم (طولي)',
  idCard: '85.6×53.98 مم (قياس عالمي معياري)',
} as const

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  imageType,
}: ImageCropModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const cropLabel = CROP_AREA_LABELS[imageType]
  const outputDims = OUTPUT_DIMENSIONS[imageType]
  const physicalDims = PHYSICAL_DIMENSIONS[imageType]

  // Convert imageType to FreeCropper preset
  const preset = imageType === 'photo' ? ('PROFILE' as const) : ('ID_CARD' as const)

  const handleCropComplete = (result: CropResult) => {
    setIsProcessing(true)
    onCropComplete(result.blob)
    setIsProcessing(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleAr={`قص الصورة - ${cropLabel}`}>
      <div className="space-y-4">
        {/* Size indicator showing target dimensions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-700 font-cairo">
              <div className="w-4 h-3 border-2 border-blue-500 rounded-sm bg-white"></div>
              <span>
                المقاس النهائي: <span className="font-bold text-[#2563eb]">{physicalDims.width}</span> × <span className="font-bold text-[#2563eb]">{physicalDims.height}</span> مم
              </span>
            </div>
            <div className="w-px h-6 bg-blue-300"></div>
            <div className="flex items-center gap-2 text-gray-700 font-cairo">
              <div className="w-5 h-3 border-2 border-green-500 rounded-sm bg-white"></div>
              <span>
                الحجم الناتج: <span className="font-bold text-green-600">{outputDims.width}</span> × <span className="font-bold text-green-600">{outputDims.height}</span> بكسل
              </span>
            </div>
          </div>
          {imageType === 'idCard' && (
            <div className="mt-2 text-center text-xs text-blue-700 font-cairo">
              ⚠️ سيتم إعادة تحجيم الصورة إلى المقاس القياسي (85.6×53.98 مم)
            </div>
          )}
        </div>

        {/* FreeCropper */}
        <FreeCropper
          src={imageSrc}
          preset={preset}
          outputSize={outputDims}
          idCardRatio={85.6 / 53.98}
          hideExportButtons={true}
          showConfirmButton={true}
          onCropped={handleCropComplete}
        />

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 font-cairo mb-2">
                تعليمات القص الاحترافي
              </p>
              <ul className="text-xs text-blue-800 font-cairo space-y-1">
                <li>• <strong>قص حر:</strong> اسحب المنطقة لتحديد الجزء المطلوب بحرية</li>
                <li>• استخدم المقابض في الزوايا والحواف لضبط الحجم</li>
                <li>• استخدم التقريب لتوضيح التفاصيل الدقيقة</li>
                <li>• تأكد من ظهور جميع البيانات المطلوبة بوضوح</li>
                <li>• الصورة النهائية ستكون بالمقاس: <span className="font-bold">{cropLabel}</span></li>
                <li>• اضغط على "Export JPG" لإتمام القص وحفظ الصورة</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-cairo"
            disabled={isProcessing}
          >
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  )
}
