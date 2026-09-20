import { useEffect, useMemo, useRef, useState } from 'react'
import { pick, prefersReducedMotion, rand } from '../lib/random'
import type { CSSVars } from '../lib/css'

const COLORS = ['#E8B4B4', '#D9B978', '#F5EBDD', '#F0C8C8', '#E5C87A', '#F0D9C0']
const RISE_MS = 700
const LIFETIME_MS = 2800

interface Burst {
  id: number
  x: number // % of scene width
  y: number // % of scene height
  color: string
  size: number
}

function Firework({ x, y, color, size }: Omit<Burst, 'id'>) {
  // Random values are fixed once per burst (re-renders must not re-roll them).
  const sparks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + rand(-0.12, 0.12)
        const d = rand(44, 98) * size
        return {
          i,
          tx: Math.cos(a) * d,
          ty: Math.sin(a) * d,
          px: rand(2, 4.2) * size,
          dur: rand(0.9, 1.5),
          delay: RISE_MS / 1000 + rand(0, 0.1),
        }
      }),
    [size],
  )

  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {/* rocket climbing to the burst point */}
      <span
        style={
          {
            position: 'absolute',
            left: -1.5,
            top: -1.5,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#F5EBDD',
            boxShadow: '0 8px 10px rgba(217,185,120,0.55), 0 0 6px #F5EBDD',
            '--rise': `${(100 - y) * 9}px`,
            animation: `rocket-rise ${RISE_MS}ms cubic-bezier(0.2, 0.7, 0.4, 1) both`,
          } as CSSVars
        }
      />
      <span
        style={{
          position: 'absolute',
          left: -14 * size,
          top: -14 * size,
          width: 28 * size,
          height: 28 * size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}, transparent 68%)`,
          animation: `firework-flare 0.8s ease-out ${RISE_MS}ms both`,
        }}
      />
      {sparks.map((s) => (
        <span
          key={s.i}
          style={
            {
              position: 'absolute',
              left: -s.px / 2,
              top: -s.px / 2,
              width: s.px,
              height: s.px,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 7px ${color}`,
              '--tx': `${s.tx}px`,
              '--ty': `${s.ty}px`,
              animation: `firework-spark ${s.dur}s cubic-bezier(0.15, 0.7, 0.3, 1) ${s.delay}s both`,
            } as CSSVars
          }
        />
      ))}
    </div>
  )
}

/** A finite show of rockets and bursts. Every timer is cleaned up on unmount. */
export function Fireworks({ startAt = 1400, bursts = 7 }: { startAt?: number; bursts?: number }) {
  const [items, setItems] = useState<Burst[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timers: ReturnType<typeof setTimeout>[] = []

    const launch = () => {
      const id = nextId.current++
      setItems((prev) => [...prev, { id, x: rand(16, 84), y: rand(12, 40), color: pick(COLORS), size: rand(0.85, 1.35) }])
      timers.push(setTimeout(() => setItems((prev) => prev.filter((b) => b.id !== id)), LIFETIME_MS))
    }

    for (let i = 0; i < bursts; i++) timers.push(setTimeout(launch, startAt + i * 520 + rand(0, 220)))
    return () => timers.forEach(clearTimeout)
  }, [startAt, bursts])

  return (
    <div className="pointer-events-none absolute inset-0 z-[6]" aria-hidden>
      {items.map(({ id, ...burst }) => (
        <Firework key={id} {...burst} />
      ))}
    </div>
  )
}
