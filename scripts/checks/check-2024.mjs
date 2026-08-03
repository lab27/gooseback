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

const y2024 = films.filter(f => f.fm.year === 2024)
assert(y2024.length === 21, `21 films for 2024, got ${y2024.length}`)
assert(films.filter(f => f.fm.year === 2025).length === 24, '2025 films untouched')

const counts = y2024.reduce((acc, f) => {
  acc[f.fm.program] = (acc[f.fm.program] || 0) + 1
  return acc
}, {})
assert(counts.features === 7, `7 features, got ${counts.features}`)
assert(counts.shorts1 === 9, `9 shorts1, got ${counts.shorts1}`)
assert(counts.shorts2 === 5, `5 shorts2, got ${counts.shorts2}`)

y2024.forEach(({ file, fm }) => {
  assert(!('exectProducers' in fm), `${file} has no exectProducers typo`)
  if (fm.producers) assert(Array.isArray(fm.producers), `${file} producers is a list`)
  ;(fm.stills || []).forEach(s => assert(
    typeof s.still === 'string' && s.still.startsWith('/'),
    `${file} still is an image path, not markup`
  ))
})

// every referenced image resolves on disk
const onDisk = (p) => existsSync(p.replace(/^\/static\//, 'public/').replace(/^\/public\//, 'public/'))
const missing = []
y2024.forEach(({ file, fm }) => {
  const refs = [fm.thumbnail, ...(fm.stills || []).map(s => s.still)].filter(Boolean)
  refs.forEach(r => { if (r.startsWith('/') && !onDisk(r)) missing.push(`${file} -> ${r}`) })
})
if (missing.length) { console.error('MISSING IMAGES:\n' + missing.join('\n')); process.exit(1) }

const ed = frontmatter('content/editions/2024.md')
assert(ed.year === 2024, 'edition year 2024')
assert(ed.sections.map(s => s.program).join(',') === 'features,shorts1,shorts2', '2024 sections')
console.log('PASS')
