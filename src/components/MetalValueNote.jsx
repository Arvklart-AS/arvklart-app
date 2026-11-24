import { L } from '../lib/lang'
import { formatNOK, formatDateOnly } from '../lib/format'
import { metalValue } from '../lib/metalValue'
import { C } from '../lib/estateTheme'

// Metallverdien som gulv, når familien har oppgitt finhet og vekt (src/lib/metalValue.js). Vises der «Er det ekte
// sølv?» sto. Lenken til MetalCharts er et vilkår for gratisnivået av API-et prisen kommer fra, og skal stå ved tallet.
export default function MetalValueNote({ record, idPrefix = 'metal-value' }) {
  const mv = metalValue(record)
  if (!mv) return null
  const metal = mv.kind === 'gold' ? L(`${mv.fineness}-gull`, `${mv.fineness} gold`) : L(`${mv.fineness}-sølv`, `${mv.fineness} silver`)
  const grams = String(mv.grams).replace('.', L(',', '.'))
  const date = formatDateOnly(mv.date, { day: 'numeric', month: 'long', year: 'numeric' })
  const small = { margin: 0, fontSize: '0.8125rem', color: C.linDempet, lineHeight: 1.6 }

  return (
    <section aria-labelledby={`${idPrefix}-title`} style={{ background: C.flateHoy, border: `1px solid ${C.kant}`, borderRadius: '10px', padding: '12px 14px', margin: '8px 0 0', fontFamily: 'Karla, sans-serif', display: 'grid', gap: '6px' }}>
      <p style={{ ...small, color: C.messing, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.75rem' }}>{L('Metallverdi', 'Metal value')}</p>
      <h4 id={`${idPrefix}-title`} style={{ margin: 0, fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontWeight: 400, fontSize: '1.25rem', color: C.lin }}>
        {L(`Ca. ${formatNOK(mv.value)} i metall`, `About ${formatNOK(mv.value)} in metal`)}
      </h4>
      <p style={small}>
        {L(`${grams} g ${metal}, regnet med spotprisen ${date}. Det er verdien av metallet alene: gjenstanden kan være verdt mer, men en gullsmed som kjøper for omsmelting, betaler ofte mindre. Vekten kan også omfatte annet enn metallet, som stålblad i kniver eller fyll i lysestaker.`,
          `${grams} g of ${metal}, at the spot price on ${date}. This is the value of the metal alone: the item may be worth more, but a jeweller buying for melting often pays less. The weight may also include other parts, such as steel knife blades or filled candlesticks.`)}
      </p>
      <p style={small}>
        <a href="https://metalcharts.org" target="_blank" rel="noopener" style={{ color: C.lin }}>
          {L('Metallpriser fra MetalCharts', 'Metal prices by MetalCharts')}<span className="sr-only"> {L('(åpnes i ny fane)', '(opens in a new tab)')}</span>
        </a>
      </p>
    </section>
  )
}
