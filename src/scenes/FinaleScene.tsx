import { useMemo } from 'react'
import { Vignette } from '../components/Vignette'
import { Fireworks } from '../components/Fireworks'
import { FallingPetals } from '../components/FallingPetals'
import { LilySeal } from '../components/LilySeal'
import { FINALE } from '../content'
import { rand } from '../lib/random'
import type { CSSVars } from '../lib/css'

const delay = (s: number): CSSVars => ({ '--d': `${s}s` })

/**
 * Timeline (seconds): dedication 0.3–2.4 → headline 3.1 → fireworks 3.4–7 →
 * petals from 5 → explanation 6.6 → link button 7.2. Pure CSS delays, so re-renders never restart it.
 */
export function FinaleScene({ onReplay }: { onReplay: () => void }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 34 }, (_, id) => ({
        id,
        x: rand(0, 100),
        y: rand(0, 70),
        size: rand(1.5, 3.4),
        dur: rand(2, 5),
        delay: rand(0, 4),
      })),
    [],
  )

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8 text-center"
      style={{ background: 'linear-gradient(175deg, #2A0E18 0%, #4A1528 35%, #6B2D3C 65%, #8B3D52 85%, #A05070 100%)' }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {stars.map((s) => (
          <span
            key={s.id}
            className="star absolute rounded-full"
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                background: 'rgba(245,235,221,0.8)',
                '--dur': `${s.dur}s`,
                '--delay': `${s.delay}s`,
              } as CSSVars
            }
          />
        ))}
      </div>
      <Vignette dark />
      <Fireworks startAt={3400} bursts={7} />
      <FallingPetals startDelay={5} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex flex-col items-center" style={{ gap: 7, marginBottom: 20, maxWidth: 310 }}>
          {FINALE.intro.map((line, i) => {
            const last = i === FINALE.intro.length - 1
            return (
              <p
                key={line}
                className="reveal"
                style={{ ...delay(0.3 + i * 0.7), fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic', fontSize: last ? 21 : 18, lineHeight: 1.35, color: last ? '#F5EBDD' : 'rgba(232,206,150,0.92)' }}
              >
                {line}
              </p>
            )
          })}
        </div>
        <h2
          className="reveal"
          style={{ ...delay(3.1), fontFamily: 'Caveat, cursive', fontSize: 36, fontWeight: 600, lineHeight: 1.2, color: '#F5EBDD', textShadow: '0 2px 24px rgba(107,45,60,0.6), 0 0 60px rgba(201,166,107,0.22)' }}
        >
          {FINALE.headline.map((line) => (
            <span key={line} style={{ display: 'block' }}>
              {line}
            </span>
          ))}
        </h2>
        <p
          className="reveal"
          style={{ ...delay(3.9), marginTop: 10, fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic', fontSize: 19, color: 'rgba(232,190,190,0.9)', letterSpacing: '0.04em' }}
        >
          {FINALE.signoff}
        </p>
        <div
          aria-hidden
          style={{ margin: '18px 0', width: 84, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,166,107,0.75), transparent)' }}
        />
        <p
          className="reveal"
          style={{ ...delay(6.6), maxWidth: 270, marginBottom: 22, fontFamily: 'Caveat, cursive', fontSize: 22, lineHeight: 1.3, color: 'rgba(245,235,221,0.92)' }}
        >
          {FINALE.note}
        </p>
        <div className="reveal" style={delay(7.2)}>
          <LilySeal href={FINALE.linkUrl} label={FINALE.linkLabel} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
        <button type="button" className="btn-ghost reveal" style={delay(9)} onClick={onReplay}>
          ↺ replay
        </button>
      </div>
    </div>
  )
}
