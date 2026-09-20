import { WaxSeal } from './WaxSeal'
import { LilyImage } from './Lily'

interface Props {
  href: string
  label: string
}

/** The link button: a wax seal with a lily, echoing the envelope that opened the letter. */
export function LilySeal({ href, label }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="lily-seal flex flex-col items-center"
      style={{ gap: 12, textDecoration: 'none' }}
    >
      <span className="relative grid place-items-center" style={{ width: 88, height: 88 }}>
        <span className="ripple" />
        <span className="ripple" style={{ animationDelay: '1.2s' }} />
        <WaxSeal size={78} className="lily-seal-disc seal-pulse">
          <LilyImage size={48} />
        </WaxSeal>
      </span>
      <span style={{ fontFamily: 'Caveat, cursive', fontSize: 22, letterSpacing: '0.03em', color: '#F5EBDD' }}>
        {label}
      </span>
    </a>
  )
}
