import { useCallback, useEffect, useRef, useState } from 'react'

const TARGET_VOLUME = 0.55

/**
 * Looping background music. Browsers block autoplay, so `start()` must be
 * called from a user gesture (the first tap on the envelope).
 */
export function useMusic(src: string) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const fade = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = new Audio(src)
    el.loop = true
    audio.current = el
    return () => {
      clearInterval(fade.current)
      el.pause()
      audio.current = null
    }
  }, [src])

  const start = useCallback(async () => {
    const el = audio.current
    if (!el) return
    try {
      el.volume = 0
      await el.play()
      setPlaying(true)
      clearInterval(fade.current)
      fade.current = setInterval(() => {
        el.volume = Math.min(TARGET_VOLUME, el.volume + 0.03)
        if (el.volume >= TARGET_VOLUME) clearInterval(fade.current)
      }, 120)
    } catch {
      setPlaying(false) // file missing or blocked; the toggle just stays "off"
    }
  }, [])

  const toggle = useCallback(() => {
    const el = audio.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      void start()
    }
  }, [playing, start])

  return { playing, start, toggle }
}
