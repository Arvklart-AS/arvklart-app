// Hvordan et verdianslag fra estimate-value vises. Ren funksjon, testes i test/lib/valueAdvice.test.js.
// Tar hele svaret fra estimate-value eller valuationRecord(svar): begge har method, estimate, confidence og basis.
//
// Arvklart har ikke tilgang til markedsdata (FINN m.fl. har ikke gitt tilgang), så et AI-anslag er modellens
// egen gjetning. Den bommer mest der signatur, ekthet og etterspørsel avgjør prisen, og der en feil koster mest
// i en fordeling. Derfor:
// - 'instead': ren AI-gjetning (ingen sammenligninger fra familien) som enten er over 10 000 kr, eller er kunst,
//   smykker/ur eller samleobjekter uten tydelig identifikasjon. Beløpet vises ikke og lagres ikke som verdi;
//   familien rådes til å få gjenstanden vurdert eller finne solgte priser selv.
// - 'suggest': beløpet vises (som spenn), med en merknad om takst: bygger på familiens sammenligninger, eller
//   er en tydelig identifisert gjenstand i en av de usikre kategoriene.
// - 'none': spennet vises.
import { formatNOK } from './format.js'
import { L } from './lang.js'

export const APPRAISE_CATEGORIES = ['art', 'jewelry_watches', 'collectibles']
export const APPRAISE_ABOVE_NOK = 10000

const isAppraiseCategory = x => APPRAISE_CATEGORIES.includes(x?.basis?.category_key)

export function valueAdvice(x) {
  if (!x || (x.status && x.status !== 'ok')) return 'none'
  const likely = Number(x.estimate?.likely)
  if (!(likely > 0)) return 'none'
  // Eldre svar uten method er AI-anslag; market_sold / market_asking bygger på familiens sammenligninger
  const isModel = !x.method || x.method === 'model'
  const expensive = likely > APPRAISE_ABOVE_NOK
  const uncertain = isAppraiseCategory(x)
  // Tydelig identifisert: merke og modell lest på gjenstanden eller bekreftet av familien, eller merke med høy sikkerhet
  const specificity = x.basis?.specificity
  const recognizable = specificity === 'precise' || (specificity === 'broad' && x.confidence === 'high')
  if (isModel && (expensive || (uncertain && !recognizable))) return 'instead'
  if (expensive || uncertain) return 'suggest'
  return 'none'
}

// Teksten når beløpet ikke vises ('instead'): overskrift og forklaring
export function appraiseText(x) {
  return isAppraiseCategory(x)
    ? {
        title: L('Kan ha reell verdi – få den vurdert', 'May have real value – get it appraised'),
        body: L(
          'For kunst, smykker og samleobjekter avgjør signatur, ekthet, materiale og etterspørsel prisen, og et AI-anslag kan bomme med mye. Få gjenstanden vurdert av en takstmann eller et auksjonshus, eller finn hva tilsvarende faktisk er solgt for.',
          'For art, jewellery and collectibles the price depends on signature, authenticity, material and demand, and an AI estimate can be far off. Have the item appraised by a valuer or an auction house, or find out what similar items have actually sold for.',
        ),
      }
    : {
        title: L('Kan være verdt mye – sjekk før dere bruker et tall', 'May be worth a lot – check before you use a number'),
        body: L(
          'Dette kan være verdt mer enn 10 000 kr, og da kan et AI-anslag bomme med mye. Finn hva tilsvarende faktisk er solgt for, eller få gjenstanden vurdert av en fagperson.',
          'This may be worth more than NOK 10,000, and then an AI estimate can be far off. Find out what similar items have actually sold for, or have the item assessed by an expert.',
        ),
      }
}

// Merknaden når beløpet vises, men en takst kan gi et sikrere tall ('suggest')
export const suggestText = x => (isAppraiseCategory(x)
  ? L('For kunst, smykker og samleobjekter kan en takst gi et sikrere tall.', 'For art, jewellery and collectibles an appraisal can give a more reliable figure.')
  : L('Over 10 000 kr lønner det seg å få en takst før dere fordeler.', 'Above NOK 10,000 it pays to get an appraisal before you share things out.'))

// Spennet som tekst, f.eks. «kr 300–kr 800». Ett beløp hvis lav og høy er like.
export function formatRange(low, high) {
  if (!(low > 0) || !(high > 0)) return ''
  return low === high ? formatNOK(low) : `${formatNOK(low)}–${formatNOK(high)}`
}
