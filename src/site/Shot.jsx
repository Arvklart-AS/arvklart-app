import { L } from '../lib/lang'

// Skjermbilder fra produktet. Hvert utsnitt har en synlig etikett («Skjermbilde fra demoen» eller
// «Skjermbilde fra Arvklart») og width/height i markupen. Begge er krav fra integrasjonspakken:
// etiketten fordi bildene er statiske utsnitt og ikke levende komponenter, målene fordi siden
// ellers hopper mens bildene lastes.
//
// Skjermbildene viser det norske grensesnittet. Det står i den engelske etiketten, så en engelsk
// leser ikke tror appen er oversatt i bildet. Bildene manipuleres ikke.

export function Cap({ kilde = 'demoen', children, center = false, as: Tag = 'figcaption' }) {
  const label = kilde === 'arvklart'
    ? L('Skjermbilde fra Arvklart', 'Screenshot from Arvklart (Norwegian interface)')
    : L('Skjermbilde fra demoen', 'Screenshot from the demo (Norwegian interface)')
  return (
    <Tag className={center ? 'cap cap--c' : 'cap'}>
      <span className="label">{label}</span>
      <i>{children}</i>
    </Tag>
  )
}

// lazy er av som standard, slik forsiden i integrasjonspakken har det. Et bilde uten lazy har en
// egenstørrelse med én gang, og rammer som krymper til innholdet (.sh__f i produktreisen på mobil)
// får riktig bredde før bildet er lastet. Undersidene setter lazy selv, som i pakken.
export function Img({ src, w, h, alt, lazy = false }) {
  return (
    <img
      src={`/nettsted/${src}`}
      width={w}
      height={h}
      alt={alt}
      {...(lazy ? { loading: 'lazy', decoding: 'async' } : {})}
    />
  )
}

// Ramme rundt et PC-/nettbrettutsnitt, med bildetekst under
export function DeskShot({ src, w, h, alt, kilde, caption, className = 'shotfig', frameStyle }) {
  return (
    <figure className={className}>
      <div className="deskframe" style={frameStyle}><Img src={src} w={w} h={h} alt={alt} /></div>
      <Cap kilde={kilde}>{caption}</Cap>
    </figure>
  )
}

// Ramme rundt et telefonutsnitt, med bildetekst under
export function PhoneShot({ src, w, h, alt, kilde, caption, className = 'shotfig', frameStyle }) {
  return (
    <figure className={className}>
      <div className="phoneframe" style={frameStyle}><Img src={src} w={w} h={h} alt={alt} /></div>
      <Cap kilde={kilde}>{caption}</Cap>
    </figure>
  )
}
