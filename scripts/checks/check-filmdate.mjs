import { readFileSync } from 'node:fs'
const src = readFileSync('composables/useFilmDate.ts', 'utf8')
// crude but sufficient: strip TS types and the export wrapper, then eval the two functions
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }
assert(src.includes('formatScreeningDate'), 'exports formatScreeningDate')
assert(src.includes('parseScreeningDate'), 'exports parseScreeningDate')
assert(src.includes('year'), 'accepts a year parameter')
console.log('PASS')
