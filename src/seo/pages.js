// Markedssidene (egne React-komponenter) som kan indekseres. Guidene ligger i content/guider/*.md
// (src/seo/content.js). Sammen er de registeret over offentlige sider (publicRegistry i content.js ved bygging,
// src/seo/registry.js i nettleseren), som metadata, forhåndsrendering, sitemap.xml og RouteMeta bygger på.
//
// Ny markedsside: legg den inn her med prerender: true, og legg ruten inn i App.jsx. Ingen endring i vercel.json
// eller sitemap: «/<side>» omskrives generelt til «/<side>.html», som byggesteget lager, og sitemap.xml lages ved
// bygging. test/seo/seo.test.js sjekker at rutene i App.jsx, reglene i vercel.json og registeret stemmer.
// Alle andre stier (appen på /app og /estate/…, innlogging, invitasjoner) får noindex; ukjente adresser gir 404.
// Ren data uten nettleser-API-er: brukes både i nettleseren og i byggesteget (src/seo/vitePlugin.js).

export const SITE_URL = 'https://www.arvklart.no'
export const SITE_NAME = 'Arvklart'
export const OG_IMAGE = '/hero-bg.jpg'
export const CONTACT_EMAIL = 'admin@arvklart.no'

export const DEFAULT_META = {
  title: 'Arvklart — Arvefordeling gjort enklere',
  title_en: 'Arvklart — Inheritance distribution made simpler',
  description: 'Arvklart hjelper familier med å fordele arv på en ryddig, inkluderende og rettferdig måte.',
  description_en: 'Arvklart helps families distribute an inheritance in an orderly, inclusive and fair way.',
}

// De fire markedssidene fra integrasjonspakken (19.11.2026) finnes på norsk og engelsk gjennom
// L() i src/lib/lang.js, som resten av appen. Begge språk ligger på samme adresse — språket følger
// kontoen og hs_lang, ikke URL-en — så det finnes ingen egne språkadresser. Derfor:
//   - canonical er den ene adressen, og den er lik for begge språk
//   - ingen hreflang: det ville krevd adresser per språk, og de finnes ikke
//   - den forhåndsrendrede HTML-en, altså versjonen søkemotorene leser, er norsk (og:locale nb_NO)
// RouteMeta bytter tittel og beskrivelse i nettleseren etter språkvalget.
// Se docs/ny-offentlig-nettside.md for hva som skal til for indekserbar engelsk.
export const PUBLIC_PAGES = [
  {
    path: '/',
    title: 'Fordeling av innbo ved arv | Arvklart',
    title_en: 'Sharing out household contents in an inheritance | Arvklart',
    description: 'Samle bilder av innboet, se familiens ønsker og dokumenter fordelingen i Arvklart. Prøv den offentlige demoen uten registrering.',
    description_en: 'Gather photos of the household contents, see the family’s wishes and document the division in Arvklart. Try the public demo without signing up.',
    prerender: true,
    sitemap: true,
    organization: true,
    website: true,
    video: true,
  },
  {
    path: '/slik-fungerer-det',
    title: 'Slik fordeler dere innbo med Arvklart',
    title_en: 'How you share out household contents with Arvklart',
    description: 'Én person oppretter boet og inviterer familien. Dere samler gjenstandene, legger inn ønsker og dokumenterer fordelingen dere blir enige om.',
    description_en: 'One person creates the estate and invites the family. You gather the items, register wishes and document the division you agree on.',
    prerender: true,
    sitemap: true,
  },
  {
    path: '/om-oss',
    title: 'Om oss | Arvklart',
    title_en: 'About us | Arvklart',
    description: 'Teamet bak Arvklart. Ideen oppsto i en familie som bodde spredt og skulle fordele gjenstander fra morfaren. Fire personer utvikler verktøyet videre.',
    description_en: 'The team behind Arvklart. The idea came from a family living far apart who were sharing out belongings from their grandfather. Four people are building it.',
    prerender: true,
    sitemap: true,
  },
  {
    path: '/kontakt',
    title: 'Kontakt | Arvklart',
    title_en: 'Contact | Arvklart',
    description: 'Spør oss om Arvklart, eller meld interesse for å prøve verktøyet med din egen familie. Skriv til admin@arvklart.no.',
    description_en: 'Ask us about Arvklart, or register interest in trying the tool with your own family. Write to admin@arvklart.no.',
    prerender: true,
    sitemap: true,
  },
  {
    path: '/personvern',
    title: 'Personvernerklæring og vilkår — Arvklart',
    title_en: 'Privacy policy and terms — Arvklart',
    description: 'Personvernerklæringen beskriver hvordan Arvklart behandler personopplysninger om deg som bruker, og vilkårene for bruk av tjenesten.',
    description_en: 'The privacy policy describes how Arvklart processes personal data about you as a user, and the terms of use for the service.',
    prerender: false,
    sitemap: true,
  },
  {
    // Hele veiviseren står i HTML-en (src/seo/veiviserHost.js). Tittel og beskrivelse er satt sammen av tekst som
    // står på siden: H1 («Arveveiviser: fra dødsfall til fordelt bo …») og innledningen. Primært søkeord: arveveiviser.
    // Metadata vektlegger prosessoversikten, begrepene og de offentlige ressursene; arveberegningen markedsføres ikke
    // her før den er kvalitetssikret.
    path: '/veiviser',
    title: 'Arveveiviser: fra dødsfall til fordelt bo — Arvklart',
    title_en: 'Inheritance guide: from death to a distributed estate — Arvklart',
    description: 'Arveveiviser: se hva som skjer i hver fase av arveoppgjøret, fra dødsfall til fordelt bo, hva sentrale begreper betyr og hvor du finner offentlige ressurser.',
    description_en: 'Inheritance guide: see what happens in each phase of settling an estate, from death to a distributed estate, what key terms mean and where to find public resources.',
    prerender: true,
    sitemap: true,
  },
]

export const pageFor = (path) => PUBLIC_PAGES.find(p => p.path === path) || null
export const canonicalUrl = (path) => SITE_URL + path
export const canonicalOf = (page) => page.canonical || canonicalUrl(page.path)
export const prerenderedPaths = () => PUBLIC_PAGES.filter(p => p.prerender).map(p => p.path)
// Filen en forhåndsrendret side skrives til: «/» er index.html (Vercel serverer den på «/»), ellers <sti>.html
// (/guider/<slug> blir guider/<slug>.html). Appens skall (app-rutene i vercel.json) ligger i SHELL_FILE.
export const prerenderFile = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`)
export const SHELL_FILE = 'shell.html'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Organization: bare opplysninger som står på nettstedet (navn, adresse, e-post på /kontakt).
// WebSite (nettstedsnavn i søkeresultatene): bare på forsiden på domenets rot, som Google krever.
export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
})
export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  email: CONTACT_EMAIL,
})

// VideoObject for produktfilmen i signaturen på forsiden. headTags() gjelder den forhåndsrendrede
// norske versjonen, som er den søkemotorene leser, så det er den norske filmen som beskrives.
//
// Beskrivelsen er den samme teksten som ligger skjult ved filmen (aria-describedby i
// src/site/Signature.jsx). Står de to ulikt, beskriver strukturerte data noe annet enn siden.
//
// uploadDate er påkrevd av Google. Den settes til datoen filmen ble lagt inn, og må oppdateres
// hvis filmen byttes. Dette gir ingen garanti for et videoresultat i Google: filmen er ikke
// sidens hovedinnhold, og det er et krav Google vekter tungt.
export const VIDEO = {
  fil: '/nettsted/forsidefilm-no.mp4',
  plakat: '/nettsted/forsidefilm-no-plakat.webp',
  lastetOpp: '2026-11-23',
  sekunder: 47,
}
export const videoJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Slik fordeler dere innbo med Arvklart',
  description: 'Filmen viser eksempelboet i Arvklart: en gjenstand legges inn med bilde, navn og kategori; familien får én felles oversikt over gjenstandene med verdianslag og hvem som ønsker hva; hver arving kan skrive hvorfor en gjenstand betyr noe; og til slutt velger administratoren hvem som skal ha den. Filmen er uten lyd.',
  thumbnailUrl: `${SITE_URL}${VIDEO.plakat}`,
  uploadDate: VIDEO.lastetOpp,
  duration: `PT${VIDEO.sekunder}S`,
  contentUrl: `${SITE_URL}${VIDEO.fil}`,
})

// <head>-tagger for skallet (index.html), som serveres på alle stier: ingen canonical og ingen og:url.
export function defaultHeadTags() {
  return [
    `<title>${esc(DEFAULT_META.title)}</title>`,
    `<meta name="description" content="${esc(DEFAULT_META.description)}" />`,
    ...sharedTags(DEFAULT_META),
  ].join('\n    ')
}

// Guide: Article (forfatter, datoer, utgiver) og BreadcrumbList (Forside › guiden). Bare opplysninger fra guiden.
export const articleJsonLd = (g) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: g.title,
  description: g.description,
  author: { '@type': g.author === SITE_NAME ? 'Organization' : 'Person', name: g.author },
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  datePublished: g.published,
  ...(g.updated ? { dateModified: g.updated } : {}),
  mainEntityOfPage: canonicalOf(g),
  image: SITE_URL + (g.og_image || OG_IMAGE),
  inLanguage: 'nb-NO',
})
export const breadcrumbJsonLd = (g) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Forside', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: g.title, item: canonicalOf(g) },
  ],
})

// JSON-LD og sidedata er datablokker, ikke skript: de kjøres ikke og stoppes ikke av CSP-en (script-src 'self').
// «<» kodes så teksten aldri kan avslutte blokken.
export const dataBlock = (type, data, id) => `<script type="${type}"${id ? ` id="${id}"` : ''}>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

// <head>-tagger for en forhåndsrendret offentlig side (norsk, som er versjonen søkemotorene ser).
export function headTags(page) {
  const url = canonicalOf(page)
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    ...sharedTags(page),
  ]
  const ld = (data) => dataBlock('application/ld+json', data)
  if (page.website) tags.push(ld(websiteJsonLd()))
  if (page.organization) tags.push(ld(organizationJsonLd()))
  if (page.video) tags.push(ld(videoJsonLd()))
  if (page.kind === 'guide') {
    tags.push(`<meta property="article:published_time" content="${esc(page.published)}" />`)
    if (page.updated) tags.push(`<meta property="article:modified_time" content="${esc(page.updated)}" />`)
    if (page.schema !== 'none') tags.push(ld(articleJsonLd(page)), ld(breadcrumbJsonLd(page)))
  }
  return tags.join('\n    ')
}

// sitemap.xml fra registeret: bare publiserte, indekserbare sider med sitemap: true. lastmod bare når siden har en
// faktisk endringsdato (guidene: updated eller published) – aldri byggetidspunktet.
export function sitemapXml(pages) {
  const urls = pages.filter(p => p.sitemap && (p.kind !== 'guide' || p.status === 'published')).map(p => {
    const loc = canonicalOf(p)
    if (!loc.startsWith(`${SITE_URL}/`)) throw new Error(`sitemap: ${loc} er ikke på ${SITE_URL}`)
    return `  <url><loc>${esc(loc)}</loc>${p.lastmod ? `<lastmod>${esc(p.lastmod)}</lastmod>` : ''}</url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

function sharedTags(meta) {
  const image = SITE_URL + (meta.og_image || OG_IMAGE)
  return [
    `<meta property="og:type" content="${meta.kind === 'guide' ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="nb_NO" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ]
}
