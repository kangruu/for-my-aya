import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/random'

/** Human-ish pacing: linger on punctuation and line breaks. */
function delayFor(char: string) {
  if (char === '\n') return 150
  if ('.!?—'.includes(char)) return 170
  if (',;:'.includes(char)) return 85
  return 19
}

export function useTypewriter(text: string, startDelay = 450) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0))
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(text.length)
      return
    }
    let index = 0
    setCount(0)
    const tick = () => {
      index += 1
      setCount(index)
      if (index < text.length) timer.current = setTimeout(tick, delayFor(text[index - 1]))
    }
    timer.current = setTimeout(tick, startDelay)
    return () => clearTimeout(timer.current)
  }, [text, startDelay])

  const skip = useCallback(() => {
    clearTimeout(timer.current)
    setCount(text.length)
  }, [text])

  return {
    count, // how many characters of the page's plain text are typed so far
    done: count >= text.length,
    skip,
  }
}
