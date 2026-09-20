import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { LilyImage } from './Lily'
import { rand } from '../lib/random'
import type { CSSVars } from '../lib/css'

interface Piece {
  id: number
  kind: 'lily' | 'petal'
  x: number // % from left
  size: number
  dur: number // seconds to fall the full height
  delay: number
  amp: number // sideways sway distance (px)
  swayDur: number
  tint: string
}

const TINTS = ['#F3C9CF', '#EAA9B6', '#F8DDDF', '#E7B7C2']

function makePieces(lilies: number, petals: number): Piece[] {
  return Array.from({ length: lilies + petals }, (_, id) => {
    const lily = id < lilies
    return {
      id,
      kind: lily ? 'lily' : 'petal',
      x: rand(2, 96),
      size: lily ? rand(34, 58) : rand(14, 26),
      dur: lily ? rand(9, 14) : rand(7, 11),
      delay: rand(0, 8),
      amp: rand(14, 42),
      swayDur: rand(2.6, 4.6),
      tint: TINTS[id % TINTS.length],
    }
  })
}

function Petal({ size, tint }: { size: number; tint: string }) {
  return (
    <svg width={size * 0.7} height={size} viewBox="0 0 24 34" aria-hidden>
      <defs>
        <linearGradient id={`petal-${tint.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF1EE" />
          <stop offset="1" stopColor={tint} />
        </linearGradient>
      </defs>
      <path d="M12 0 C22 8 24 22 12 34 C0 22 2 8 12 0 Z" fill={`url(#petal-${tint.slice(1)})`} />
      <path d="M12 6 C12.5 14 12.5 22 12 30" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

/**
 * Petals + lilies that drift down from above the top edge, forever.
 * Pieces are created once (useMemo) and start hidden above the screen
 * (`animation-fill-mode: both`) so they never sit or jump at the top.
 */
export function FallingPetals({ startDelay = 0, lilies = 9, petals = 13 }: { startDelay?: number; lilies?: number; petals?: number }) {
  const layer = useRef<HTMLDivElement>(null)
  const [fall, setFall] = useState(900)
  const pieces = useMemo(() => makePieces(lilies, petals), [lilies, petals])

  // Fall distance = real scene height, so it works on any phone.
  useLayoutEffect(() => {
    if (layer.current) setFall(layer.current.offsetHeight + 130)
  }, [])

  return (
    <div
      ref={layer}
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      style={{ '--fall': `${fall}px` } as CSSVars}
      aria-hidden
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          className="petal-fall"
          style={{ left: `${p.x}%`, '--dur': `${p.dur}s`, '--delay': `${startDelay + p.delay}s` } as CSSVars}
        >
          <div className="petal-sway" style={{ '--amp': `${p.amp}px`, '--sway': `${p.swayDur}s` } as CSSVars}>
            {p.kind === 'lily' ? <LilyImage size={p.size} /> : <Petal size={p.size} tint={p.tint} />}
          </div>
        </div>
      ))}
    </div>
  )
}
