interface Props {
  playing: boolean
  onToggle: () => void
}

export function MusicToggle({ playing, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Mute music' : 'Play music'}
      aria-pressed={playing}
      className="absolute right-4 top-4 z-40 grid place-items-center rounded-full transition-transform active:scale-90"
      style={{
        width: 38,
        height: 38,
        background: 'rgba(245,235,221,0.88)',
        border: '1.5px solid rgba(201,166,107,0.5)',
        boxShadow: '0 2px 10px rgba(74,52,40,0.25)',
        color: '#8C6A32',
        backdropFilter: 'blur(6px)',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        {playing ? (
          <>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <>
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        )}
      </svg>
    </button>
  )
}
