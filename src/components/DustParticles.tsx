import { useMemo } from 'react'
import { rand } from '../lib/random'
import type { CSSVars } from '../lib/css'

export function DustParticles({ count = 14 }: { count?: number }) {
  // Generated once: regenerating on every render made the dust jump around.
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        x: rand(8, 92),
        y: rand(10, 90),
        size: rand(2, 5),
        dur: rand(4, 9),
        delay: rand(0, 5),
        opacity: rand(0.2, 0.55),
      })),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle absolute rounded-full"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `rgba(201,166,107,${p.opacity})`,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
            } as CSSVars
          }
        />
      ))}
    </div>
  )
}
