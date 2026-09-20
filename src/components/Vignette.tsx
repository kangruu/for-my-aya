export function Vignette({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: dark
          ? 'radial-gradient(ellipse at center, transparent 40%, rgba(20,6,12,0.75) 100%)'
          : 'radial-gradient(ellipse at center, transparent 45%, rgba(74,52,40,0.35) 100%)',
      }}
    />
  )
}
