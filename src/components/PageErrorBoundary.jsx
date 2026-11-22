import { Component } from 'react'
import { L } from '../lib/lang'

// Feilgrense rundt app-sidene som lastes ved behov (src/appPages.js). Feiler lastingen også etter at siden er
// lastet på nytt én gang (src/lib/lazyPage.js), f.eks. uten nett, vises en melding i stedet for en tom side.
export default class PageErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.error('Siden kunne ikke lastes:', error?.message) }
  componentDidUpdate(prev) { if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false }) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" style={{ maxWidth: '480px', margin: '64px auto', padding: '0 20px', fontFamily: 'Karla, sans-serif', color: '#F2EEE6', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontWeight: 400, fontSize: '1.5rem', marginBottom: '12px' }}>{L('Siden kunne ikke lastes', 'The page could not be loaded')}</h1>
        <p style={{ color: '#B9B4A8', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '20px' }}>
          {L('Sjekk nettforbindelsen og prøv igjen. Ingenting av det du har lagret, er borte.', 'Check your connection and try again. Nothing you have saved is lost.')}
        </p>
        <button onClick={() => window.location.reload()} style={{ background: '#F2EEE6', color: '#1F221E', border: 'none', borderRadius: '999px', padding: '12px 22px', fontFamily: 'Karla, sans-serif', fontSize: '0.9375rem', cursor: 'pointer' }}>
          {L('Last inn på nytt', 'Reload')}
        </button>
      </div>
    )
  }
}

// Vises mens en app-side lastes (vanligvis et øyeblikk; sidene forhåndslastes etter innlogging)
export function PageLoading() {
  return (
    <div role="status" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bodoni Moda', 'Times New Roman', serif", color: '#B9B4A8', fontSize: '1.25rem' }}>
      Arvklart<span className="sr-only">{L(' – laster siden', ' – loading the page')}</span>
    </div>
  )
}
