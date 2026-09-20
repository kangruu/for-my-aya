import { useEffect, useState, type RefObject } from 'react'
import { makeBlock, splitBlockByWords, toBlock, type Block } from '../lib/rich'

const LINE = 26
const PARAGRAPH_GAP = 26
// Must match the paper's text container padding exactly.
const PADDING = `${LINE}px 26px ${LINE}px 30px`

export interface PageSize {
  width: number
  height: number
}

/** Renders the block's segments as styled spans inside the given element. */
function fillStyled(parent: HTMLElement, block: Block) {
  for (const seg of block.segments) {
    const span = document.createElement('span')
    span.textContent = seg.text
    if (seg.bold) span.style.fontWeight = '700'
    if (seg.italic) span.style.fontStyle = 'italic'
    parent.appendChild(span)
  }
}

/** Total height the blocks would occupy inside the measurer. */
function measure(measurer: HTMLElement, blocks: Block[]): number {
  measurer.textContent = ''
  blocks.forEach((block, i) => {
    const p = document.createElement('div')
    p.style.margin = i === blocks.length - 1 ? '0' : `0 0 ${PARAGRAPH_GAP}px`
    fillStyled(p, block)
    measurer.appendChild(p)
  })
  return measurer.offsetHeight
}

/** Splits a single paragraph that is taller than a whole page into page-sized chunks at word boundaries. */
function splitTallParagraph(block: Block, measurer: HTMLElement, height: number): Block[] {
  const pieces = splitBlockByWords(block)
  const chunks: Block[] = []
  let start = 0
  let end = 1 // one-based end of the window being measured
  while (end <= pieces.length) {
    if (end < pieces.length && measure(measurer, [makeBlock(pieces.slice(start, end))]) <= height) {
      end += 1
      continue
    }
    const isLast = end > pieces.length
    const segs = pieces.slice(start, isLast ? pieces.length : end - 1)
    if (segs.length > 0) chunks.push(makeBlock(segs))
    if (isLast) break
    start = end - 1
    if (start >= pieces.length) break
    end = start + 1
    if (measure(measurer, [makeBlock(pieces.slice(start, end))]) > height) {
      // A single piece (an enormous word) cannot fit either — place it alone and move on.
      chunks.push(makeBlock(pieces.slice(start, start + 1)))
      start += 1
      end = start + 1
    }
  }
  return chunks.length > 0 ? chunks : [block]
}

function paginate(letter: string, measurer: HTMLElement, width: number, height: number): Block[][] {
  measurer.style.width = `${width}px`
  measurer.style.padding = PADDING
  const fits = (blocks: Block[]) => measure(measurer, blocks) <= height

  const paragraphs = letter
    .split(/\n\s*\n/)
    .map((para) => para.replace(/\n/g, ' ').trim())
    .filter((para) => para.length > 0)
    .map(toBlock)

  const pages: Block[][] = []
  let current: Block[] = []
  for (const para of paragraphs) {
    current.push(para)
    if (fits(current)) continue
    current.pop()
    if (current.length > 0) {
      pages.push(current)
      current = []
    }
    // The paragraph starts a fresh page; if it still overflows, break it at word boundaries.
    if (fits([para])) {
      current = [para]
      continue
    }
    const chunks = splitTallParagraph(para, measurer, height)
    for (let c = 0; c < chunks.length - 1; c++) pages.push([chunks[c]])
    current = [chunks[chunks.length - 1]]
  }
  if (current.length > 0) pages.push(current)
  measurer.textContent = ''
  return pages
}

/**
 * Splits the letter into pages against the real paper size. Uses a hidden measurer
 * (styled identically to the paper's text container), re-runs once fonts are loaded
 * (so Caveat is measured correctly) and again on resize/orientation change.
 */
export function usePagination(
  letter: string,
  size: PageSize | null,
  measurerRef: RefObject<HTMLDivElement | null>,
): Block[][] | null {
  const [fontsReady, setFontsReady] = useState(false)
  const [tick, setTick] = useState(0)
  const [pages, setPages] = useState<Block[][] | null>(null)

  // Load every face the letter can render with before measuring anything.
  useEffect(() => {
    let cancelled = false
    const faces = ['400 19px Caveat', '600 19px Caveat', '700 19px Caveat', 'italic 19px Caveat', 'italic 700 19px Caveat']
    Promise.all(faces.map((face) => document.fonts.load(face).catch(() => undefined)))
      .then(() => document.fonts.ready)
      .then(() => {
        if (!cancelled) setFontsReady(true)
      })
      .catch(() => {
        if (!cancelled) setFontsReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Re-paginate when the window resizes or the device rotates.
  useEffect(() => {
    const onChange = () => setTick((t) => t + 1)
    window.addEventListener('resize', onChange)
    window.addEventListener('orientationchange', onChange)
    return () => {
      window.removeEventListener('resize', onChange)
      window.removeEventListener('orientationchange', onChange)
    }
  }, [])

  useEffect(() => {
    const measurer = measurerRef.current
    if (!measurer || !size || size.width < 120 || size.height < 80) {
      setPages(null)
      return
    }
    setPages(paginate(letter, measurer, size.width, size.height))
  }, [letter, size, fontsReady, tick, measurerRef])

  return pages
}
