import { useEffect, useMemo, useRef, useState } from 'react'
import { PaperGrain } from '../components/PaperGrain'
import { Vignette } from '../components/Vignette'
import { DustParticles } from '../components/DustParticles'
import { WaxSeal } from '../components/WaxSeal'
import { LilySvg } from '../components/Lily'
import { rand } from '../lib/random'
import type { CSSVars } from '../lib/css'

// Envelope geometry (px). APEX is where the flap tip and the pocket "V" meet.
const W = 264
const H = 178
const APEX = 96

type Stage = 'idle' | 'breaking' | 'opening' | 'rising'

// When each stage begins after the tap (ms), then hand off to the letter.
const TIMELINE: ReadonlyArray<readonly [Stage, number]> = [
  ['breaking', 0],
  ['opening', 450],
  ['rising', 1350],
]
const HANDOFF_MS = 2700

const FLAP_CLIP = 'polygon(0 0, 100% 0, 50% 100%)'
const face = (background: string): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  clipPath: FLAP_CLIP,
  background,
  backfaceVisibility: 'hidden',
})

interface Props {
  onStart: () => void // called synchronously on tap (needed to unlock audio)
  onOpened: () => void
}

export function EnvelopeScene({ onStart, onOpened }: Props) {
  const [stage, setStage] = useState<Stage>('idle')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const sparks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + rand(-0.2, 0.2)
        const d = rand(28, 60)
        return { i, tx: Math.cos(a) * d, ty: Math.sin(a) * d, size: rand(2, 4.5) }
      }),
    [],
  )

  function open() {
    if (stage !== 'idle') return
    onStart()
    TIMELINE.forEach(([s, t]) => timers.current.push(setTimeout(() => setStage(s), t)))
    timers.current.push(setTimeout(onOpened, HANDOFF_MS))
  }

  const broken = stage !== 'idle'
  const flapOpen = stage === 'opening' || stage === 'rising'
  const letterUp = stage === 'rising'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open the envelope"
      onClick={open}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
      className="relative flex h-full w-full cursor-pointer select-none flex-col items-center justify-center overflow-hidden outline-none"
      style={{ background: '#F5EBDD' }}
    >
      <PaperGrain />
      <Vignette />
      <DustParticles />

      <p
        style={{
          marginBottom: 40,
          fontFamily: 'Caveat, cursive',
          fontSize: 24,
          color: '#B08A4A',
          transform: 'rotate(-2deg)',
          opacity: broken ? 0 : 0.9,
          transition: 'opacity 0.4s ease',
        }}
      >
        For you
      </p>

      {/* Bobbing wrapper (idle motion) around the tilting envelope */}
      <div style={{ animation: 'envelope-bob 5s ease-in-out infinite' }}>
        <div
          style={{
            position: 'relative',
            width: W,
            height: H,
            transform: broken ? 'rotate(0deg) scale(1.03)' : 'rotate(-2.5deg)',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.3, 0.64, 1)',
          }}
        >
          {/* ground shadow */}
          <div
            style={{
              position: 'absolute',
              left: '6%',
              right: '6%',
              bottom: -22,
              height: 26,
              background: 'radial-gradient(ellipse at center, rgba(74,52,40,0.3), transparent 70%)',
              filter: 'blur(5px)',
            }}
          />

          {/* 1 · inside of the envelope */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              borderRadius: 3,
              background: 'linear-gradient(170deg, #D9C39A, #CDB588)',
              border: '1px solid rgba(201,166,107,0.45)',
              boxShadow: '0 10px 34px rgba(74,52,40,0.25), 0 2px 8px rgba(74,52,40,0.15)',
            }}
          />

          {/* 2 · the letter (clipped at the envelope's bottom so it never pokes out) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              clipPath: 'inset(-340px -40px 0 -40px)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 14,
                right: 14,
                top: 22,
                height: 232,
                borderRadius: 2,
                background: 'linear-gradient(180deg, #FCF6EA, #F3E7D0)',
                border: '1px solid rgba(201,166,107,0.4)',
                boxShadow: '0 2px 10px rgba(74,52,40,0.18)',
                transform: letterUp ? 'translateY(-132px) rotate(-0.6deg)' : 'translateY(0)',
                transition: 'transform 1.05s cubic-bezier(0.3, 0.9, 0.3, 1)',
              }}
            >
              {[34, 60, 86].map((top) => (
                <div
                  key={top}
                  style={{ position: 'absolute', left: 18, right: 18, top, height: 1, background: 'rgba(201,166,107,0.28)' }}
                />
              ))}
            </div>
          </div>

          {/* 3 · front pocket */}
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ position: 'absolute', inset: 0, zIndex: 3 }}
            aria-hidden
          >
            <defs>
              <linearGradient id="env-side" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#EBDDBB" />
                <stop offset="1" stopColor="#DCC8A0" />
              </linearGradient>
              <linearGradient id="env-bottom" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#F1E5C9" />
                <stop offset="1" stopColor="#E4D1A9" />
              </linearGradient>
            </defs>
            <g stroke="rgba(176,138,74,0.38)" strokeWidth="0.9" strokeLinejoin="round">
              <path d={`M0 0 L${W / 2} ${APEX} L0 ${H} Z`} fill="url(#env-side)" />
              <path d={`M${W} 0 L${W / 2} ${APEX} L${W} ${H} Z`} fill="url(#env-side)" />
              <path d={`M0 ${H} L${W / 2} ${APEX} L${W} ${H} Z`} fill="url(#env-bottom)" />
            </g>
          </svg>

          {/* 4 · top flap: swings up and away around its hinge */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: W,
              height: APEX,
              zIndex: flapOpen ? 1 : 4,
              transformOrigin: '50% 0%',
              transformStyle: 'preserve-3d',
              transform: `perspective(900px) rotateX(${flapOpen ? -180 : 0}deg)`,
              // z-index flips halfway through the swing, once the flap is edge-on
              transition: 'transform 0.95s cubic-bezier(0.5, 0, 0.2, 1), z-index 0s linear 0.45s',
              filter: 'drop-shadow(0 3px 4px rgba(74,52,40,0.22))',
            }}
          >
            <div style={face('linear-gradient(170deg, #EFE2C4, #E3CFA6)')} />
            <div style={{ ...face('linear-gradient(170deg, #D4BD91, #C9B080)'), transform: 'rotateY(180deg)' }} />
          </div>

          {/* 5 · wax seal, cracks on tap */}
          <div
            style={{
              position: 'absolute',
              left: W / 2 - 28,
              top: APEX - 30,
              zIndex: 6,
              animation: broken ? 'seal-break 0.55s cubic-bezier(0.3, 1.4, 0.5, 1) forwards' : undefined,
            }}
          >
            <WaxSeal size={56} className={broken ? undefined : 'seal-pulse'}>
              <LilySvg size={30} />
            </WaxSeal>
          </div>

          {/* gold flecks when the seal breaks */}
          {broken &&
            sparks.map((s) => (
              <span
                key={s.i}
                aria-hidden
                style={
                  {
                    position: 'absolute',
                    left: W / 2,
                    top: APEX - 2,
                    zIndex: 7,
                    width: s.size,
                    height: s.size,
                    borderRadius: '50%',
                    background: '#D9B978',
                    boxShadow: '0 0 6px rgba(217,185,120,0.9)',
                    '--tx': `${s.tx}px`,
                    '--ty': `${s.ty}px`,
                    animation: 'firework-spark 0.75s ease-out both',
                  } as CSSVars
                }
              />
            ))}
        </div>
      </div>

      <p
        style={{
          marginTop: 44,
          fontFamily: 'Caveat, cursive',
          fontSize: 18,
          letterSpacing: '0.05em',
          color: '#4A3428',
          opacity: broken ? 0 : undefined,
          transition: 'opacity 0.3s ease',
          animation: broken ? undefined : 'hint-pulse 2.6s ease-in-out infinite',
        }}
      >
        tap to open
      </p>
    </div>
  )
}
