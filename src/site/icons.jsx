// Ikonene fra integrasjonspakken, ordrett. Alle er aria-hidden: teksten ved siden av bærer meningen.

export const Arrow = () => (
  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ArrowSm = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
    <path d="M1 5.5h12M9 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Check = () => (
  <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true">
    <circle cx="9.5" cy="9.5" r="8.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="m5.6 9.8 2.7 2.7 5.1-5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Lenken er inline, og pilen ligger inne i tekstspennet bundet til siste ord med et hardt
// mellomrom. Da kan den aldri havne alene på en ny linje.
export function ArrowLink({ href, children, last, small = false }) {
  return (
    <a className="arrowlink" href={href}>
      <span>{children}<span className="arrowlink__end">{' '}{last}{' '}{small ? <ArrowSm /> : <Arrow />}</span></span>
    </a>
  )
}
