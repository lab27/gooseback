import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { parse } from 'yaml'

const frontmatter = (path) => {
  const raw = readFileSync(path, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error(`no frontmatter in ${path}`)
  return parse(m[1])
}
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const films = readdirSync('content/films')
  .filter(f => f.endsWith('.md'))
  .map(f => ({ file: f, fm: frontmatter(`content/films/${f}`) }))

const y2023 = films.filter(f => f.fm.year === 2023)
assert(y2023.length === 8, `8 films for 2023, got ${y2023.length}`)
assert(films.length === 53, `53 films total, got ${films.length}`)
assert(films.filter(f => f.fm.year === 2024).length === 21, '2024 intact')
assert(films.filter(f => f.fm.year === 2025).length === 24, '2025 intact')

y2023.forEach(({ file, fm }) => {
  assert(!('producer' in fm), `${file} singular producer normalized away`)
  assert(!('execProducer' in fm), `${file} singular execProducer normalized away`)
  if (fm.producers) assert(Array.isArray(fm.producers) && fm.producers.every(p => 'producer' in p), `${file} producers shape`)
})

const onDisk = (p) => existsSync(p.replace(/^\/static\//, 'public/').replace(/^\/public\//, 'public/'))
const missing = []
y2023.forEach(({ file, fm }) => {
  const refs = [fm.thumbnail, ...(fm.stills || []).map(s => s.still)].filter(Boolean)
  refs.forEach(r => { if (r.startsWith('/') && !onDisk(r)) missing.push(`${file} -> ${r}`) })
})
if (missing.length) { console.error('MISSING IMAGES:\n' + missing.join('\n')); process.exit(1) }

const ed = frontmatter('content/editions/2023.md')
assert(ed.year === 2023, 'edition year 2023')
assert(Array.isArray(ed.sections) && ed.sections.length === 0, '2023 has no sections')
console.log('PASS')
