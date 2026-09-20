import type { CSSProperties, ReactNode } from 'react'

interface Props {
  size?: number
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function WaxSeal({ size = 56, children, className, style }: Props) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at 36% 32%, #9A4258, #6B2D3C 58%, #45192A)',
        border: '2px solid rgba(201,166,107,0.5)',
        boxShadow:
          'inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -3px 6px rgba(0,0,0,0.3), 0 4px 14px rgba(74,20,34,0.4)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
