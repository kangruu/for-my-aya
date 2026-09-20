import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EnvelopeScene } from './scenes/EnvelopeScene'
import { LetterScene } from './scenes/LetterScene'
import { FinaleScene } from './scenes/FinaleScene'
import { MusicToggle } from './components/MusicToggle'
import { useMusic } from './hooks/useMusic'
import { MUSIC_SRC } from './content'

type Scene = 'envelope' | 'letter' | 'finale'

const FADE_MS = 700

/** Full-bleed layer that cross-fades and stops painting once hidden. */
function Layer({ show, z, children }: { show: boolean; z: number; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: z,
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
        pointerEvents: show ? 'auto' : 'none',
        transition: `opacity ${FADE_MS}ms ease, visibility 0s linear ${show ? 0 : FADE_MS}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function App() {
  const [scene, setScene] = useState<Scene>('envelope')
  const [run, setRun] = useState(0) // bumping this remounts everything for "replay"
  const [curtain, setCurtain] = useState(false)
  const music = useMusic(MUSIC_SRC)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Music: silently unlocked by the envelope tap, then faded in once she is
  // at the letter. Returning to the envelope (replay) pauses it again; the
  // finale keeps whatever is playing.
  useEffect(() => {
    if (scene === 'letter') music.start()
    else if (scene === 'envelope') music.stop()
  }, [scene, music.start, music.stop])

  function replay() {
    setCurtain(true)
    timers.current.push(
      setTimeout(() => {
        setRun((r) => r + 1)
        setScene('envelope')
      }, 600),
      setTimeout(() => setCurtain(false), 700),
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#1A0E0A' }}>
      {/* Full screen on phones; a phone-sized frame on desktop. */}
      <main
        className="relative h-full w-full overflow-hidden sm:h-[min(100dvh-32px,860px)] sm:max-w-[410px] sm:rounded-[22px]"
        style={{ background: '#F5EBDD', boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)' }}
      >
        <Layer show={scene === 'envelope'} z={1}>
          <EnvelopeScene key={run} onStart={() => music.begin()} onOpened={() => setScene('letter')} />
        </Layer>

        {scene !== 'envelope' && (
          <Layer show={scene === 'letter'} z={2}>
            <LetterScene key={run} onFinish={() => setScene('finale')} />
          </Layer>
        )}

        {scene === 'finale' && (
          <Layer show z={3}>
            <FinaleScene key={run} onReplay={replay} />
          </Layer>
        )}

        {scene !== 'envelope' && <MusicToggle playing={music.playing} onToggle={music.toggle} />}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 50, background: '#1A0E0A', opacity: curtain ? 1 : 0, transition: 'opacity 0.55s ease' }}
        />
      </main>
    </div>
  )
}
