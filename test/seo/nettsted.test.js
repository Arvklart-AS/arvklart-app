// Bildene og fontene til de offentlige markedssidene (public/nettsted/, public/fonter/).
//  - Ingen personopplysninger i filene: EXIF/GPS, XMP, IPTC eller kommentarer. Fire av bildene er
//    portretter av ekte personer, og skjermbildene er tatt på noens maskin.
//  - Hvert bilde sidene bruker finnes, og hver fil som ligger der er i bruk (ingen død vekt).
//  - Hvert produktutsnitt har en synlig etikett («Skjermbilde fra demoen» / «… fra Arvklart»).
//    Det er redelighetskravet fra integrasjonspakken: bildene er statiske utsnitt, ikke levende
//    komponenter, og de oppdaterer seg ikke når produktet endrer seg.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = p => readFileSync(new URL(p, root), 'utf8')
const bytes = p => readFileSync(new URL(p, root))
const DIR = 'public/nettsted'

// Kildefilene som kan peke på et bilde
const KILDER = [
  ...readdirSync(new URL('src/site/', root)).map(f => `src/site/${f}`),
  'src/pages/LandingPage.jsx', 'src/pages/HowItWorksPage.jsx', 'src/pages/AboutPage.jsx', 'src/pages/ContactPage.jsx',
]
const kildetekst = KILDER.map(read).join('\n')
const filer = readdirSync(new URL(`${DIR}/`, root)).sort()

// ── metadata i filene ──────────────────────────────────────────────────────────────────────────
// JPEG: APP1 (EXIF/XMP), APP13 (IPTC) og kommentarer kan inneholde sted, kamera og navn
function jpegMetadata(buf) {
  assert.equal(buf.readUInt16BE(0), 0xffd8, 'ikke JPEG')
  const found = []
  for (let i = 2; i < buf.length - 4;) {
    if (buf[i] !== 0xff) break
    const marker = buf[i + 1]
    if (marker === 0xda || marker === 0xd9) break // bildedata starter
    const len = buf.readUInt16BE(i + 2)
    const id = buf.subarray(i + 4, i + 16).toString('latin1')
    if (marker === 0xe1) found.push(id.startsWith('Exif') ? 'EXIF' : id.startsWith('http://ns.adobe.com') ? 'XMP' : 'APP1')
    if (marker === 0xed) found.push('IPTC')
    if (marker === 0xfe) found.push('kommentar')
    i += 2 + len
  }
  return found
}

// WebP: RIFF-beholder med egne EXIF- og XMP-blokker
function webpMetadata(buf) {
  assert.equal(buf.subarray(0, 4).toString('latin1'), 'RIFF', 'ikke RIFF')
  assert.equal(buf.subarray(8, 12).toString('latin1'), 'WEBP', 'ikke WebP')
  const found = []
  for (let i = 12; i + 8 <= buf.length;) {
    const tag = buf.subarray(i, i + 4).toString('latin1')
    const size = buf.readUInt32LE(i + 4)
    if (tag === 'EXIF' || tag === 'XMP ') found.push(tag.trim())
    i += 8 + size + (size & 1)
  }
  return found
}

// PNG: eXIf og tekstblokker
function pngMetadata(buf) {
  assert.equal(buf.subarray(0, 8).toString('latin1'), '\x89PNG\r\n\x1a\n', 'ikke PNG')
  const found = []
  for (let i = 8; i + 8 <= buf.length;) {
    const len = buf.readUInt32BE(i)
    const tag = buf.subarray(i + 4, i + 8).toString('latin1')
    if (['eXIf', 'tEXt', 'iTXt', 'zTXt'].includes(tag)) found.push(tag)
    if (tag === 'IEND') break
    i += 12 + len
  }
  return found
}

test('nettstedets bilder har ingen EXIF, XMP, IPTC eller kommentarer', () => {
  assert.ok(filer.length >= 18, `fant bare ${filer.length} filer i ${DIR}`)
  for (const f of filer) {
    const buf = bytes(`${DIR}/${f}`)
    const meta = f.endsWith('.jpg') || f.endsWith('.jpeg') ? jpegMetadata(buf)
      : f.endsWith('.webp') ? webpMetadata(buf)
        : f.endsWith('.png') ? pngMetadata(buf)
          : null
    assert.ok(meta !== null, `${f}: ukjent filtype – legg til en kontroll før den publiseres`)
    assert.deepEqual(meta, [], `${f} inneholder ${meta.join(', ')}`)
  }
})

test('kontrollen finner metadata i et bilde som har det', () => {
  // minimal JPEG med en EXIF-blokk
  const exif = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10]), Buffer.from('Exif\0\0'), Buffer.alloc(8),
    Buffer.from([0xff, 0xda]),
  ])
  assert.deepEqual(jpegMetadata(exif), ['EXIF'])
})

test('hvert bilde sidene bruker finnes, og hver fil er i bruk', () => {
  // filnavnene står enten i src= eller i en liste (portrettene i LandingPage/AboutPage)
  const brukt = new Set([...kildetekst.matchAll(/['"]([\w.-]+\.(?:webp|jpg|png))['"]/g)].map(m => m[1]))
  // logo-maske.png brukes som CSS-maske, ikke som <img>
  const maske = read('src/site/site.css').match(/--logo:url\(\/nettsted\/([\w.-]+)\)/)
  assert.ok(maske, 'logoen hentes ikke fra /nettsted/ i site.css')
  brukt.add(maske[1])
  for (const f of brukt) assert.ok(filer.includes(f), `${f} brukes, men ligger ikke i ${DIR}`)
  for (const f of filer) assert.ok(brukt.has(f), `${f} ligger i ${DIR}, men brukes ikke`)
})

test('skrifttypene: bare Bodoni Moda selvhostes, og lisensen ligger ved', () => {
  const fonter = readdirSync(new URL('public/fonter/', root)).sort()
  assert.ok(fonter.includes('OFL-bodoni-moda.txt'), 'lisensteksten (SIL OFL 1.1) mangler')
  const css = read('src/site/site.css')
  for (const f of fonter.filter(f => f.endsWith('.woff2'))) assert.ok(css.includes(`/fonter/${f}`), `${f} brukes ikke`)
  // En lokal @font-face med familienavnet «Karla» ville overstyrt appens vekter 300/500/600
  assert.doesNotMatch(css, /@font-face\{[^}]*font-family:'Karla'[^}]*\}/s, 'Karla skal ikke selvhostes her, se docs/ny-offentlig-nettside.md')
})

test('hvert produktutsnitt er merket som skjermbilde', () => {
  const shot = read('src/site/Shot.jsx')
  assert.match(shot, /Skjermbilde fra Arvklart/)
  assert.match(shot, /Skjermbilde fra demoen/)
  // ingen <img> fra /nettsted/ utenom portretter og logoen uten en bildetekst i nærheten
  const sider = ['src/pages/LandingPage.jsx', 'src/pages/HowItWorksPage.jsx', 'src/site/Journey.jsx', 'src/site/Signature.jsx']
  for (const p of sider) assert.match(read(p), /Cap|cap--c|label/, `${p}: mangler etiketter på skjermbildene`)
})

// ── Selskapsopplysninger og produktpåstander ────────────────────────────────────────────────────

test('behandlingsansvarlig: personvernerklæringen og bunnteksten oppgir det samme', () => {
  const company = read('src/pages/OtherPages.jsx').match(/const COMPANY = \{ name: '([^']*)', orgnr: '([^']*)' \}/)
  assert.ok(company, 'fant ikke COMPANY i OtherPages.jsx')
  const [, navn, orgnr] = company
  assert.equal(navn, 'Arvklart AS', 'behandlingsansvarlig mangler eller er endret')
  assert.equal(orgnr, '938 816 085')
  // Bunnteksten bruker harde mellomrom i tallet
  const foot = read('src/site/SiteLayout.jsx')
  assert.ok(foot.includes('Arvklart AS'), 'bunnteksten mangler selskapsnavnet')
  assert.ok(foot.includes(orgnr.replace(/ /g, '&nbsp;')), `bunnteksten mangler org.nr. ${orgnr}`)
})

// Formuleringer som ikke stemte med produktkoden, og som ikke skal krype inn igjen.
// Se docs/ny-offentlig-nettside.md for hva koden faktisk gjør.
const SIDER = ['src/pages/LandingPage.jsx', 'src/pages/HowItWorksPage.jsx', 'src/pages/AboutPage.jsx',
  'src/pages/ContactPage.jsx', 'src/site/Journey.jsx', 'src/site/Faq.jsx']

test('produktpåstander: ingen av de uriktige formuleringene står igjen', () => {
  const tekst = SIDER.map(read).join('\n')
  for (const [feil, hvorfor] of [
    [/hvor mange runder, avtaler dere selv/i, 'antall runder følger av gjenstandene, ikke av en avtale'],
    [/hva bare én vil ha/i, 'det finnes ingen «bare én»-fane i galleriet'],
    [/hva ingen har svart på ennå/i, '«Ingen vil ha» samler også ubesvarte; det finnes ingen egen fane'],
    [/Alle kan foreslå en verdi/i, 'verdiforslag går bare som «Uenig» på et eksisterende KI-anslag'],
    [/Deltakere kan foreslå sin egen verdi/i, 'samme: forutsetter et KI-anslag'],
    [/Ingen frist i løsningen/i, 'familien kan selv sette datoer på oppgaver; Arvklart setter ingen'],
  ]) assert.doesNotMatch(tekst, feil, `${feil} — ${hvorfor}`)
})

test('produktpåstander: de rettede formuleringene står der, på begge språk', () => {
  const how = read('src/pages/HowItWorksPage.jsx')
  // Vekslende runder: administrator setter rekkefølgen, og rundene snur
  assert.match(how, /Administrator setter rekkefølgen/)
  assert.match(how, /The administrator sets the order/)
  // Filtrene er de som finnes i EstatePage.jsx
  assert.match(how, /dine egne svar, på hva flere har sagt ja til/)
  assert.match(how, /Filteret samler både det alle har sagt nei takk til, og det ingen har rukket å svare på/)
  // Verdiforslag forutsetter et KI-anslag (vote_item_value), og står slik på begge språk
  assert.match(how, /Er anslaget satt, kan hver deltaker si seg enig eller foreslå et annet beløp/)
  assert.match(how, /Once an estimate is set, each participant can agree with it or suggest a different figure/)
  // Fordelingsverdien settes av administrator (set_agreed_values)
  assert.match(how, /Fordelingsverdien, som fordelingen regnes ut fra, settes av den som administrerer boet/)
})

test('alle fire sidene er oversatt: ingen av dem mangler L()', () => {
  for (const f of SIDER) {
    const s = read(f)
    assert.match(s, /\bL\(/, `${f}: ingen oversettelser`)
    assert.ok((s.match(/\bL\(/g) || []).length > 5, `${f}: mistenkelig få oversettelser`)
  }
  // Rotelementet merkes med gjeldende språk, så engelsk innhold ikke står under lang="nb"
  assert.match(read('src/site/SiteLayout.jsx'), /lang=\{isEn\(\) \? 'en' : 'nb'\}/)
})

test('ordskiftet kan stanses (WCAG 2.2.2), og knappen skjules ved redusert bevegelse', () => {
  const rot = read('src/site/Rotator.jsx')
  assert.match(rot, /export function RotatorPause/)
  assert.match(rot, /aria-pressed=\{paused\}/)
  assert.match(rot, /Pause ordskiftet/)
  assert.match(rot, /Pause the word animation/)
  assert.match(read('src/pages/LandingPage.jsx'), /<RotatorPause paused=\{paused\} onToggle=/)
  const css = read('src/site/site.css')
  assert.match(css, /\.ak \.ordpause\{/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\{\n\s*\.ak \.ordpause\{display:none\}/)
})

test('color-mix har statisk fallback, og margene settes uttrykkelig', () => {
  const css = read('src/site/site.css')
  // Hver color-mix-deklarasjon skal ha en fast verdi for samme variabel rett foran
  for (const v of ['--ordfarge', '--skall', '--skallkant', '--skallmork']) {
    const faste = new RegExp(`${v}:#[0-9A-Fa-f]{6};`)
    assert.match(css, faste, `${v} mangler fallback uten color-mix()`)
  }
  assert.match(css, /\.ak dl,\.ak dt,\.ak dd,\.ak figure/, 'margene settes ikke uttrykkelig')
})
