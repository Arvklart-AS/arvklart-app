import { useEffect, useState } from 'react'

// Sant først når React har tatt over i nettleseren. Brukes til å legge på klassen «ak-js», slik at
// CSS kan skru på det som bare gir mening med JavaScript (ordskiftet i overskriften, «Neste steg»,
// den faste demoknappen på mobil). HTML-en fra forhåndsrenderingen (src/seo/vitePlugin.js) er derfor
// den ferdige versjonen uten JavaScript, og hydreringen legger bare til – den fjerner ingen noder.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])
  return hydrated
}

// Respekterer «reduser bevegelse» i operativsystemet. Følger med hvis brukeren endrer innstillingen.
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduce
}
