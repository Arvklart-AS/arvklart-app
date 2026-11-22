import { useState } from 'react'
import { L } from '../lib/lang'
import { getTextSize, setTextSize } from '../lib/textSize'

// Fargene i den mørke appen, og på de lyse sidene for utloggede (innloggingen)
const TONES = {
  dark: { label: '#B9B4A8', on: '#F2EEE6', onText: '#1F221E', onBorder: '#9DAA8C', off: '#272A25', offText: '#F2EEE6', offBorder: 'rgba(242, 238, 230, 0.4)' },
  light: { label: '#575B5E', on: '#2F4A43', onText: '#F5F2EB', onBorder: '#2F4A43', off: '#fff', offText: '#1F2326', offBorder: '#575B5E' },
}

// Valg av tekststørrelse (Normal / Stor / Ekstra stor). Samme design for alle, bare større tekst.
// light: lyse farger, på sidene for utloggede (innloggingen)
export default function TextSizeControl({ compact = false, light = false }) {
  const t = light ? TONES.light : TONES.dark
  const [size, setSize] = useState(getTextSize)
  const choose = (key) => { setTextSize(key); setSize(key) }
  const options = [
    { key: 'normal', label: L('Normal', 'Normal'), fs: '0.875rem' },
    { key: 'large', label: L('Stor', 'Large'), fs: '1rem' },
    { key: 'xlarge', label: L('Ekstra stor', 'Extra large'), fs: '1.125rem' },
  ]
  return (
    <div role="group" aria-labelledby="text-size-label" style={{ padding: compact ? '10px 16px' : 0 }}>
      <div id="text-size-label" style={{ fontSize: '0.8125rem', color: t.label, marginBottom: '6px' }}>{L('Tekststørrelse', 'Text size')}</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {options.map(o => (
          <button key={o.key} type="button" onClick={() => choose(o.key)} aria-pressed={size === o.key} style={{
            flex: '1 1 auto', minHeight: '44px', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'Karla, sans-serif', fontSize: o.fs, fontWeight: size === o.key ? '600' : '400',
            border: `2px solid ${size === o.key ? t.onBorder : t.offBorder}`,
            background: size === o.key ? t.on : t.off, color: size === o.key ? t.onText : t.offText,
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
