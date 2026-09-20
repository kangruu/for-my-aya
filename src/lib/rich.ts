export interface Segment {
  text: string
  bold?: boolean
  italic?: boolean
}

export interface Block {
  segments: Segment[]
  plain: string
}

/** Parses **bold** and *italic* markers into styled segments (the markers themselves are dropped). */
export function parseSegments(text: string): Segment[] {
  const segments: Segment[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index) })
    if (match[1] !== undefined) segments.push({ text: match[1], bold: true })
    else segments.push({ text: match[2] ?? '', italic: true })
    last = re.lastIndex
  }
  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments.filter((seg) => seg.text.length > 0)
}

/** Merges adjacent same-style segments and computes the plain text of the block. */
export function makeBlock(segments: Segment[]): Block {
  const merged: Segment[] = []
  for (const seg of segments) {
    const prev = merged[merged.length - 1]
    if (prev && !!prev.bold === !!seg.bold && !!prev.italic === !!seg.italic) prev.text += seg.text
    else merged.push({ ...seg })
  }
  const clean = merged.filter((seg) => seg.text.length > 0)
  return { segments: clean, plain: clean.map((seg) => seg.text).join('') }
}

export const toBlock = (text: string): Block => makeBlock(parseSegments(text))

/** Splits a block into word/space pieces (styles kept), used to break oversized paragraphs at word boundaries. */
export function splitBlockByWords(block: Block): Segment[] {
  const pieces: Segment[] = []
  for (const seg of block.segments) {
    for (const part of seg.text.split(/(\s+)/)) {
      if (part.length > 0) pieces.push({ text: part, bold: seg.bold, italic: seg.italic })
    }
  }
  return pieces
}
