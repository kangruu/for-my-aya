import { useCallback, useEffect, useRef, useState } from 'react'
import { PaperGrain } from '../components/PaperGrain'
import { Vignette } from '../components/Vignette'
import { LetterPaper } from '../components/LetterPaper'
import { usePagination, type PageSize } from '../hooks/usePagination'
import { LETTER } from '../content'

interface Props {
  onFinish: () => void
}

const SWAP_MS = 420

export function LetterScene({ onFinish }: Props) {
  const measurerRef = useRef<HTMLDivElement>(null)
  const [paperSize, setPaperSize] = useState<PageSize | null>(null)
  const pages = usePagination(LETTER, paperSize, measurerRef)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleResize = useCallback((size: PageSize) => {
    setPaperSize((prev) => (prev && prev.width === size.width && prev.height === size.height ? prev : size))
  }, [])
  const handleTyped = useCallback((value: boolean) => setTyped(value), [])

  const pageCount = pages?.length ?? 0
  // Only trust "typed" once real page content is on the paper.
  const isTyped = typed && pageCount > 0
  const isLast = pageCount > 0 && index === pageCount - 1

  // Pagination can change the page count (resize/rotation): keep the index valid.
  useEffect(() => {
    if (pageCount > 0) setIndex((i) => Math.min(i, pageCount - 1))
  }, [pageCount])

  function swapTo(apply: () => void) {
    if (leaving) return
    setLeaving(true)
    timer.current = setTimeout(() => {
      apply()
      setTyped(false)
      setLeaving(false)
    }, SWAP_MS)
  }

  // Next/previous work even while a page is still typing — no waiting.
  function goNext() {
    if (leaving || pageCount === 0) return
    if (isLast) {
      if (!isTyped) return // the surprise unlocks only after the last page finishes typing
      return onFinish()
    }
    swapTo(() => setIndex((i) => Math.min(i + 1, pageCount - 1)))
  }

  function goBack() {
    if (leaving || pageCount === 0) return
    swapTo(() => setIndex((i) => Math.max(i - 1, 0)))
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ background: '#F5EBDD', paddingTop: 64 }}
    >
      <PaperGrain />
      <Vignette />

      <LetterPaper
        key={index}
        blocks={pages?.[index] ?? []}
        plain={pages?.[index]?.map((b) => b.plain).join('') ?? ''}
        leaving={leaving}
        onTyped={handleTyped}
        onResize={handleResize}
      />

      {/* Hidden measuring clone of the paper's text container; usePagination measures against it. */}
      <div
        ref={measurerRef}
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: -9999,
          top: 0,
          visibility: 'hidden',
          fontFamily: 'Caveat, cursive',
          fontSize: 19,
          lineHeight: '26px',
          color: '#4A3428',
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-4"
        style={{ height: 132 }}
      >
        {pageCount > 0 && (
          <div
            className="select-none"
            style={{
              fontFamily: 'Caveat, cursive',
              fontStyle: 'italic',
              fontSize: 15,
              lineHeight: '20px',
              color: 'rgba(107,45,60,0.75)',
              letterSpacing: '0.04em',
            }}
          >
            page {index + 1} of {pageCount}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {index > 0 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={goBack}
              disabled={leaving}
              style={{
                color: '#6B2D3C',
                background: 'rgba(107,45,60,0.08)',
                borderColor: 'rgba(107,45,60,0.35)',
                opacity: leaving ? 0.4 : 1,
              }}
            >
              previous page
            </button>
          )}

          {!isLast && (
            <button type="button" className="btn-wine" onClick={goNext} disabled={leaving} style={{ opacity: leaving ? 0.4 : 1 }}>
              next page
            </button>
          )}

          {isLast && (
            <button
              type="button"
              className="btn-wine"
              onClick={goNext}
              disabled={!isTyped}
              tabIndex={isTyped ? 0 : -1}
              style={{
                opacity: isTyped && !leaving ? 1 : 0,
                transform: isTyped && !leaving ? 'translateY(0)' : 'translateY(10px)',
                pointerEvents: isTyped && !leaving ? 'auto' : 'none',
              }}
            >
              open the surprise ✦
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
