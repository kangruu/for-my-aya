export function PaperGrain() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045] mix-blend-multiply"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
  )
}
