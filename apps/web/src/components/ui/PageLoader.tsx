import { LoadingSpinner } from './LoadingSpinner'

interface PageLoaderProps {
  message?: string
  messageAr?: string
  fullscreen?: boolean
}

export function PageLoader({
  message = 'Loading...',
  messageAr = 'جاري التحميل...',
  fullscreen = true,
}: PageLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4" dir="rtl">
      <LoadingSpinner size="lg" color="primary" />
      <p className="text-gray-600 font-cairo text-sm">{messageAr}</p>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      {content}
    </div>
  )
}
