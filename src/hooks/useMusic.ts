import { useCallback, useEffect, useRef, useState } from 'react'

// 50% — warm enough to feel like part of the scene, quiet enough that
// reading the letter is never interrupted.
const TARGET_VOLUME = 0.5
const FADE_STEP = 0.03
const FADE_TICK_MS = 120

/**
 * Looping background music. Browsers block autoplay, so `begin()` must be
 * called from a user gesture (the tap on the envelope) to unlock the audio;
 * nothing is audible until `start()` fades the volume up.
 */
export function useMusic(src: string) {
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

  const fadeIn = useCallback((el: HTMLAudioElement) => {
    clearInterval(fade.current)
    fade.current = setInterval(() => {
      el.volume = Math.min(TARGET_VOLUME, el.volume + FADE_STEP)
      if (el.volume >= TARGET_VOLUME) clearInterval(fade.current)
    }, FADE_TICK_MS)
  }, [])

  // Called directly inside a user gesture (the envelope tap): starts playback
  // silently at volume 0, which satisfies strict autoplay policies (iOS
  // Safari). She won't hear anything until `start()` fades it in.
  const begin = useCallback(() => {
    const el = audio.current
    if (!el || !el.paused) return
    el.volume = 0
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [])

  // Fades the music up to the target volume, playing it first if needed.
  const start = useCallback(() => {
    const el = audio.current
    if (!el) return
    if (el.paused) {
      el.volume = 0
      el.play()
        .then(() => {
          setPlaying(true)
          fadeIn(el)
        })
        .catch(() => setPlaying(false))
    } else {
      fadeIn(el)
    }
  }, [fadeIn])

  // Pauses and resets the volume so the next `begin()`/`start()` starts silent.
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
    if (el.paused) start()
    else stop()
  }, [start, stop])

  return { playing, begin, start, stop, toggle }
}
