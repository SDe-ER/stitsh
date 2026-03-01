import React from 'react'

interface MaterialSymbolProps {
  icon: string
  className?: string
  style?: React.CSSProperties
}

export function MaterialSymbol({ icon, className = '', style }: MaterialSymbolProps) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {icon}
    </span>
  )
}
