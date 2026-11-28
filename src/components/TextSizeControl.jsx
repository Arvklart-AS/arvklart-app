import { useState } from 'react'
import { L } from '../lib/lang'
import { getTextSize, setTextSize } from '../lib/textSize'

// app: appens lyse arbeidsflater og kontomenyen. light: de lyse sidene for utloggede (innloggingen)
const TONES = {
  app: { label: '#4F463A', on: '#24392A', onText: '#F4F2EB', onBorder: '#2F573E', off: '#FCFCF9', offText: '#2A1D14', offBorder: 'rgba(42, 29, 20, 0.5)' },
  light: { label: '#4F463A', on: '#24392A', onText: '#F4F2EB', onBorder: '#24392A', off: '#fff', offText: '#2A1D14', offBorder: '#4F463A' },
}

// Valg av tekststørrelse (Normal / Stor / Ekstra stor). Samme design for alle, bare større tekst.
// light: lyse farger, på sidene for utloggede (innloggingen)
export default function TextSizeControl({ compact = false, light = false }) {
  const t = light ? TONES.light : TONES.app
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
