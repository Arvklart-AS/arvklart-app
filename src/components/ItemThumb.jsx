import { useId, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StoredImage from './StoredImage'
import { Modal } from './UI'
import { categoryLabel } from '../lib/categories'
import { formatNOK } from '../lib/format'
import { L } from '../lib/lang'

// Bildet av en gjenstand ved en handling (løsningsmetoder, fordelingen, ingen vil ha, dialoger osv.), så det alltid
// er tydelig hvilken gjenstand det gjelder. Et trykk viser bildet stort, med en lenke til gjenstanden.
// size: bredden i piksler (høyden følger 4:3). still: bare bildet, uten knapp, i dialoger der et nytt vindu ville
// lagt seg oppå. fill: fyller bredden (i rutenett). Uten bilde vises kategoriens emoji.
export default function ItemThumb({ item, size = 96, still = false, fill = false }) {
  const { id: estateId } = useParams()
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const cat = item.categories || { emoji: '📦', label: 'Annet' }
  const box = {
    width: fill ? '100%' : `${size}px`, maxWidth: fill ? 'none' : '40vw', aspectRatio: '4 / 3', flex: 'none', padding: 0, overflow: 'hidden',
    display: 'grid', placeItems: 'center', background: '#EEF1E6', border: '1px solid rgba(42, 29, 20, 0.14)', borderRadius: '4px',
  }
  const picture = item.image_url
    ? <StoredImage src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    : <span aria-hidden="true" style={{ fontSize: size > 100 ? '2.25rem' : '1.5rem', lineHeight: 1 }}>{cat.emoji}</span>

  if (still) return <span style={box}>{picture}</span>
  const value = item.estimated_value != null && item.estimated_value !== '' ? ` · ${L('ca.', 'approx.')} ${formatNOK(item.estimated_value)}` : ''
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ ...box, cursor: 'zoom-in' }}
        aria-label={L(`Vis bilde av «${item.title}» i stort format`, `Show «${item.title}» in a large view`)}>
        {picture}
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy={titleId} maxWidth={640}>
          <div style={{ aspectRatio: '4 / 3', background: '#F1F3EA', borderRadius: '4px', overflow: 'hidden', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
            {item.image_url
              ? <StoredImage src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span aria-hidden="true" style={{ fontSize: '4rem' }}>{cat.emoji}</span>}
          </div>
          <h2 id={titleId} style={{ fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontWeight: 400, fontSize: '1.6rem', lineHeight: 1.15, color: '#2A1D14', margin: '0 0 4px' }}>{item.title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#4F463A', margin: '0 0 18px' }}>{cat.emoji} {categoryLabel(cat.label)}{value}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to={`/estate/${estateId}/item/${item.id}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: '48px', padding: '0 1.6em', borderRadius: '999px', background: '#24392A', color: '#F4F2EB', fontWeight: 600, textDecoration: 'none' }}>
              {L('Åpne gjenstanden', 'Open the item')}
            </Link>
            <button type="button" onClick={() => setOpen(false)} style={{ minHeight: '48px', padding: '0 1.6em', borderRadius: '999px', background: 'none', border: '1px solid rgba(42, 29, 20, 0.5)', color: '#2A1D14', fontWeight: 600, fontFamily: 'Karla, sans-serif', fontSize: '0.9375rem', cursor: 'pointer' }}>
              {L('Lukk', 'Close')}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

// Bilde, navn og kategori side om side, med valgfritt innhold under navnet (hvem som vil ha den, mottaker osv.).
// titleAs: overskriftsnivå for navnet når listen trenger det (f.eks. 'h3'); ellers en vanlig tekst.
export function ItemHead({ item, size = 96, still = false, titleAs: Title = 'span', children }) {
  const cat = item.categories || { emoji: '📦', label: 'Annet' }
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0, flex: '1 1 16rem' }}>
      <ItemThumb item={item} size={size} still={still} />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Title style={{ display: 'block', margin: 0, fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontWeight: 400, fontSize: '1.15rem', lineHeight: 1.25, color: '#2A1D14', overflowWrap: 'anywhere' }}>{item.title}</Title>
        <span style={{ fontSize: '0.8125rem', color: '#4F463A' }}>{cat.emoji} {categoryLabel(cat.label)}</span>
        {children}
      </div>
    </div>
  )
}
