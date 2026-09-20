export const rand = (min: number, max: number) => Math.random() * (max - min) + min

export const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
