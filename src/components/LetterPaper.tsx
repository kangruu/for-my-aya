import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import type { Block, Segment } from '../lib/rich'

interface Props {
  blocks: Block[] // this page's paragraphs (already paginated)
  plain: string // the page's plain text, exactly what the typewriter types
  leaving: boolean
  onTyped: (typed: boolean) => void
  onResize: (size: { width: number; height: number }) => void
}

const LINE = 26
const PARAGRAPH_GAP = 26
const WINE = '#6B2D3C'
const SOFT_INK = 'rgba(74, 52, 40, 0.78)'

function segStyle(seg: Segment): CSSProperties | undefined {
  if (!seg.bold && !seg.italic) return undefined
  const style: CSSProperties = {}
  if (seg.italic) {
    style.fontStyle = 'italic'
    style.color = SOFT_INK
  }
  if (seg.bold) {
    style.fontWeight = 700
    style.color = WINE
  }
  return style
}

/** One paragraph typed out across its styled segments; the untyped remainder stays in layout (invisible) so words never jump. */
function TypedParagraph({ block, typedCount, showCursor }: { block: Block; typedCount: number; showCursor: boolean }) {
  const nodes: ReactNode[] = []
  let pos = 0
  let cursorPlaced = false
  block.segments.forEach((seg, si) => {
    const start = pos
    const end = pos + seg.text.length
    pos = end
    const style = segStyle(seg)
    if (cursorPlaced) {
      nodes.push(
        <span key={si} style={{ ...style, visibility: 'hidden' }} aria-hidden="true">
          {seg.text}
        </span>,
      )
      return
    }
    const visibleLen = Math.min(Math.max(typedCount - start, 0), seg.text.length)
    if (showCursor && typedCount <= end) {
      cursorPlaced = true
      nodes.push(
        <span key={si} style={style}>
          {seg.text.slice(0, visibleLen)}
          <span
            aria-hidden="true"
            className="cursor-blink inline-block align-middle"
            style={{ width: 2, height: 18, background: WINE, borderRadius: 1 }}
          />
          {visibleLen < seg.text.length && (
            <span style={{ visibility: 'hidden' }} aria-hidden="true">
              {seg.text.slice(visibleLen)}
            </span>
          )}
        </span>,
      )
      return
    }
    nodes.push(
      <span key={si} style={style}>
        {seg.text.slice(0, visibleLen)}
        {visibleLen < seg.text.length && (
          <span style={{ visibility: 'hidden' }} aria-hidden="true">
            {seg.text.slice(visibleLen)}
          </span>
        )}
      </span>,
    )
  })
  return <>{nodes}</>
}

/** One page of the letter on its own paper: no scrolling, types itself out, tap to skip. */
export function LetterPaper({ blocks, plain, leaving, onTyped, onResize }: Props) {
  const { count, done, skip } = useTypewriter(plain)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onTyped(done)
  }, [done, onTyped])

  // Report the real paper size upward so pagination measures actual layout, not guesses.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const report = () => onResize({ width: el.clientWidth, height: el.clientHeight })
    report()
    const observer = new ResizeObserver(report)
    observer.observe(el)
    return () => observer.disconnect()
  }, [onResize])

  // Locate which paragraph the typing cursor currently sits in.
  const offsets: number[] = []
  let cursorParagraph = -1
  let cursorOffset = 0
  let running = 0
  for (let i = 0; i < blocks.length; i++) {
    offsets.push(running)
    if (cursorParagraph === -1 && !done && count < running + blocks[i].plain.length) {
      cursorParagraph = i
      cursorOffset = running
    }
    running += blocks[i].plain.length
  }
  if (!done && cursorParagraph === -1 && blocks.length > 0) {
    cursorParagraph = blocks.length - 1
    cursorOffset = offsets[cursorParagraph]
  }

  return (
    <div
      ref={rootRef}
      onClick={skip}
      className="relative"
      style={{
        width: 'calc(100% - 40px)',
        maxWidth: 350,
        flex: 1,
        minHeight: 0,
        marginBottom: 132,
        background: 'linear-gradient(180deg, #FAF3E6 0%, #F2E6D0 100%)',
        borderRadius: 4,
        border: '1px solid rgba(201,166,107,0.35)',
        boxShadow: '0 12px 38px rgba(74,52,40,0.2), 0 2px 8px rgba(74,52,40,0.1)',
        overflow: 'hidden', // nothing on the paper ever scrolls or spills
        animation: leaving
          ? 'paper-out 0.42s cubic-bezier(0.5, 0, 0.75, 0) both'
          : 'paper-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <div
        className="pointer-events-none absolute inset-2 rounded-sm"
        style={{ border: '1.5px solid rgba(201,166,107,0.22)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          padding: `${LINE}px 26px ${LINE}px 30px`,
          fontFamily: 'Caveat, cursive',
          fontSize: 19,
          lineHeight: `${LINE}px`,
          color: '#4A3428',
          overflow: 'hidden',
          // Ruled lines sit under each text row; paragraph gaps are exactly one line so they stay aligned.
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1}px, rgba(201,166,107,0.17) ${LINE - 1}px, rgba(201,166,107,0.17) ${LINE}px)`,
          backgroundPositionY: LINE,
        }}
      >
        {blocks.map((block, bi) => {
          const typedCount =
            done || bi < cursorParagraph
              ? block.plain.length
              : bi === cursorParagraph
                ? count - cursorOffset
                : 0
          return (
            <p key={bi} style={{ margin: bi < blocks.length - 1 ? `0 0 ${PARAGRAPH_GAP}px` : 0 }}>
              <TypedParagraph block={block} typedCount={typedCount} showCursor={bi === cursorParagraph} />
            </p>
          )
        })}
      </div>
    </div>
  )
}
