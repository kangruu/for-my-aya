import { useCallback, useEffect, useRef, useState } from 'react'
import { assetUrl } from '../lib/asset'

// 50% — warm enough to feel like part of the scene, quiet enough that
// reading the letter is never interrupted.
const TARGET_VOLUME = 0.5
const FADE_STEP = 0.03
const FADE_TICK_MS = 120

/**
 * Looping background music. Browsers block autoplay, so `start()` must be
 * called from a user gesture (the tap on the envelope) — it then plays the
 * song from its very beginning, fading up to the target volume right away.
 */
export function useMusic(rawSrc: string) {
  // Root-relative public paths need the deploy base prepended when the app
  // isn't served from the domain root (e.g. GitHub Pages /for-my-aya/).
  const src = assetUrl(rawSrc)
  const audio = useRef<HTMLAudioElement | null>(null)
  const fade = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = new Audio(src)
    el.loop = true
    el.preload = 'auto'
    // Attach it to the document (hidden) — not required for playback, but it
    // keeps the element stable across browsers and makes it inspectable.
    el.style.display = 'none'
    document.body.appendChild(el)
    audio.current = el
    return () => {
      clearInterval(fade.current)
      el.pause()
      el.remove()
      audio.current = null
    }
  }, [src])

  // Called directly inside a user gesture (the envelope tap): restarts the
  // song from the top and fades it in immediately.
  const start = useCallback(() => {
    const el = audio.current
    if (!el) return
    clearInterval(fade.current)
    el.currentTime = 0
    el.volume = 0
    el.play()
      .then(() => {
        setPlaying(true)
        fade.current = setInterval(() => {
          el.volume = Math.min(TARGET_VOLUME, el.volume + FADE_STEP)
          if (el.volume >= TARGET_VOLUME) clearInterval(fade.current)
        }, FADE_TICK_MS)
      })
      .catch(() => setPlaying(false))
  }, [])

  // Pauses and resets the volume so the next `start()` begins fresh.
  const stop = useCallback(() => {
    const el = audio.current
    if (!el) return
    clearInterval(fade.current)
    el.pause()
    el.volume = 0
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el) return
    if (el.paused) {
      // Manual start mid-song keeps the current position; volume picks up
      // from 0 with the same fade.
      el.volume = 0
      el.play()
        .then(() => {
          setPlaying(true)
          fade.current = setInterval(() => {
            el.volume = Math.min(TARGET_VOLUME, el.volume + FADE_STEP)
            if (el.volume >= TARGET_VOLUME) clearInterval(fade.current)
          }, FADE_TICK_MS)
        })
        .catch(() => setPlaying(false))
    } else {
      stop()
    }
  }, [stop])

  return { playing, start, stop, toggle }
}
