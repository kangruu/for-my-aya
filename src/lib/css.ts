import type { CSSProperties } from 'react'

/** Lets inline styles carry CSS custom properties without casting. */
export type CSSVars = CSSProperties & { [key: `--${string}`]: string | number }
