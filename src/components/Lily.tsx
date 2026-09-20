import { useState } from 'react'
import { LILY_IMAGE } from '../content'
import { assetUrl } from '../lib/asset'

const PETAL = 'M20 21 C12 14 13 5 20 1 C27 5 28 14 20 21 Z'

/** Drawn lily, used inside the wax seal and as a fallback for the sticker. */
export function LilySvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lily-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF8EC" />
          <stop offset="1" stopColor="#F0DCC6" />
        </linearGradient>
      </defs>
      {[0, 120, 240].map((a) => (
        <path key={a} d={PETAL} fill="#E9D3BC" transform={`rotate(${a} 20 20)`} />
      ))}
      {[60, 180, 300].map((a) => (
        <path key={a} d={PETAL} fill="url(#lily-petal)" stroke="rgba(201,166,107,0.4)" strokeWidth="0.5" transform={`rotate(${a} 20 20)`} />
      ))}
      {[20, 80, 140, 200, 260, 320].map((a) => (
        <g key={a} transform={`rotate(${a} 20 20)`}>
          <line x1="20" y1="20" x2="20" y2="10" stroke="#C9A66B" strokeWidth="0.8" />
          <circle cx="20" cy="9.5" r="1.3" fill="#B98A4A" />
        </g>
      ))}
      <circle cx="20" cy="20" r="2.2" fill="#D9B978" />
    </svg>
  )
}

/** Uses the user's transparent lily sticker (/public/lily.png) when present. */
export function LilyImage({ size }: { size: number }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <LilySvg size={size} />
  return (
    <img
      src={assetUrl(LILY_IMAGE)}
      alt=""
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 3px 6px rgba(20,6,12,0.35))' }}
    />
  )
}
