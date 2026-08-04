import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { parse } from 'yaml'
import { allFilms, assertFolderMatchesYear } from './_films.mjs'

const frontmatter = (path) => {
  const raw = readFileSync(path, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error(`no frontmatter in ${path}`)
  return parse(m[1])
}
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1) } }

// currentEdition moves forward every festival, so assert only that it is set and points
// at an edition that exists — never at a specific year, which would fail on every rollover.
const settings = parse(readFileSync('content/settings.yml', 'utf8'))
assert(Number.isInteger(settings.currentEdition), 'currentEdition must be an integer year')
assert(
  existsSync(`content/editions/${settings.currentEdition}.md`),
  `currentEdition is ${settings.currentEdition} but content/editions/${settings.currentEdition}.md does not exist`
)

// 2025 is a closed edition; its content must stay intact regardless of which year is current.
const ed = frontmatter('content/editions/2025.md')
assert(ed.year === 2025, 'edition year is 2025')
// isAnnounced is deliberately NOT asserted here. It gates the film grid only for the
// current and future editions; once an edition is archived the programme page ignores it,
// so toggling the flag on a past year is harmless and should not fail this check.
assert(typeof ed.dates === 'string' && ed.dates.length > 0, 'edition has dates')
assert(typeof ed.announcement === 'string' && ed.announcement.includes('2026'), 'announcement carries the 2026 teaser')
assert(Array.isArray(ed.sections) && ed.sections.length === 4, `2025 has 4 sections, got ${ed.sections?.length}`)
assert(ed.sections.map(s => s.program).join(',') === 'features,shorts1,helsingborg,music', 'section programs in order')
ed.sections.forEach(s => assert(s.title && s.description, `section ${s.program} has title and description`))

// Filtered by year, not a bare directory count, so this check stays valid
// after Tasks 5 and 6 add the 2024 and 2023 films to the same folder.
// Films live at content/films/<year>/<slug>.md — allFilms() recurses the year folders.
const films = allFilms().map(f => ({ file: f.file, fm: f.data }))

assert(films.every(f => Number.isInteger(f.fm.year)), 'every film has an integer year')
const y2025 = films.filter(f => f.fm.year === 2025)
assert(y2025.length === 24, `24 films for 2025, got ${y2025.length}`)

// The folder and the `year` field must agree. The CMS writes the path from
// `path: '{{year}}/{{slug}}'`, so changing a film's year should move the file — if it ever
// fails to, the site keeps rendering from the field while the tree says otherwise.
const drift = []
assertFolderMatchesYear(drift)
if (drift.length) { console.error('FOLDER/YEAR DRIFT:\n' + drift.map(d => '  - ' + d).join('\n')); process.exit(1) }

console.log('PASS')
