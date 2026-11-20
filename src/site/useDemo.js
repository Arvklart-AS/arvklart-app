import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startDemoSession } from '../lib/demo'
import { L } from '../lib/lang'
import { APP_HOME, HOME } from '../lib/routes'

// Demoinngangen på de offentlige sidene. Det er den samme flyten som før: edge-funksjonen demo-login
// nullstiller demo-boet og gir en økt, og App sender demobrukeren rett inn i demo-boet. Ingen ny demo.
//
// Knappen er en lenke til «/#demo» (demoseksjonen på forsiden), så den virker også uten JavaScript.
// Med JavaScript stopper vi navigeringen og åpner demoen med én gang. Elementtypen er den samme før
// og etter hydrering, så forhåndsrendret HTML og appen har nøyaktig samme DOM.
//
// Demoen og appen er på engelsk når brukeren har valgt engelsk; demo-boets eget innhold
// (gjenstander og begrunnelser) er norsk, slik det står i databasen.
export default function useDemo({ loggedIn = false } = {}) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onClick = async (e) => {
    e.preventDefault()
    if (loggedIn) { navigate(APP_HOME); return }
    if (busy) return
    setBusy(true)
    setError('')
    const { error: err } = await startDemoSession()
    if (err) {
      console.error('Demo login error:', err.message)
      setBusy(false)
      setError(L('Demoen er ikke tilgjengelig akkurat nå. Prøv igjen om litt.', 'The demo is not available right now. Please try again shortly.'))
      return
    }
    navigate(APP_HOME)
  }

  const label = (idle) => {
    if (busy) return L('Åpner demo …', 'Opening the demo …')
    if (loggedIn) return L('Gå til mine bo', 'Go to my estates')
    return idle || L('Prøv demo', 'Try the demo')
  }

  return { busy, error, onClick, label, href: loggedIn ? APP_HOME : `${HOME}#demo` }
}
