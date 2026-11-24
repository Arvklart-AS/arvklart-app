// Spotpris for rent sølv og gull i NOK per gram, med datoen prisen gjelder. Lages av scripts/metal-price.mjs
// (MetalCharts' API, gratisnivået: kommersiell bruk tillatt mot lenken «Metallpriser fra MetalCharts» ved tallet).
// Ikke skriv inn tall for hånd, og ikke kopier dem fra nettsiden: det er bare API-et vilkårene tillater.
// Uten pris (null), eller med pris eldre enn 60 dager, vises ingen metallverdi (src/lib/metalValue.js).
export const METAL_PRICES = {
  date: '2026-11-24',
  currency: 'NOK',
  unit: 'g',
  silver: 13.22,
  gold: 1139.87,
}
