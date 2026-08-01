import { readFileSync, readdirSync } from 'node:fs'
import { parse } from 'yaml'

const frontmatter = (path) => {
  const raw = readFileSync(path, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error(`no frontmatter in ${path}`)
  return parse(m[1])
}
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

const settings = parse(readFileSync('content/settings.yml', 'utf8'))
assert(settings.currentEdition === 2025, 'currentEdition is 2025')

const ed = frontmatter('content/editions/2025.md')
assert(ed.year === 2025, 'edition year is 2025')
assert(ed.isAnnounced === true, 'edition is announced')
assert(typeof ed.dates === 'string' && ed.dates.length > 0, 'edition has dates')
assert(typeof ed.announcement === 'string' && ed.announcement.includes('2026'), 'announcement carries the 2026 teaser')
assert(Array.isArray(ed.sections) && ed.sections.length === 4, `2025 has 4 sections, got ${ed.sections?.length}`)
assert(ed.sections.map(s => s.program).join(',') === 'features,shorts1,helsingborg,music', 'section programs in order')
ed.sections.forEach(s => assert(s.title && s.description, `section ${s.program} has title and description`))

// Filtered by year, not a bare directory count, so this check stays valid
// after Tasks 5 and 6 add the 2024 and 2023 films to the same folder.
const films = readdirSync('content/films')
  .filter(f => f.endsWith('.md'))
  .map(f => ({ file: f, fm: frontmatter(`content/films/${f}`) }))

assert(films.every(f => Number.isInteger(f.fm.year)), 'every film has an integer year')
const y2025 = films.filter(f => f.fm.year === 2025)
assert(y2025.length === 24, `24 films for 2025, got ${y2025.length}`)
console.log('PASS')
